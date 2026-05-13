<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Transaksi</h1>
        <p class="text-gray-600">Catat barang masuk dan keluar</p>
      </div>
      <button
        @click="openCreateModal"
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
      <div class="text-xs text-gray-400">
        Last update: {{ lastUpdateTime }}
      </div>
      <div class="text-xs text-gray-400">
        Total data: {{ transaksiList.length }} transaksi
      </div>
      <button
        @click="manualRefresh"
        :disabled="refreshing"
        class="text-xs text-blue-600 hover:text-blue-800 transition"
      >
        <Icon :name="refreshing ? 'mdi:loading' : 'mdi:refresh'" class="inline mr-1" />
        {{ refreshing ? 'Refreshing...' : 'Refresh Now' }}
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Barang</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="transaksi in filteredTransaksi"
              :key="transaksi.id"
              class="hover:bg-gray-50 transition"
            >
              <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(transaksi.tanggal) }}</td>
              <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ transaksi.barang?.kode || "-" }}</td>
              <td class="px-6 py-4 text-sm text-gray-800">{{ transaksi.barang?.nama || "-" }}</td>
              <td class="px-6 py-4">
                <span :class="transaksi.tipe_transaksi === 'masuk' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                      class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ transaksi.tipe_transaksi === "masuk" ? "Masuk" : "Keluar" }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ transaksi.jumlah }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ transaksi.users?.name || "-" }}</td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button @click="openEditModal(transaksi)" class="text-blue-600 hover:text-blue-800" title="Edit Transaksi">
                    <Icon name="mdi:pencil" class="w-5 h-5" />
                  </button>
                  <button @click="openDeleteModal(transaksi)" class="text-red-600 hover:text-red-800" title="Hapus Transaksi">
                    <Icon name="mdi:delete" class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredTransaksi.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                <Icon name="mdi:database" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
                Belum ada transaksi
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Transaksi Modal -->
    <TransaksiForm
      v-if="showCreateModal"
      :barang-list="barangList"
      :is-edit="false"
      @close="showCreateModal = false"
      @save="handleCreate"
    />

    <!-- Edit Transaksi Modal -->
    <EditTransaksiForm
      v-if="showEditModal"
      :transaksi="selectedTransaksi"
      :barang-list="barangList"
      @close="closeEditModal"
      @save="handleUpdate"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
            <Icon name="mdi:alert" class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Hapus Transaksi</h3>
          <p class="text-gray-600 mb-4">
            Apakah Anda yakin ingin menghapus transaksi ini?
          </p>
          <div class="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
            <p><strong>Barang:</strong> {{ selectedTransaksi?.barang?.nama }}</p>
            <p><strong>Tipe:</strong> {{ selectedTransaksi?.tipe_transaksi === 'masuk' ? 'Masuk' : 'Keluar' }}</p>
            <p><strong>Jumlah:</strong> {{ selectedTransaksi?.jumlah }}</p>
            <p class="text-orange-600 mt-2">
              ⚠️ Stok akan kembali ke kondisi sebelum transaksi ini!
            </p>
          </div>
          <div class="flex gap-3">
            <button @click="confirmDelete" :disabled="loading" class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50">
              {{ loading ? 'Menghapus...' : 'Ya, Hapus' }}
            </button>
            <button @click="closeDeleteModal" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition">
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import EditTransaksiForm from '~/components/Transaksi/EditTransaksiForm.vue';

definePageMeta({ middleware: "auth" });

const { barangList, fetchBarang } = useBarang();
const { transaksiList, fetchTransaksi, createTransaksi, updateTransaksi, deleteTransaksi } = useTransaksi();
const { showToast } = useToast();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedTransaksi = ref(null);
const filterTipe = ref("");
const filterBarang = ref("");
const refreshing = ref(false);
const loading = ref(false);
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

const manualRefresh = async () => {
  await refreshData();
  showToast('Data transaksi berhasil direfresh', 'success', 2000);
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
  if (!date) return '-';
  return new Date(date).toLocaleString("id-ID");
};

// CREATE
const openCreateModal = () => {
  showCreateModal.value = true;
};

const handleCreate = async (data) => {
  const selectedBarangItem = barangList.value.find(b => b.id === data.id_barang);
  const result = await createTransaksi(data);

  if (result.success) {
    showCreateModal.value = false;
    await refreshData();
    showToast(`✅ Transaksi ${data.tipe_transaksi === 'masuk' ? 'masuk' : 'keluar'} ${data.jumlah} unit "${selectedBarangItem?.nama}" berhasil`, 'success', 3000);
  } else {
    showToast(`❌ Gagal: ${result.error}`, 'error', 4000);
  }
};

// EDIT
const openEditModal = (transaksi) => {
  selectedTransaksi.value = transaksi;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedTransaksi.value = null;
};

const handleUpdate = async (id, jumlahBaru, catatan) => {
  const oldJumlah = selectedTransaksi.value.jumlah;
  const result = await updateTransaksi(id, jumlahBaru, catatan);

  if (result.success) {
    closeEditModal();
    await refreshData();
    showToast(`✅ Jumlah berhasil diubah dari ${oldJumlah} menjadi ${jumlahBaru}`, 'success', 3000);
  } else {
    showToast(`❌ Gagal mengupdate: ${result.error}`, 'error', 4000);
  }
};

// DELETE
const openDeleteModal = (transaksi) => {
  selectedTransaksi.value = transaksi;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedTransaksi.value = null;
};

const confirmDelete = async () => {
  if (!selectedTransaksi.value) return;
  
  loading.value = true;
  const result = await deleteTransaksi(selectedTransaksi.value.id);

  if (result.success) {
    closeDeleteModal();
    await refreshData();
    showToast(`🗑️ Transaksi berhasil dihapus`, 'warning', 3000);
  } else {
    showToast(`❌ Gagal menghapus: ${result.error}`, 'error', 4000);
  }
  loading.value = false;
};

onMounted(async () => {
  await refreshData();
});
</script>