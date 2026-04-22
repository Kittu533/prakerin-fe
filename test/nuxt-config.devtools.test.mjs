import test from "node:test";
import assert from "node:assert/strict";
import jiti from "../node_modules/jiti/lib/jiti.mjs";

const loadConfig = async (nodeEnv, enableDevtools) => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousEnableDevtools = process.env.NUXT_ENABLE_DEVTOOLS;

  process.env.NODE_ENV = nodeEnv;
  if (enableDevtools === undefined) {
    delete process.env.NUXT_ENABLE_DEVTOOLS;
  } else {
    process.env.NUXT_ENABLE_DEVTOOLS = enableDevtools;
  }
  globalThis.defineNuxtConfig = (config) => config;

  const load = jiti(import.meta.url, { moduleCache: false });

  try {
    const mod = await load("../nuxt.config.ts");
    return mod.default ?? mod;
  } finally {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }

    if (previousEnableDevtools === undefined) {
      delete process.env.NUXT_ENABLE_DEVTOOLS;
    } else {
      process.env.NUXT_ENABLE_DEVTOOLS = previousEnableDevtools;
    }

    delete globalThis.defineNuxtConfig;
  }
};

test("disables Nuxt devtools outside development", async () => {
  const config = await loadConfig("production");
  assert.equal(config.devtools.enabled, false);
});

test("disables Nuxt devtools in development by default", async () => {
  const config = await loadConfig("development");
  assert.equal(config.devtools.enabled, false);
});

test("allows explicitly enabling Nuxt devtools in development", async () => {
  const config = await loadConfig("development", "true");
  assert.equal(config.devtools.enabled, true);
});
