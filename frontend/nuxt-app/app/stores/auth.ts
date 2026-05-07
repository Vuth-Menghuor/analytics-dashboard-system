import { AxiosError } from 'axios'
import { api } from '~/services/api'

type AuthUser = {
  id: number
  name: string
  email: string
  role: 'manager' | 'partner' | 'visitor'
}

type LoginPayload = {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = useCookie<string | null>('auth_token', { sameSite: 'lax' })
  const userCookie = useCookie<AuthUser | null>('auth_user', { sameSite: 'lax' })

  const user = ref<AuthUser | null>(userCookie.value)
  const isLoading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => Boolean(token.value && user.value))

  const roleDashboardPath = computed(() => {
    if (user.value?.role === 'manager') {
      return '/manager/dashboard'
    }

    if (user.value?.role === 'partner') {
      return '/partner/dashboard'
    }

    return '/visitor/dashboard'
  })

  const setSession = (nextToken: string, nextUser: AuthUser) => {
    token.value = nextToken
    user.value = nextUser
    userCookie.value = nextUser
  }

  const refreshSession = () => {
    if (userCookie.value) {
      user.value = userCookie.value
    }
  }

  const dashboardPathFor = (nextUser: AuthUser | null) => {
    if (nextUser?.role === 'manager') {
      return '/manager/dashboard'
    }

    if (nextUser?.role === 'partner') {
      return '/partner/dashboard'
    }

    return '/visitor/dashboard'
  }

  const login = async (payload: LoginPayload) => {
    isLoading.value = true
    error.value = ''

    try {
      const { data } = await api.post<{ token: string; user: AuthUser }>('/login', payload)

      setSession(data.token, data.user)

      return data.user
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 422) {
        error.value = 'Email or password is incorrect.'
      } else {
        error.value = 'Unable to sign in right now.'
      }

      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await api.post('/logout')
      }
    } finally {
      token.value = null
      user.value = null
      userCookie.value = null
    }
  }

  return {
    dashboardPathFor,
    error,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshSession,
    roleDashboardPath,
    user
  }
})
