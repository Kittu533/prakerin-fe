import axios from 'axios'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    
    const api = axios.create({
        baseURL: config.public.apiUrl,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    // Add request interceptor for auth token
    api.interceptors.request.use((config) => {
        const token = useCookie('token').value
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    return {
        provide: {
            axios: api
        }
    }
})
