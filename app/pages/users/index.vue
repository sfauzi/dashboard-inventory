<template>
  <div class="p-6" v-if="role === 'admin'">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Manajemen User</h1>
        <p class="text-gray-600">Kelola akun operator dan admin</p>
      </div>
      <button
        @click="showFormModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <Icon name="mdi:plus" />
        Tambah User
      </button>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nama
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Username
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="user in userList" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 font-medium text-gray-800">{{ user.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ user.username }}</td>
              <td class="px-6 py-4">
                <span
                  :class="
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  "
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ user.role === "admin" ? "Admin" : "Operator" }}
                </span>
              </td>
              <td class="px-6 py-4">
                <button
                  @click="deleteUser(user.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  <Icon name="mdi:delete" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Form Modal -->
    <div
      v-if="showFormModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 class="text-2xl font-bold mb-4">Tambah User</h2>

        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Nama Lengkap *</label
            >
            <input
              v-model="userForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              v-model="userForm.username"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              v-model="userForm.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              v-model="userForm.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Simpan
            </button>
            <button
              type="button"
              @click="showFormModal = false"
              class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-else class="p-6 text-center">
    <p class="text-red-600">Akses ditolak. Halaman ini hanya untuk admin.</p>
  </div>
</template>

<script setup>
definePageMeta({ middleware: "auth" });

const supabase = useSupabaseClient();
const { role } = useAuth();
const userList = ref([]);
const showFormModal = ref(false);
const userForm = reactive({
  name: "",
  username: "",
  password: "",
  role: "operator",
});

const fetchUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error) {
    userList.value = data;
  }
};

const saveUser = async () => {
  const { registerUser } = useAuth();
  const result = await registerUser({ ...userForm });

  if (result.success) {
    showFormModal.value = false;
    userForm.name = "";
    userForm.username = "";
    userForm.password = "";
    userForm.role = "operator";
    await fetchUsers();
    alert("User berhasil ditambahkan");
  } else {
    alert(result.error);
  }
};

const deleteUser = async (id) => {
  if (confirm("Hapus user ini?")) {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (!error) {
      await fetchUsers();
      alert("User berhasil dihapus");
    }
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
