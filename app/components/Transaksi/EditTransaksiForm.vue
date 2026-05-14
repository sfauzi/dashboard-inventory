<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800">Edit Transaksi</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <Icon name="mdi:close" class="w-6 h-6" />
        </button>
      </div>

      <div class="bg-blue-50 p-3 rounded-lg mb-4 text-sm">
        <p><strong>Barang:</strong> {{ props.transaksi?.barang?.nama }}</p>
        <p>
          <strong>Tipe:</strong>
          {{ props.transaksi?.tipe_transaksi === "masuk" ? "Masuk" : "Keluar" }}
        </p>
        <p><strong>Jumlah saat ini:</strong> {{ props.transaksi?.jumlah }}</p>
        <p><strong>Stok saat ini:</strong> {{ props.transaksi?.barang?.stok }}</p>
        <p class="text-orange-600 mt-2">
          <Icon name="mdi:alert" class="w-4 h-4 -mb-1" />
          Perubahan jumlah akan mempengaruhi stok barang!
        </p>
      </div>

      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Jumlah Baru *</label
          >
          <input
            v-model.number="form.jumlah"
            type="number"
            min="1"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">
            {{ getJumlahPreview() }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea
            v-model="form.catatan"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Catatan (opsional)"
          ></textarea>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            :disabled="loading || !isValid"
            class="flex-1 bg-black text-white py-2 rounded-lg hover:bg-black/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? "Menyimpan..." : "Update Transaksi" }}
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
  transaksi: {
    type: Object,
    required: true,
  },
  barangList: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["close", "save"]);

const { showToast } = useToast();

const form = reactive({
  jumlah: props.transaksi?.jumlah || 1,
  catatan: props.transaksi?.catatan || "",
});

const loading = ref(false);

// Validasi jumlah tidak boleh 0 atau negatif
const isValid = computed(() => {
  return form.jumlah > 0;
});

// Preview efek perubahan stok
const getJumlahPreview = () => {
  if (!props.transaksi) return "";

  const oldJumlah = props.transaksi.jumlah;
  const newJumlah = form.jumlah;
  const selisih = newJumlah - oldJumlah;
  const currentStock = props.transaksi.barang?.stok || 0;

  if (selisih === 0) return "Tidak ada perubahan jumlah";

  if (props.transaksi.tipe_transaksi === "masuk") {
    const newStock = currentStock + selisih;
    return `Stok akan berubah dari ${currentStock} menjadi ${newStock} ${
      selisih > 0 ? "(+" + selisih + ")" : "(" + selisih + ")"
    }`;
  } else {
    const newStock = currentStock - selisih;
    if (newStock < 0) {
      return "⚠️ Peringatan: Stok akan menjadi negatif!";
    }
    return `Stok akan berubah dari ${currentStock} menjadi ${newStock} ${
      selisih > 0 ? "(-" + selisih + ")" : "(+" + Math.abs(selisih) + ")"
    }`;
  }
};

const save = () => {
  if (!isValid.value) {
    showToast('Jumlah harus lebih dari 0', 'warning', 3000);
    return;
  }

  // Validasi stok untuk transaksi keluar
  if (props.transaksi.tipe_transaksi === "keluar") {
    const oldJumlah = props.transaksi.jumlah;
    const newJumlah = form.jumlah;
    const selisih = newJumlah - oldJumlah;
    const currentStock = props.transaksi.barang?.stok || 0;

    if (selisih > 0 && currentStock - selisih < 0) {
      showToast(
        `Stok tidak mencukupi! Stok saat ini: ${currentStock}, penambahan ${selisih} akan membuat stok negatif.`,
        'error',
        4000
      );
      return;
    }
  }

  emit("save", props.transaksi.id, form.jumlah, form.catatan);
};
</script>
