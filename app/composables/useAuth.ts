import { useSupabaseClient } from '#imports'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useState('user', () => null)
  const role = useState('role', () => null)
  const isAuthenticated = useState('isAuthenticated', () => false)
  
  // Check session dari localStorage
  const checkUser = async () => {
    try {
      // Cek localStorage untuk session
      const storedUser = localStorage.getItem('dashboard_user')
      const storedRole = localStorage.getItem('dashboard_role')
      
      if (storedUser && storedRole) {
        user.value = JSON.parse(storedUser)
        role.value = storedRole
        isAuthenticated.value = true
        return JSON.parse(storedUser)
      }
      
      user.value = null
      role.value = null
      isAuthenticated.value = false
      return null
    } catch (error) {
      console.error('Check user error:', error)
      return null
    }
  }
  
  const login = async (username: string, password: string) => {
    try {
      if (!supabase) {
        return { success: false, error: 'System not ready' }
      }
      
      // Cari user berdasarkan username dan password
      // Note: Untuk production, gunakan hashing password
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()
      
      if (userError || !userData) {
        return { success: false, error: 'Username tidak ditemukan' }
      }
      
      // Verifikasi password sederhana
      // Untuk production, gunakan bcrypt atau hash comparison
      // Sementara kita gunakan password default: 'password' untuk semua user
      if (password !== 'password') {
        return { success: false, error: 'Password salah' }
      }
      
      // Simpan ke localStorage
      localStorage.setItem('dashboard_user', JSON.stringify(userData))
      localStorage.setItem('dashboard_role', userData.role)
      localStorage.setItem('is_authenticated', 'true')
      
      user.value = userData
      role.value = userData.role
      isAuthenticated.value = true
      
      return { success: true, data: userData }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Login gagal' }
    }
  }
  
  const logout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('dashboard_user')
      localStorage.removeItem('dashboard_role')
      localStorage.removeItem('is_authenticated')
      
      if (supabase) {
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      role.value = null
      isAuthenticated.value = false
      navigateTo('/login')
    }
  }
  
  return {
    user: readonly(user),
    role: readonly(role),
    isAuthenticated: readonly(isAuthenticated),
    checkUser,
    login,
    logout
  }
}