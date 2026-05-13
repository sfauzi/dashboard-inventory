<template>
  <div v-if="mounted">
    <slot />
  </div>
</template>

<script setup>
const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
});
</script>
