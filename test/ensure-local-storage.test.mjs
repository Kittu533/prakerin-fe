import test from "node:test";
import assert from "node:assert/strict";
import jiti from "../node_modules/jiti/lib/jiti.mjs";

const loadModule = () => jiti(import.meta.url, { moduleCache: false });

test("installs a storage-compatible localStorage when getItem is missing", async () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: {},
  });

  try {
    const { ensureServerLocalStorage } = await loadModule()("../server/utils/ensure-local-storage.ts");
    ensureServerLocalStorage();

    assert.equal(typeof globalThis.localStorage.getItem, "function");
    assert.equal(typeof globalThis.localStorage.setItem, "function");

    globalThis.localStorage.setItem("foo", "bar");
    assert.equal(globalThis.localStorage.getItem("foo"), "bar");
    globalThis.localStorage.removeItem("foo");
    assert.equal(globalThis.localStorage.getItem("foo"), null);
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, "localStorage", originalDescriptor);
    } else {
      delete globalThis.localStorage;
    }
  }
});
