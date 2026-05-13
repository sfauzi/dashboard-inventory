<!-- components/SortIcon.vue -->
<template>
  <span class="inline-flex flex-col leading-none text-gray-400">
    <Icon
      name="mdi:menu-up"
      class="w-3 h-3 -mb-1"
      :class="sortField === field && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-300'"
    />
    <Icon
      name="mdi:menu-down"
      class="w-3 h-3"
      :class="sortField === field && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-300'"
    />
  </span>
</template>

<script setup>
defineProps({
  field: String,
  sortField: String,
  sortOrder: String,
});
</script>