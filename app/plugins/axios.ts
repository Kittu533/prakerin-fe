import axios from "axios";
import { useGlobalLoading } from "~/composables/use-global-loading";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const { showLoading, hideLoading } = useGlobalLoading();

  const api = axios.create({
    baseURL: config.public.apiUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor
  api.interceptors.request.use(
    (config) => {
      // Show loading spinner for API requests
      showLoading();

      const token = useCookie("token").value;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      hideLoading();
      return Promise.reject(error);
    },
  );

  // Add response interceptor
  api.interceptors.response.use(
    (response) => {
      hideLoading();
      return response;
    },
    (error) => {
      hideLoading();
      return Promise.reject(error);
    },
  );

  return {
    provide: {
      axios: api,
    },
  };
});
