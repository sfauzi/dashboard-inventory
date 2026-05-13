<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Transaksi</h1>
        <p class="text-gray-600">Catat barang masuk dan keluar</p>
      </div>
      <button
        @click="showFormModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <Icon name="mdi:plus" />
        Tambah Transaksi
      </button>
    </div>

    <!-- Filter -->
    <div class="mb-6 flex gap-4">
      <select v-model="filterTipe" class="px-3 py-2 border border-gray-300 rounded-lg">
        <option value="">Semua Transaksi</option>
        <option value="masuk">Barang Masuk</option>
        <option value="keluar">Barang Keluar</option>
      </select>

      <select
        v-model="filterBarang"
        class="px-3 py-2 border border-gray-300 rounded-lg flex-1"
      >
        <option value="">Semua Barang</option>
        <option v-for="barang in barangList" :key="barang.id" :value="barang.id">
          {{ barang.nama }} ({{ barang.kode }})
        </option>
      </select>
    </div>

    <!-- Transaksi Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tanggal
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Kode Barang
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nama Barang
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipe
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Jumlah
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="transaksi in filteredTransaksi"
              :key="transaksi.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(transaksi.tanggal) }}
              </td>
              <td class="px-6 py-4 text-sm font-mono text-gray-600">
                {{ transaksi.barang?.kode || "-" }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-800">
                {{ transaksi.barang?.nama || "-" }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="
                    transaksi.tipe_transaksi === 'masuk'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  "
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ transaksi.tipe_transaksi === "masuk" ? "Masuk" : "Keluar" }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ transaksi.jumlah }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ transaksi.users?.name || "-" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form Modal -->
    <TransaksiForm
      v-if="showFormModal"
      :barang-list="barangList"
      @close="showFormModal = false"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
definePageMeta({ middleware: "auth" });

const { barangList, fetchBarang } = useBarang();
const { transaksiList, fetchTransaksi, createTransaksi } = useTransaksi();
const showFormModal = ref(false);
const filterTipe = ref("");
const filterBarang = ref("");

const filteredTransaksi = computed(() => {
  let result = transaksiList.value;

  if (filterTipe.value) {
    result = result.filter((t) => t.tipe_transaksi === filterTipe.value);
  }

  if (filterBarang.value) {
    result = result.filter((t) => t.id_barang === filterBarang.value);
  }

  return result;
});

const formatDate = (date) => {
  return new Date(date).toLocaleString("id-ID");
};

const handleSave = async (data) => {
  const result = await createTransaksi(data);

  if (result.success) {
    showFormModal.value = false;
    alert("Transaksi berhasil dicatat");
  } else {
    alert(result.error);
  }
};

onMounted(async () => {
  await Promise.all([fetchBarang(), fetchTransaksi()]);
});
</script>
