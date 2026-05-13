<template>
  <div></div>
</template>

<script setup>
// Redirect ke dashboard
definePageMeta({
  middleware: 'auth'
})

onMounted(() => {
  navigateTo('/dashboard')
})
</script>