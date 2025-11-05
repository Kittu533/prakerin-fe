import { ref } from 'vue';

const serviceError = ref(false);
export function useErrorService() {

  function setServiceError(set: boolean) {
    serviceError.value = set;

  }

  return {
    serviceError,
    setServiceError,
  };
}
