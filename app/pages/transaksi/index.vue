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

    <!-- Real-time Status Indicator -->
    <!-- <div class="mb-4 flex items-center gap-4 flex-wrap">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-xs text-gray-500">Auto Refresh (3 detik)</span>
      </div>
      <div class="text-xs text-gray-400">Last update: {{ lastUpdateTime }}</div>
      <div class="text-xs text-gray-400">
        Total data: {{ transaksiList.length }} transaksi
      </div>
      <button
        @click="manualRefresh"
        :disabled="refreshing"
        class="text-xs text-blue-600 hover:text-blue-800 transition"
      >
        <Icon :name="refreshing ? 'mdi:loading' : 'mdi:refresh'" class="inline mr-1" />
        {{ refreshing ? "Refreshing..." : "Refresh Now" }}
      </button>
    </div> -->

    <!-- Filter -->
    <div class="mb-6 flex gap-4 flex-wrap">
      <select v-model="filterTipe" class="px-3 py-2 border border-gray-300 rounded-lg">
        <option value="">Semua Transaksi</option>
        <option value="masuk">Barang Masuk</option>
        <option value="keluar">Barang Keluar</option>
      </select>

      <select
        v-model="filterBarang"
        class="px-3 py-2 border border-gray-300 rounded-lg flex-1 min-w-[200px]"
      >
        <option value="">Semua Barang</option>
        <option v-for="barang in barangList" :key="barang.id" :value="barang.id">
          {{ barang.nama }} ({{ barang.kode }}) - Stok: {{ barang.stok }}
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
              class="hover:bg-gray-50 transition"
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
            <tr v-if="filteredTransaksi.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                <Icon name="mdi:database" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
                Belum ada transaksi
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
const { showToast } = useToast();
const showFormModal = ref(false);
const filterTipe = ref("");
const filterBarang = ref("");
const refreshing = ref(false);
const lastUpdateTime = ref(new Date().toLocaleTimeString());

// Fungsi refresh data
const refreshData = async () => {
  refreshing.value = true;
  await Promise.all([fetchBarang(), fetchTransaksi()]);
  lastUpdateTime.value = new Date().toLocaleTimeString();
  refreshing.value = false;
};

// Auto refresh setiap 3 detik
useInterval(refreshData, 3000);

// Manual refresh
const manualRefresh = async () => {
  await refreshData();
  showToast("Data transaksi berhasil direfresh", "success", 2000);
};

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
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID");
};

const handleSave = async (data) => {
  const selectedBarang = barangList.value.find((b) => b.id === data.id_barang);
  const typeText = data.tipe_transaksi === "masuk" ? "masuk" : "keluar";

  const result = await createTransaksi(data);

  if (result.success) {
    showFormModal.value = false;
    await refreshData();

    showToast(
      `✅ Transaksi ${typeText} ${data.jumlah} unit "${selectedBarang?.nama}" berhasil dicatat`,
      "success",
      3000
    );
  } else {
    showToast(`❌ Gagal mencatat transaksi: ${result.error}`, "error", 4000);
  }
};

onMounted(async () => {
  await refreshData();
});
</script>
