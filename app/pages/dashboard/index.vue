<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-gray-600">Selamat datang, {{ user?.name }}</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Total Barang</p>
            <p class="text-3xl font-bold text-gray-800">{{ barangList.length }}</p>
          </div>
          <div class="bg-blue-100 rounded-full p-3">
            <Icon name="mdi:package-variant" class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Total Stok</p>
            <p class="text-3xl font-bold text-gray-800">{{ totalStok }}</p>
          </div>
          <div class="bg-green-100 rounded-full p-3">
            <Icon name="mdi:warehouse" class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Stok Menipis</p>
            <p class="text-3xl font-bold text-yellow-600">{{ lowStockCount }}</p>
          </div>
          <div class="bg-yellow-100 rounded-full p-3">
            <Icon name="mdi:alert" class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Transaksi Bulan Ini</p>
            <p class="text-3xl font-bold text-gray-800">{{ transaksiBulanIni }}</p>
          </div>
          <div class="bg-purple-100 rounded-full p-3">
            <Icon name="mdi:swap-horizontal" class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Low Stock Warning -->
    <StockWarning :barang-list="lowStockBarang" />

    <!-- Recent Transactions -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-xl font-semibold text-gray-800">Transaksi Terbaru</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tanggal
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Barang
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
              v-for="transaksi in recentTransaksi"
              :key="transaksi.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(transaksi.tanggal) }}
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-800">
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
            <tr v-if="recentTransaksi.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                Belum ada transaksi
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: "auth" });

const { user } = useAuth();
const { barangList, getLowStockBarang, fetchBarang } = useBarang();
const { transaksiList, fetchTransaksi } = useTransaksi();

const totalStok = computed(() => {
  return barangList.value.reduce((sum, item) => sum + (item.stok || 0), 0);
});

const lowStockBarang = computed(() => getLowStockBarang());
const lowStockCount = computed(() => lowStockBarang.value.length);

const recentTransaksi = computed(() => {
  return transaksiList.value.slice(0, 10);
});

const transaksiBulanIni = computed(() => {
  const now = new Date();
  return transaksiList.value.filter((t) => {
    const tanggal = new Date(t.tanggal);
    return (
      tanggal.getMonth() === now.getMonth() && tanggal.getFullYear() === now.getFullYear()
    );
  }).length;
});

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID");
};

onMounted(async () => {
  await Promise.all([fetchBarang(), fetchTransaksi()]);
});
</script>
