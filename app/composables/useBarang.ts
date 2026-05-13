import { useSupabaseClient } from '#imports'

export const useBarang = () => {
  const supabase = useSupabaseClient()
  const barangList = useState('barangList', () => [])
  const loading = useState('barangLoading', () => false)

  const fetchBarang = async () => {
    loading.value = true
    try {
      if (!supabase) {
        console.error('Supabase client not available')
        return []
      }

      const { data, error } = await supabase
        .from('barang')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      barangList.value = data || []
      return data || []
    } catch (error: any) {
      console.error('Error fetching barang:', error)
      alert('Gagal mengambil data barang: ' + (error.message || 'Unknown error'))
      return []
    } finally {
      loading.value = false
    }
  }

  const createBarang = async (barang: any) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Generate UUID untuk id
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

      // Data barang dengan id yang digenerate
      const newBarang = {
        id: generateUUID(), // Generate ID manual
        nama: barang.nama,
        kode: barang.kode,
        stok: barang.stok || 0,
        lokasi_rak: barang.lokasi_rak || '',
        created_at: new Date(),
        updated_at: new Date()
      }

      console.log('Creating barang:', newBarang)

      const { data, error } = await supabase
        .from('barang')
        .insert([newBarang])
        .select()
        .single()

      if (error) {
        console.error('Create error:', error)
        throw error
      }

      console.log('Barang created:', data)
      await fetchBarang()
      return { success: true, data }
    } catch (error: any) {
      console.error('Error creating barang:', error)
      return { success: false, error: error.message }
    }
  }

  const updateBarang = async (id: string, updates: any) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('barang')
        .update({
          ...updates,
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchBarang()
      return { success: true, data }
    } catch (error: any) {
      console.error('Error updating barang:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteBarang = async (id: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase
        .from('barang')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchBarang()
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting barang:', error)
      return { success: false, error: error.message }
    }
  }

  const getLowStockBarang = () => {
    return barangList.value.filter(b => b.stok < 10)
  }

  return {
    barangList: readonly(barangList),
    loading: readonly(loading),
    fetchBarang,
    createBarang,
    updateBarang,
    deleteBarang,
    getLowStockBarang
  }
}