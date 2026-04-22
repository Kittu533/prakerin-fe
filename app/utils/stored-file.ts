import { useRuntimeConfig } from "#imports";

export function normalizeStoredFileRef(value?: string | null): string | undefined {
  const normalized = String(value || "").trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function buildStoredFileUrl(fileRef: string): string {
  if (/^https?:\/\//i.test(fileRef)) {
    return fileRef;
  }

  const config = useRuntimeConfig();
  const apiUrl = String(config.public.apiUrl || "").replace(/\/+$/, "");
  const cleanedRef = fileRef.replace(/^\/+/, "");
  const isApiDownloadPath = /^api\/files\?/i.test(cleanedRef);

  if (!apiUrl) {
    return isApiDownloadPath ? `/${cleanedRef}` : `/api/files?ref=${encodeURIComponent(cleanedRef)}`;
  }

  if (isApiDownloadPath) {
    const baseOrigin = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
    return `${baseOrigin}/${cleanedRef}`;
  }

  return `${apiUrl}/files?ref=${encodeURIComponent(cleanedRef)}`;
}

export function resolveStoredFileUrl(
  record: Record<string, unknown>,
  pathField: string,
  downloadField = `${pathField}_download_url`,
): string | undefined {
  const directUrl = normalizeStoredFileRef(record[downloadField] as string | undefined);
  if (directUrl) {
    return /^https?:\/\//i.test(directUrl) ? directUrl : buildStoredFileUrl(directUrl);
  }

  const fileRef = normalizeStoredFileRef(record[pathField] as string | undefined);
  return fileRef ? buildStoredFileUrl(fileRef) : undefined;
}
