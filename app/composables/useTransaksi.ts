import { useSupabaseClient } from '#imports'

export const useTransaksi = () => {
  const supabase = useSupabaseClient()
  const transaksiList = useState('transaksiList', () => [])
  const loading = useState('transaksiLoading', () => false)
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
          barang:barang(id, nama, kode, stok),
          users:users(name)
        `)
        .order('tanggal', { ascending: false })
        .limit(100)
      
      if (error) throw error
      transaksiList.value = data || []
      return data || []
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
      
      if (!user.value?.id) {
        throw new Error('User not authenticated')
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
          id_barang: transaksi.id_barang,
          tanggal: new Date(),
          tipe_transaksi: transaksi.tipe_transaksi,
          jumlah: transaksi.jumlah,
          id_user: user.value.id,
          catatan: transaksi.catatan || null
        }])
        .select()
        .single()
      
      if (error) throw error
      
      await fetchTransaksi()
      const { fetchBarang } = useBarang()
      await fetchBarang()
      
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  // EDIT Transaksi dengan RPC
  const updateTransaksi = async (id: string, jumlahBaru: number, catatan?: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }
      
      const { data, error } = await supabase.rpc('update_transaction', {
        p_transaksi_id: id,
        p_jumlah_baru: jumlahBaru,
        p_user_id: user.value?.id,
        p_catatan: catatan || null
      })
      
      if (error) throw error
      
      // Refresh data setelah update
      await fetchTransaksi()
      const { fetchBarang } = useBarang()
      await fetchBarang()
      
      return { 
        success: true, 
        data,
        message: `Jumlah berhasil diubah dari ${data.old_jumlah} menjadi ${data.new_jumlah}`
      }
    } catch (error: any) {
      console.error('Error updating transaksi:', error)
      return { success: false, error: error.message }
    }
  }
  
  // DELETE Transaksi dengan RPC
  const deleteTransaksi = async (id: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }
      
      const { data, error } = await supabase.rpc('delete_transaction', {
        p_transaksi_id: id
      })
      
      if (error) throw error
      
      // Refresh data setelah delete
      await fetchTransaksi()
      const { fetchBarang } = useBarang()
      await fetchBarang()
      
      return { 
        success: true, 
        data,
        message: `Transaksi berhasil dihapus`
      }
    } catch (error: any) {
      console.error('Error deleting transaksi:', error)
      return { success: false, error: error.message }
    }
  }
  
  return {
    transaksiList: readonly(transaksiList),
    loading: readonly(loading),
    fetchTransaksi,
    createTransaksi,
    updateTransaksi,
    deleteTransaksi
  }
}