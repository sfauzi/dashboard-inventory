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
    const { showToast } = useToast()

    // Jika belum login dan mencoba akses halaman terproteksi
    if (!isAuth && !isPublicPage) {
      // showToast('Anda harus login terlebih dahulu untuk mengakses halaman ini', 'warning', 4000)
      return navigateTo('/login')
    }

    // Jika sudah login dan mencoba akses halaman login
    if (isAuth && isPublicPage) {
      return navigateTo('/dashboard')
    }

    // Jika sudah login, cek role untuk akses halaman users
    if (isAuth && to.path.startsWith('/users')) {
      if (userRole !== 'admin') {
        showToast('Akses ditolak! Halaman ini hanya untuk admin.', 'error', 4000)
        return navigateTo('/dashboard')
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    const { showToast } = useToast()
    if (!isPublicPage) {
      showToast('Terjadi kesalahan autentikasi', 'error', 4000)
      return navigateTo('/login')
    }
  }
})