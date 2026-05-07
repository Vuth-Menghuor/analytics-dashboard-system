export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return
  }

  const auth = useAuthStore()
  auth.refreshSession()

  const allowedRoles = to.meta.roles as string[] | undefined

  if (!allowedRoles?.length || !auth.user) {
    return
  }

  if (!allowedRoles.includes(auth.user.role)) {
    return navigateTo(auth.roleDashboardPath)
  }
})
