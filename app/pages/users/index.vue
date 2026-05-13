<template>
  <div class="p-6" v-if="role === 'admin'">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Manajemen User</h1>
        <p class="text-gray-600">Kelola akun operator dan admin</p>
      </div>
      <button
        @click="openFormModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <Icon name="mdi:plus" />
        Tambah User
      </button>
    </div>
    
    <!-- Search Filter -->
    <div class="mb-6">
      <div class="relative">
        <Icon name="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari user..."
          class="w-full md:w-96 pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    </div>
    
    <!-- Users Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dibuat Pada</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(userItem, index) in filteredUsers" :key="userItem.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-500">{{ index + 1 }}</td>
              <td class="px-6 py-4 font-medium text-gray-800">{{ userItem.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ userItem.username }}</td>
              <td class="px-6 py-4">
                <span :class="userItem.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                      class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ userItem.role === 'admin' ? 'Admin' : 'Operator' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(userItem.created_at) }}</td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button 
                    @click="openEditModal(userItem)" 
                    class="text-blue-600 hover:text-blue-800 transition"
                    title="Edit User"
                  >
                    <Icon name="mdi:pencil" class="w-5 h-5" />
                  </button>
                  <button 
                    @click="openDeleteModal(userItem)" 
                    class="text-red-600 hover:text-red-800 transition"
                    title="Hapus User"
                  >
                    <Icon name="mdi:delete" class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                <Icon name="mdi:account-off" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
                Tidak ada data user
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- User Form Modal (Create/Edit) -->
    <div v-if="showFormModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">
            {{ isEditMode ? 'Edit User' : 'Tambah User' }}
          </h2>
          <button @click="closeFormModal" class="text-gray-400 hover:text-gray-600">
            <Icon name="mdi:close" class="w-6 h-6" />
          </button>
        </div>
        
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap <span class="text-red-500">*</span>
            </label>
            <input
              v-model="userForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama lengkap"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Username <span class="text-red-500">*</span>
            </label>
            <input
              v-model="userForm.username"
              type="text"
              required
              :disabled="isEditMode"
              :class="isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan username"
            />
            <p v-if="isEditMode" class="text-xs text-gray-500 mt-1">Username tidak dapat diubah</p>
          </div>
          
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Password <span v-if="!isEditMode" class="text-red-500">*</span>
              <span v-else class="text-xs text-gray-500">(Kosongkan jika tidak ingin mengubah)</span>
            </label>
            <div class="relative">
              <input
                v-model="userForm.password"
                :type="showPassword ? 'text' : 'password'"
                :required="!isEditMode"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                :placeholder="isEditMode ? 'Masukkan password baru (opsional)' : 'Masukkan password'"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon :name="showPassword ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Role <span class="text-red-500">*</span>
            </label>
            <select
              v-model="userForm.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button 
              type="submit" 
              :disabled="loading"
              class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <Icon name="mdi:loading" class="animate-spin" />
                {{ isEditMode ? 'Mengupdate...' : 'Menyimpan...' }}
              </span>
              <span v-else>
                {{ isEditMode ? 'Update User' : 'Simpan User' }}
              </span>
            </button>
            <button 
              type="button" 
              @click="closeFormModal" 
              class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
            <Icon name="mdi:alert" class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Hapus User</h3>
          <p class="text-gray-600 mb-4">
            Apakah Anda yakin ingin menghapus user <span class="font-semibold">{{ selectedUser?.name }}</span>?
            <br />
            <span class="text-sm text-red-500">Tindakan ini tidak dapat dibatalkan!</span>
          </p>
          <div class="flex gap-3">
            <button
              @click="confirmDelete"
              :disabled="loading"
              class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {{ loading ? 'Menghapus...' : 'Ya, Hapus' }}
            </button>
            <button
              @click="closeDeleteModal"
              class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="p-6 text-center">
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <Icon name="mdi:alert" class="w-12 h-12 text-red-600 mx-auto mb-2" />
      <p class="text-red-600 font-semibold">Akses Ditolak</p>
      <p class="text-red-500 text-sm">Halaman ini hanya untuk admin.</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const { role, registerUser, updateUser } = useAuth()
const { showToast } = useToast()
const userList = ref([])
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const loading = ref(false)
const isEditMode = ref(false)
const selectedUser = ref(null)
const searchQuery = ref('')
const showPassword = ref(false)

const userForm = reactive({
  id: '',
  name: '',
  username: '',
  password: '',
  role: 'operator'
})

// Filter users berdasarkan search
const filteredUsers = computed(() => {
  if (!searchQuery.value) return userList.value
  
  const query = searchQuery.value.toLowerCase()
  return userList.value.filter(user => 
    user.name.toLowerCase().includes(query) || 
    user.username.toLowerCase().includes(query)
  )
})

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, username, role, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    userList.value = data || []
    console.log('Users fetched:', userList.value.length)
  } catch (error) {
    console.error('Error fetching users:', error)
    showToast('❌ Gagal mengambil data users', 'error', 4000)
  }
}

const openFormModal = () => {
  isEditMode.value = false
  selectedUser.value = null
  userForm.id = ''
  userForm.name = ''
  userForm.username = ''
  userForm.password = ''
  userForm.role = 'operator'
  showFormModal.value = true
}

const openEditModal = (user) => {
  if (!user || !user.id) {
    console.error('Invalid user data for edit:', user)
    showToast('❌ Data user tidak valid', 'error', 3000)
    return
  }
  
  isEditMode.value = true
  selectedUser.value = user
  userForm.id = user.id
  userForm.name = user.name || ''
  userForm.username = user.username || ''
  userForm.password = '' // Kosongkan password untuk edit
  userForm.role = user.role || 'operator'
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  isEditMode.value = false
  selectedUser.value = null
  userForm.id = ''
  userForm.name = ''
  userForm.username = ''
  userForm.password = ''
  userForm.role = 'operator'
  showPassword.value = false
}

const saveUser = async () => {
  // Validasi
  if (!userForm.name.trim()) {
    showToast('⚠️ Nama lengkap harus diisi', 'warning', 3000)
    return
  }
  
  if (!userForm.username.trim()) {
    showToast('⚠️ Username harus diisi', 'warning', 3000)
    return
  }
  
  if (!isEditMode.value && !userForm.password.trim()) {
    showToast('⚠️ Password harus diisi', 'warning', 3000)
    return
  }
  
  if (!isEditMode.value && userForm.password.length < 4) {
    showToast('⚠️ Password minimal 4 karakter', 'warning', 3000)
    return
  }
  
  if (isEditMode.value && userForm.password && userForm.password.length < 4) {
    showToast('⚠️ Password minimal 4 karakter', 'warning', 3000)
    return
  }
  
  loading.value = true
  
  try {
    let result
    
    if (isEditMode.value) {
      // Update user
      const updateData = {
        id: userForm.id,
        name: userForm.name.trim(),
        role: userForm.role
      }
      
      if (userForm.password && userForm.password.trim()) {
        updateData.password = userForm.password
      }
      
      result = await updateUser(updateData)
    } else {
      // Create new user
      result = await registerUser({
        name: userForm.name.trim(),
        username: userForm.username.trim(),
        password: userForm.password,
        role: userForm.role
      })
    }
    
    if (result.success) {
      closeFormModal()
      await fetchUsers()
      
      if (isEditMode.value) {
        showToast(`✅ User "${userForm.name}" berhasil diupdate`, 'success', 3000)
      } else {
        showToast(`✅ User "${userForm.name}" berhasil ditambahkan`, 'success', 3000)
      }
    } else {
      showToast(`❌ Gagal menyimpan user: ${result.error}`, 'error', 4000)
    }
  } catch (error) {
    console.error('Error saving user:', error)
    showToast('❌ Terjadi kesalahan saat menyimpan user', 'error', 4000)
  } finally {
    loading.value = false
  }
}

const openDeleteModal = (user) => {
  if (!user || !user.id) {
    console.error('Invalid user data for delete:', user)
    showToast('❌ Data user tidak valid', 'error', 3000)
    return
  }
  
  selectedUser.value = user
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedUser.value = null
}

const confirmDelete = async () => {
  if (!selectedUser.value) {
    showToast('❌ Tidak ada user yang dipilih', 'error', 3000)
    return
  }
  
  if (!selectedUser.value.id) {
    showToast('❌ ID user tidak valid', 'error', 3000)
    return
  }
  
  // Cek jangan sampai menghapus diri sendiri
  const currentUser = JSON.parse(localStorage.getItem('dashboard_user') || '{}')
  if (currentUser.id === selectedUser.value.id) {
    showToast('⚠️ Anda tidak dapat menghapus akun sendiri!', 'warning', 4000)
    closeDeleteModal()
    return
  }
  
  loading.value = true
  
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', selectedUser.value.id)
    
    if (error) throw error
    
    await fetchUsers()
    showToast(`🗑️ User "${selectedUser.value.name}" berhasil dihapus`, 'warning', 3000)
    closeDeleteModal()
  } catch (error) {
    console.error('Error deleting user:', error)
    showToast(`❌ Gagal menghapus user: ${error.message}`, 'error', 4000)
  } finally {
    loading.value = false
  }
}

// Show warning if non-admin tries to access
onMounted(() => {
  if (role.value !== 'admin') {
    showToast('🔒 Halaman ini hanya dapat diakses oleh Admin!', 'error', 5000)
  } else {
    fetchUsers()
  }
})
</script>