import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  if (import.meta.client) {
    const token = useCookie<string | null>('auth_token').value

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})
