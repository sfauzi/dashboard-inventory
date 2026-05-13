export default defineNuxtRouteMiddleware(async (to) => {
  // Skip di server-side
  if (process.server) {
    return
  }

  // Halaman yang tidak memerlukan auth
  const publicPages = ['/login']

  // Cek apakah halaman saat ini adalah public page
  const isPublicPage = publicPages.includes(to.path)

  try {
    // Cek dari localStorage
    const isAuth = localStorage.getItem('is_authenticated')
    const userRole = localStorage.getItem('dashboard_role')

    // Jika belum login dan mencoba akses halaman terproteksi
    if (!isAuth && !isPublicPage) {
      return navigateTo('/login')
    }

    // Jika sudah login dan mencoba akses halaman login
    if (isAuth && isPublicPage) {
      return navigateTo('/dashboard')
    }

    // Jika sudah login, cek role untuk akses halaman users
    if (isAuth && to.path.startsWith('/users') && userRole !== 'admin') {
      return navigateTo('/dashboard')
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    if (!isPublicPage) {
      return navigateTo('/login')
    }
  }
})