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

const { barangList, fetchBarang, createBarang, updateBarang, deleteBarang } = useBarang();
const showFormModal = ref(false);
const selectedBarang = ref(null);
const searchQuery = ref("");
const filterStock = ref("");

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

  if (data.id) {
    // Update existing barang
    result = await updateBarang(data.id, data);
  } else {
    // Create new barang - Hapus id jika ada
    const { id, ...newBarang } = data;
    result = await createBarang(newBarang);
  }

  if (result.success) {
    closeForm();
    alert(data.id ? "Barang berhasil diupdate" : "Barang berhasil ditambahkan");
  } else {
    alert(result.error || "Gagal menyimpan barang");
  }
};

const confirmDelete = (barang) => {
  if (confirm(`Hapus barang "${barang.nama}"?`)) {
    deleteBarang(barang.id);
  }
};

onMounted(() => {
  fetchBarang();
});
</script>
