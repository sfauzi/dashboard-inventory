import { useSupabaseClient } from '#imports'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useState('user', () => null)
  const role = useState('role', () => null)
  const isAuthenticated = useState('isAuthenticated', () => false)

  const checkUser = async () => {
    try {
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

      console.log('Login attempt for username:', username)

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (userError || !userData) {
        console.error('User not found:', userError)
        return { success: false, error: 'Username tidak ditemukan' }
      }

      console.log('User found:', userData.username)

      // Verifikasi password
      if (password !== userData.password) {
        return { success: false, error: 'Password salah' }
      }

      // Simpan ke localStorage
      localStorage.setItem('dashboard_user', JSON.stringify(userData))
      localStorage.setItem('dashboard_role', userData.role)
      localStorage.setItem('is_authenticated', 'true')

      user.value = userData
      role.value = userData.role
      isAuthenticated.value = true

      console.log('Login successful for:', userData.username)
      return { success: true, data: userData }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Login gagal' }
    }
  }

  const registerUser = async (userData: any) => {
    try {
      if (!supabase) {
        return { success: false, error: 'System not ready' }
      }

      console.log('Registering user:', userData.username)

      // Cek apakah username sudah ada
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', userData.username)
        .single()

      if (existingUser) {
        return { success: false, error: 'Username sudah digunakan' }
      }

      // Generate UUID sederhana
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

      // Insert user ke tabel users
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: generateUUID(),
            name: userData.name,
            username: userData.username,
            password: userData.password,
            role: userData.role,
            created_at: new Date()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Insert user error:', error)
        return { success: false, error: error.message }
      }

      console.log('User registered successfully:', data)
      return { success: true, data }
    } catch (error: any) {
      console.error('Register error:', error)
      return { success: false, error: error.message }
    }
  }

  // Fungsi untuk update user
  const updateUser = async (userData: any) => {
    try {
      if (!supabase) {
        return { success: false, error: 'System not ready' }
      }

      console.log('Updating user:', userData.id)

      // Prepare update data
      const updateData: any = {
        name: userData.name,
        role: userData.role,
        updated_at: new Date()
      }

      // Only update password if provided
      if (userData.password && userData.password.trim()) {
        updateData.password = userData.password
      }

      // Update user di database
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userData.id)
        .select()
        .single()

      if (error) {
        console.error('Update user error:', error)
        return { success: false, error: error.message }
      }

      // Update localStorage if the updated user is the current logged-in user
      const currentUser = localStorage.getItem('dashboard_user')
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser)
        if (parsedUser.id === userData.id) {
          const updatedUser = { ...parsedUser, ...updateData }
          localStorage.setItem('dashboard_user', JSON.stringify(updatedUser))
          user.value = updatedUser
          role.value = updatedUser.role
        }
      }

      console.log('User updated successfully:', data)
      return { success: true, data }
    } catch (error: any) {
      console.error('Update user error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
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
    registerUser,
    updateUser,
    logout
  }
}