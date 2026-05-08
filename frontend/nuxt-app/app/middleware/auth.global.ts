export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return
  }

  if (to.path === '/login' || to.path === '/signup') {
    return
  }

  const auth = useAuthStore()
  auth.refreshSession()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
