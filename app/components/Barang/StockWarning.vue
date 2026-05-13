<template>
  <div v-if="barangList.length > 0" class="mb-8">
    <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <Icon name="mdi:alert" class="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <h3 class="font-semibold text-yellow-800 mb-2">Peringatan Stok Menipis</h3>
          <div class="space-y-2">
            <div
              v-for="barang in barangList"
              :key="barang.id"
              class="flex justify-between items-center text-sm"
            >
              <span class="text-yellow-700">{{ barang.nama }} ({{ barang.kode }})</span>
              <span class="font-bold text-red-600">Stok: {{ barang.stok }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  barangList: {
    type: Array,
    default: () => [],
  },
});
</script>
