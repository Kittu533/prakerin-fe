/**
 * Error handling composable for API requests
 * Provides consistent error handling across the application
 */

export function useApiErrorHandler() {
  const toast = useToast()

  function handleApiError(error: any, context: string = 'API') {
    let errorMessage = 'Terjadi kesalahan yang tidak diketahui'
    
    if (error?.response) {
      const status = error.response.status
      const data = error.response.data
      
      switch (status) {
        case 400:
          errorMessage = data?.message || 'Permintaan tidak valid'
          break
        case 401:
          errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.'
          break
        case 403:
          errorMessage = 'Anda tidak memiliki izin untuk mengakses resource ini'
          break
        case 404:
          errorMessage = 'Data tidak ditemukan'
          break
        case 429:
          errorMessage = 'Terlalu banyak permintaan. Coba lagi nanti.'
          break
        case 500:
          errorMessage = 'Terjadi kesalahan pada server. Silakan coba lagi.'
          break
        default:
          errorMessage = data?.message || `HTTP ${status}: ${error.response.statusText}`
      }
    } else if (error?.message) {
      errorMessage = error.message
    }

    console.error(`[${context}] Error:`, error)
    
    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'red'
    })

    return errorMessage
  }

  return {
    handleApiError
  }
}