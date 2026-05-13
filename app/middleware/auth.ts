export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return

  const publicPages = ['/login']
  const isPublicPage = publicPages.includes(to.path)

  const setPendingToast = (message: string, type: string, duration: number) => {
    sessionStorage.setItem('pending_toast', JSON.stringify({ message, type, duration }))
  }

  // Jika sedang proses logout, skip semua logic middleware
  if (sessionStorage.getItem('is_logging_out')) {
    sessionStorage.removeItem('is_logging_out')
    return
  }

  try {
    const isAuth = localStorage.getItem('is_authenticated')
    const userRole = localStorage.getItem('dashboard_role')

    if (!isAuth && !isPublicPage) {
      const appReady = sessionStorage.getItem('app_ready')
      if (appReady) {
        setPendingToast(
          'Anda harus login terlebih dahulu untuk mengakses halaman ini',
          'warning',
          4000
        )
      }
      return navigateTo('/login')
    }

    if (isAuth && isPublicPage) {
      setPendingToast('Anda sudah login!', 'info', 4000)
      return navigateTo('/dashboard')
    }

    if (isAuth && to.path.startsWith('/users')) {
      if (userRole !== 'admin') {
        setPendingToast(
          'Akses ditolak! Halaman ini hanya untuk admin.',
          'error',
          4000
        )
        return navigateTo('/dashboard')
      }
    }

  } catch (error) {
    console.error('Auth middleware error:', error)
    if (!isPublicPage) {
      setPendingToast('Terjadi kesalahan autentikasi', 'error', 4000)
      return navigateTo('/login')
    }
  }
})