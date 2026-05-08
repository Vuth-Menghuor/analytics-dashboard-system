import axios from 'axios'

export const api = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const runtimeConfig = useRuntimeConfig()

  config.baseURL = runtimeConfig.public.apiBaseUrl

  if (import.meta.client) {
    const token = useCookie<string | null>('auth_token').value

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})
