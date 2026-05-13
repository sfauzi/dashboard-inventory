export default defineNuxtRouteMiddleware(async () => {
  // Skip di server-side
  if (process.server) {
    return
  }

  try {
    const isAuth = localStorage.getItem('is_authenticated')

    if (isAuth) {
      return navigateTo('/dashboard')
    }
  } catch (error) {
    console.error('Guest middleware error:', error)
  }
})