<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <Icon name="mdi:package-variant" class="w-8 h-8 text-blue-600" />
        <span class="text-xl font-bold text-gray-800">Dashboard Stok</span>
      </div>
    </div>

    <nav class="flex-1 p-4">
      <NuxtLink
        to="/dashboard"
        class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition mb-1"
        active-class="bg-blue-50 text-blue-600"
      >
        <Icon name="mdi:view-dashboard" />
        Dashboard
      </NuxtLink>

      <NuxtLink
        to="/barang"
        class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition mb-1"
        active-class="bg-blue-50 text-blue-600"
      >
        <Icon name="mdi:package" />
        Master Barang
      </NuxtLink>

      <NuxtLink
        to="/transaksi"
        class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition mb-1"
        active-class="bg-blue-50 text-blue-600"
      >
        <Icon name="mdi:swap-horizontal" />
        Transaksi
      </NuxtLink>

      <NuxtLink
        v-if="role === 'admin'"
        to="/users"
        class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition mb-1"
        active-class="bg-blue-50 text-blue-600"
      >
        <Icon name="mdi:account-group" />
        Manajemen User
      </NuxtLink>
    </nav>

    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Icon name="mdi:account" class="w-5 h-5 text-blue-600" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-800">{{ user?.name }}</p>
          <p class="text-xs text-gray-500">
            {{ role === "admin" ? "Admin" : "Operator" }}
          </p>
        </div>
      </div>
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-2 justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
      >
        <Icon name="mdi:logout" />
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
const { user, role, logout } = useAuth();

const handleLogout = async () => {
  await logout();
};
</script>
