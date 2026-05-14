<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
  >
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-20 h-20 bg-black/10 rounded-full mb-4"
        >
          <Icon name="mdi:package-variant" class="w-10 h-10 text-black" />
        </div>
        <h2 class="text-3xl font-bold text-gray-800">Dashboard Stok</h2>
        <p class="text-gray-600 mt-2">Sistem Manajemen Inventaris</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <div class="relative">
            <Icon
              name="mdi:account"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="form.username"
              type="text"
              required
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Masukkan username"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div class="relative">
            <Icon
              name="mdi:lock"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Masukkan password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Icon
                :name="showPassword ? 'mdi:eye-off' : 'mdi:eye'"
                class="text-gray-400"
              />
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-black text-white py-2 rounded-lg hover:bg-black/90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <Icon name="mdi:loading" class="animate-spin" />
            Memproses...
          </span>
          <span v-else>Login</span>
        </button>
      </form>

      <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "guest",
});

const form = reactive({
  username: "",
  password: "",
});

const showPassword = ref(false);
const loading = ref(false);
const error = ref("");
const { login } = useAuth();

const handleLogin = async () => {
  if (!form.username.trim() || !form.password.trim()) {
    error.value = "Username dan password harus diisi";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const result = await login(form.username, form.password);

    if (result.success) {
      await navigateTo("/");
    } else {
      error.value = result.error || "Login gagal. Periksa username dan password Anda.";
    }
  } catch (err) {
    error.value = "Terjadi kesalahan. Silakan coba lagi.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>
