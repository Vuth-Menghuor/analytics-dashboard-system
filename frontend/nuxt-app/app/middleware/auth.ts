export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) {
    return
  }

  const auth = useAuthStore()
  auth.refreshSession()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
