// plugins/pinia.ts
import { defineNuxtPlugin } from '#app';
import { createPinia } from 'pinia';
import { useDataStore } from '~/stores/data-store';

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia();
  nuxtApp.vueApp.use(pinia);

  // Initialize store from localStorage on client side
  if (import.meta.client) {
    const dataStore = useDataStore(pinia);
    dataStore.initializeFromLocalStorage();
  }
});
