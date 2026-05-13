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
  </ClientOnly>
</template>

<script setup>
import Sidebar from "~/components/Layout/Sidebar.vue";

const { isAuthenticated, checkUser } = useAuth();

onMounted(async () => {
  await checkUser();
});
</script>
