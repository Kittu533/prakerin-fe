import {
  appendResponseHeader,
  createError,
  defineEventHandler,
  getMethod,
  getRequestHeaders,
  getRequestURL,
  readRawBody,
  setResponseHeader,
  setResponseStatus,
} from "h3";

const hopByHopHeaders = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const targetBase = String(config.apiProxyTarget || "").replace(/\/$/, "");

  if (!targetBase) {
    throw createError({
      statusCode: 500,
      statusMessage: "API proxy target is not configured",
    });
  }

  const requestUrl = getRequestURL(event);
  const proxiedPath = requestUrl.pathname.replace(/^\/api\/?/, "");
  const targetUrl = `${targetBase}/${proxiedPath}${requestUrl.search}`;
  const method = getMethod(event);

  const headers = new Headers();
  for (const [key, value] of Object.entries(getRequestHeaders(event))) {
    const normalizedKey = key.toLowerCase();
    if (!hopByHopHeaders.has(normalizedKey) && value) {
      headers.set(key, value);
    }
  }

  const body = ["GET", "HEAD"].includes(method)
    ? undefined
    : await readRawBody(event, false);
  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
  });

  setResponseStatus(event, response.status, response.statusText);

  response.headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    if (hopByHopHeaders.has(normalizedKey)) {
      return;
    }

    if (normalizedKey === "set-cookie") {
      appendResponseHeader(event, key, value);
      return;
    }

    setResponseHeader(event, key, value);
  });

  return new Uint8Array(await response.arrayBuffer());
});
