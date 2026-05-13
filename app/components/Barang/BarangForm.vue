<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h2 class="text-2xl font-bold mb-4">
        {{ props.barang ? "Edit Barang" : "Tambah Barang" }}
      </h2>

      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Kode Barang *</label
          >
          <input
            v-model="form.kode"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: BRG-001"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Nama Barang *</label
          >
          <input
            v-model="form.nama"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nama barang"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
          <input
            v-model.number="form.stok"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Lokasi Rak</label>
          <input
            v-model="form.lokasi_rak"
            type="text"
            placeholder="Contoh: A-01"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Simpan
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  barang: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "save"]);

// Initialize form data
const form = reactive({
  id: props.barang?.id || null,
  kode: props.barang?.kode || "",
  nama: props.barang?.nama || "",
  stok: props.barang?.stok || 0,
  lokasi_rak: props.barang?.lokasi_rak || "",
});

const save = () => {
  // Validasi form
  if (!form.kode || !form.kode.trim()) {
    alert("Kode barang harus diisi");
    return;
  }

  if (!form.nama || !form.nama.trim()) {
    alert("Nama barang harus diisi");
    return;
  }

  // Kirim data ke parent
  emit("save", { ...form });
};
</script>
