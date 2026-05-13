<template>
  <ClientOnly>
    <div v-if="isAuthenticated" class="flex h-screen bg-gray-50">
      <Sidebar />
      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto">
          <slot />
        </div>
      </div>
    </div>
    <div v-else>
      <slot />
    </div>

    <ToastContainer />
  </ClientOnly>
</template>

<script setup>
import Sidebar from "~/components/Layout/Sidebar.vue";
import ToastContainer from "~/components/ToastContainer.vue";

const { isAuthenticated, checkUser } = useAuth();
const { setupRealtime: setupBarangRealtime } = useBarang();
const { setupRealtime } = useTransaksi();

onMounted(async () => {
  await checkUser();

  // Setup realtime untuk semua halaman
  if (isAuthenticated.value) {
    setupRealtime();
    setupBarangRealtime();
  }
});
</script>
