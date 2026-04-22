import { ensureServerLocalStorage } from "../utils/ensure-local-storage";

export default defineNitroPlugin(() => {
  ensureServerLocalStorage();
});
