<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Master Barang</h1>
        <p class="text-gray-600">Kelola data barang inventaris</p>
      </div>
      <button
        @click="openForm()"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <Icon name="mdi:plus" />
        Tambah Barang
      </button>
    </div>

    <!-- Real-time Status Indicator -->
    <!-- <div class="mb-4 flex items-center gap-4 flex-wrap">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-xs text-gray-500">Auto Refresh (3 detik)</span>
      </div>
      <div class="text-xs text-gray-400">Last update: {{ lastUpdateTime }}</div>
      <div class="text-xs text-gray-400">Total data: {{ barangList.length }} barang</div>
      <button
        @click="manualRefresh"
        :disabled="refreshing"
        class="text-xs text-blue-600 hover:text-blue-800 transition"
      >
        <Icon :name="refreshing ? 'mdi:loading' : 'mdi:refresh'" class="inline mr-1" />
        {{ refreshing ? "Refreshing..." : "Refresh Now" }}
      </button>
    </div> -->

    <!-- Search and Filter -->
    <div class="mb-6 flex gap-4">
      <div class="flex-1 relative">
        <Icon
          name="mdi:magnify"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari barang..."
          class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <select v-model="filterStock" class="px-3 py-2 border border-gray-300 rounded-lg">
        <option value="">Semua Stok</option>
        <option value="low">Stok Menipis (&lt;10)</option>
        <option value="normal">Stok Normal</option>
      </select>
    </div>

    <!-- Barang Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Kode
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nama Barang
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stok
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Lokasi Rak
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="barang in filteredBarang"
              :key="barang.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ barang.kode }}</td>
              <td class="px-6 py-4 font-medium text-gray-800">{{ barang.nama }}</td>
              <td class="px-6 py-4">
                <span
                  :class="barang.stok < 10 ? 'text-red-600 font-bold' : 'text-gray-600'"
                >
                  {{ barang.stok }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ barang.lokasi_rak || "-" }}
              </td>
              <td class="px-6 py-4">
                <span
                  v-if="barang.stok < 10"
                  class="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium"
                >
                  Stok Menipis
                </span>
                <span
                  v-else
                  class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium"
                >
                  Normal
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button
                    @click="openForm(barang)"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    <Icon name="mdi:pencil" />
                  </button>
                  <button
                    @click="confirmDelete(barang)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <Icon name="mdi:delete" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form Modal -->
    <BarangForm
      v-if="showFormModal"
      :barang="selectedBarang"
      @close="closeForm"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
definePageMeta({ middleware: "auth" });

const {
  barangList,
  fetchBarang,
  createBarang,
  updateBarang,
  deleteBarang,
  getLowStockBarang,
} = useBarang();
const { showToast } = useToast();
const showFormModal = ref(false);
const selectedBarang = ref(null);
const searchQuery = ref("");
const filterStock = ref("");
const lastUpdateTime = ref(new Date().toLocaleTimeString());
const refreshing = ref(false);

// Fungsi refresh data
const refreshData = async () => {
  refreshing.value = true;
  await fetchBarang();
  lastUpdateTime.value = new Date().toLocaleTimeString();
  refreshing.value = false;
};

// Auto refresh setiap 3 detik
useInterval(refreshData, 3000);

// Manual refresh
const manualRefresh = async () => {
  await refreshData();
  showToast("Data berhasil direfresh", "success", 2000);
};

const filteredBarang = computed(() => {
  let result = barangList.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (b) => b.nama.toLowerCase().includes(query) || b.kode.toLowerCase().includes(query)
    );
  }

  if (filterStock.value === "low") {
    result = result.filter((b) => b.stok < 10);
  } else if (filterStock.value === "normal") {
    result = result.filter((b) => b.stok >= 10);
  }

  return result;
});

const openForm = (barang = null) => {
  selectedBarang.value = barang;
  showFormModal.value = true;
};

const closeForm = () => {
  showFormModal.value = false;
  selectedBarang.value = null;
};

const handleSave = async (data) => {
  let result;
  const isEdit = !!data.id;

  if (isEdit) {
    result = await updateBarang(data.id, data);
  } else {
    const { id, ...newBarang } = data;
    result = await createBarang(newBarang);
  }

  if (result.success) {
    closeForm();
    await refreshData();

    if (isEdit) {
      showToast(`Barang "${data.nama}" berhasil diupdate`, "success", 3000);
    } else {
      showToast(`Barang "${data.nama}" berhasil ditambahkan`, "success", 3000);
    }
  } else {
    showToast(`Gagal menyimpan barang: ${result.error}`, "error", 4000);
  }
};

const confirmDelete = async (barang) => {
  if (confirm(`Hapus barang "${barang.nama}"?`)) {
    const result = await deleteBarang(barang.id);
    if (result.success) {
      await refreshData();
      showToast(`Barang "${barang.nama}" berhasil dihapus`, "warning", 3000);
    } else {
      showToast(`Gagal menghapus barang: ${result.error}`, "error", 4000);
    }
  }
};

onMounted(() => {
  refreshData();
});
</script>
