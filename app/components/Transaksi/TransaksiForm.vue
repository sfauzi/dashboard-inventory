<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h2 class="text-2xl font-bold mb-4">Tambah Transaksi</h2>

      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Pilih Barang *</label
          >
          <select
            v-model="form.id_barang"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Pilih Barang</option>
            <option
              v-for="barang in props.barangList"
              :key="barang.id"
              :value="barang.id"
            >
              {{ barang.nama }} (Stok: {{ barang.stok }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Tipe Transaksi *</label
          >
          <div class="flex gap-4">
            <label class="flex items-center">
              <input
                type="radio"
                v-model="form.tipe_transaksi"
                value="masuk"
                class="mr-2"
              />
              Barang Masuk
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                v-model="form.tipe_transaksi"
                value="keluar"
                class="mr-2"
              />
              Barang Keluar
            </label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah *</label>
          <input
            v-model.number="form.jumlah"
            type="number"
            min="1"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div
          v-if="
            selectedBarang &&
            form.tipe_transaksi === 'keluar' &&
            form.jumlah > selectedBarang.stok
          "
          class="bg-red-100 text-red-700 p-3 rounded-lg text-sm"
        >
          Peringatan: Stok tersedia hanya {{ selectedBarang.stok }}
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            :disabled="
              form.tipe_transaksi === 'keluar' &&
              form.jumlah > (selectedBarang?.stok || 0)
            "
            class="flex-1 bg-black text-white py-2 rounded-lg hover:bg-black/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Simpan
          </button>
          <button
            type="button"
            @click="emit('close')"
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
  barangList: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["close", "save"]);

const form = reactive({
  id_barang: "",
  tipe_transaksi: "masuk",
  jumlah: 1,
});

const selectedBarang = computed(() => {
  return props.barangList.find((b) => b.id === form.id_barang);
});

const save = () => {
  if (!form.id_barang || !form.tipe_transaksi || form.jumlah < 1) {
    alert("Mohon lengkapi semua data");
    return;
  }

  emit("save", { ...form });
};
</script>
