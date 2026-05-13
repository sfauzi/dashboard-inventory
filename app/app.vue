<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
useHead({
  title: "Dashboard Stok Barang",
  meta: [{ name: "description", content: "Sistem Manajemen Inventaris Barang" }],
});

const { checkUser } = useAuth();

onMounted(async () => {
  await checkUser();
});
</script>
