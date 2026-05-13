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

onMounted(async () => {
  await checkUser();
});
</script>
