type StorageLike = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem" | "clear" | "key"
> & { readonly length: number };

const createMemoryStorage = (): StorageLike => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
  };
};

export const ensureServerLocalStorage = () => {
  const currentStorage = globalThis.localStorage;

  if (currentStorage && typeof currentStorage.getItem === "function") {
    return currentStorage;
  }

  const storage = createMemoryStorage();
  globalThis.localStorage = storage as Storage;
  return storage;
};
