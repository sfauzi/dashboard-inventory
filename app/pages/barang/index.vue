<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Master Barang</h1>
        <p class="text-gray-600">Kelola data barang inventaris</p>
      </div>
      <button
        @click="openForm()"
        class="bg-black text-white px-4 py-2 rounded-lg hover:bg-black/90 transition flex items-center gap-2"
      >
        <Icon name="mdi:plus" />
        Tambah Barang
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex gap-4">
      <div class="flex-1 relative">
        <Icon name="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari barang..."
          class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          @input="currentPage = 1"
        />
      </div>
      <select v-model="filterStock" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" @change="currentPage = 1">
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
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                @click="setSort('kode')"
              >
                <div class="flex items-center gap-1">
                  Kode
                  <SortIcon field="kode" :sort-field="sortField" :sort-order="sortOrder" />
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                @click="setSort('nama')"
              >
                <div class="flex items-center gap-1">
                  Nama Barang
                  <SortIcon field="nama" :sort-field="sortField" :sort-order="sortOrder" />
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                @click="setSort('stok')"
              >
                <div class="flex items-center gap-1">
                  Stok
                  <SortIcon field="stok" :sort-field="sortField" :sort-order="sortOrder" />
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                @click="setSort('lokasi_rak')"
              >
                <div class="flex items-center gap-1">
                  Lokasi Rak
                  <SortIcon field="lokasi_rak" :sort-field="sortField" :sort-order="sortOrder" />
                </div>
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
              v-for="barang in paginatedBarang"
              :key="barang.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ barang.kode }}</td>
              <td class="px-6 py-4 font-medium text-gray-800">{{ barang.nama }}</td>
              <td class="px-6 py-4">
                <span :class="barang.stok < 10 ? 'text-red-600 font-bold' : 'text-gray-600'">
                  {{ barang.stok }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ barang.lokasi_rak || "-" }}</td>
              <td class="px-6 py-4">
                <span
                  v-if="barang.stok < 10"
                  class="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium"
                >
                  Stok Menipis
                </span>
                <span v-else class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  Normal
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button @click="openForm(barang)" class="text-black hover:text-black/90" title="Edit barang">
                    <Icon name="mdi:pencil" class="w-5 h-5"/>
                  </button>
                  <button @click="openDeleteModal(barang)" class="text-red-600 hover:text-red-800" title="Hapus barang">
                    <Icon name="mdi:delete" class="w-5 h-5"/>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedBarang.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                Tidak ada data barang
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span>Tampilkan</span>
          <select v-model="pageSize" class="border border-gray-300 rounded px-2 py-1" @change="currentPage = 1">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
          <span>dari {{ filteredBarang.length }} data</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="px-2 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="mdi:chevron-double-left" />
          </button>
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-2 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="mdi:chevron-left" />
          </button>
          <span
            v-for="page in visiblePages"
            :key="page"
          >
            <button
              v-if="page !== '...'"
              @click="currentPage = page"
              :class="currentPage === page ? 'bg-black text-white border-black/70' : 'hover:bg-gray-50 border-gray-300'"
              class="px-3 py-1 rounded border text-sm"
            >
              {{ page }}
            </button>
            <span v-else class="px-2 py-1 text-sm text-gray-400">...</span>
          </span>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-2 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="mdi:chevron-right" />
          </button>
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="px-2 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="mdi:chevron-double-right" />
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <BarangForm
      v-if="showFormModal"
      :barang="selectedBarang"
      @close="closeForm"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
            <Icon name="mdi:alert" class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Hapus Barang</h3>
          <p class="text-gray-600 mb-4">
            Apakah Anda yakin ingin menghapus barang <span class="font-semibold">{{ selectedBarang?.nama }}</span>?
            <br />
            <span class="text-sm text-red-500">Tindakan ini tidak dapat dibatalkan!</span>
          </p>
          <div class="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
            <p><strong>Kode:</strong> {{ selectedBarang?.kode }}</p>
            <p><strong>Stok:</strong> {{ selectedBarang?.stok }}</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="confirmDelete"
              :disabled="loading"
              class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {{ loading ? 'Menghapus...' : 'Ya, Hapus' }}
            </button>
            <button
              @click="closeDeleteModal"
              class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
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
const showDeleteModal = ref(false);
const selectedBarang = ref(null);
const searchQuery = ref("");
const filterStock = ref("");
const lastUpdateTime = ref(new Date().toLocaleTimeString());
const refreshing = ref(false);
const loading = ref(false);

// Sorting
const sortField = ref("nama");
const sortOrder = ref("asc"); // 'asc' | 'desc'

const setSort = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc";
  }
  currentPage.value = 1;
};

// Pagination
const currentPage = ref(1);
const pageSize = ref(5);

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

  // Sorting
  result = [...result].sort((a, b) => {
    const valA = a[sortField.value] ?? "";
    const valB = b[sortField.value] ?? "";
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder.value === "asc" ? valA - valB : valB - valA;
    }
    return sortOrder.value === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  return result;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredBarang.value.length / pageSize.value)));

const paginatedBarang = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredBarang.value.slice(start, start + pageSize.value);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }
  return pages;
});

// Reset page saat filter berubah
watch([searchQuery, filterStock], () => {
  currentPage.value = 1;
});

const openForm = (barang = null) => {
  selectedBarang.value = barang;
  showFormModal.value = true;
};

const closeForm = () => {
  showFormModal.value = false;
  if (!showDeleteModal.value) {
    selectedBarang.value = null;
  }
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

const openDeleteModal = (barang) => {
  selectedBarang.value = barang;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedBarang.value = null;
};

const confirmDelete = async () => {
  if (!selectedBarang.value) return;

  loading.value = true;
  const barangNama = selectedBarang.value.nama;
  const barangId = selectedBarang.value.id;
  const result = await deleteBarang(barangId);

  if (result.success) {
    closeDeleteModal();
    await refreshData();
    showToast(`Barang "${barangNama}" berhasil dihapus`, "warning", 3000);
  } else {
    showToast(`Gagal menghapus barang: ${result.error}`, "error", 4000);
  }
  loading.value = false;
};

onMounted(() => {
  refreshData();
});
</script>