<template>
  <div class="font-DM">
    <ClientOnly>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <ToastContainer />
    </ClientOnly>
  </div>
</template>

<script setup>
import ToastContainer from "./components/ToastContainer.vue";

useHead({
  title: "Dashboard Stok Barang",
  meta: [{ name: "description", content: "Sistem Manajemen Inventaris Barang" }],
});

const { checkUser } = useAuth();
const { showToast } = useToast();
const route = useRoute();

const showPendingToast = () => {
  if (!process.client) return;
  const pending = sessionStorage.getItem("pending_toast");
  if (pending) {
    sessionStorage.removeItem("pending_toast");
    try {
      const { message, type, duration } = JSON.parse(pending);
      showToast(message, type, duration);
    } catch (e) {}
  }
};

onMounted(async () => {
  await checkUser();
  // Tandai app sudah siap (sudah melewati load pertama)
  sessionStorage.setItem("app_ready", "1");
  showPendingToast();
});

watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    showPendingToast();
  }
);
</script>
