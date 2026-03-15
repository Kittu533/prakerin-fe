import { ref, readonly } from "vue";

const isLoading = ref(false);
let requestCount = 0;

export const useGlobalLoading = () => {
  const showLoading = () => {
    requestCount++;
    if (requestCount > 0) {
      isLoading.value = true;
    }
  };

  const hideLoading = () => {
    requestCount = Math.max(0, requestCount - 1);
    if (requestCount === 0) {
      // Small delay to prevent flickering on fast subsequent requests
      setTimeout(() => {
        if (requestCount === 0) {
          isLoading.value = false;
        }
      }, 300);
    }
  };

  const forceHide = () => {
    requestCount = 0;
    isLoading.value = false;
  };

  return {
    isLoading: readonly(isLoading),
    showLoading,
    hideLoading,
    forceHide,
  };
};
