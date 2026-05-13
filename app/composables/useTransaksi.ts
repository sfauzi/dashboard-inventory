import { useSupabaseClient } from '#imports'

export const useTransaksi = () => {
  const supabase = useSupabaseClient()
  const transaksiList = useState('transaksiList', () => [])
  const loading = useState('transaksiLoading', () => false)
  const lastFetchTime = useState('lastFetchTimeTransaksi', () => Date.now())
  const { user } = useAuth()

  const fetchTransaksi = async () => {
    loading.value = true
    try {
      if (!supabase) {
        console.error('Supabase client not available')
        return []
      }

      const { data, error } = await supabase
        .from('transaksi')
        .select(`
          *,
          barang:barang(nama, kode),
          users:users(name)
        `)
        .order('tanggal', { ascending: false })
        .limit(100)

      if (error) throw error

      // Check if data has changed
      const newData = data || []
      const hasChanged = JSON.stringify(transaksiList.value) !== JSON.stringify(newData)

      if (hasChanged) {
        transaksiList.value = newData
        lastFetchTime.value = Date.now()
        console.log('Transaksi data updated at:', new Date().toLocaleTimeString())
      }

      return newData
    } catch (error) {
      console.error('Error fetching transaksi:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  const createTransaksi = async (transaksi: any) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Validate stok for keluar transaction
      if (transaksi.tipe_transaksi === 'keluar') {
        const { data: barang } = await supabase
          .from('barang')
          .select('stok')
          .eq('id', transaksi.id_barang)
          .single()

        if (!barang || barang.stok < transaksi.jumlah) {
          throw new Error(`Stok tidak mencukupi. Stok tersedia: ${barang?.stok || 0}`)
        }
      }

      const { data, error } = await supabase
        .from('transaksi')
        .insert([{
          ...transaksi,
          id_user: user.value?.id,
          tanggal: new Date()
        }])
        .select()
        .single()

      if (error) throw error

      // Immediate refresh after create
      await fetchTransaksi()

      // Refresh barang list to update stock
      const { fetchBarang } = useBarang()
      await fetchBarang()

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const getTransaksiByBarang = async (id_barang: string) => {
    try {
      if (!supabase) return []

      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .eq('id_barang', id_barang)
        .order('tanggal', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error get transaksi by barang:', error)
      return []
    }
  }

  return {
    transaksiList: readonly(transaksiList),
    loading: readonly(loading),
    lastFetchTime: readonly(lastFetchTime),
    fetchTransaksi,
    createTransaksi,
    getTransaksiByBarang
  }
}