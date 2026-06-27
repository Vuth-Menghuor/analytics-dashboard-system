export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return
  }

  if (['/', '/login', '/signup', '/privacy', '/terms', '/visitor/dashboard'].includes(to.path)) {
    return
  }

  const auth = useAuthStore()
  auth.refreshSession()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
