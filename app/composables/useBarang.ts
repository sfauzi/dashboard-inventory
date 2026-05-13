import { useSupabaseClient } from '#imports'

export const useBarang = () => {
  const supabase = useSupabaseClient()
  const barangList = useState('barangList', () => [])
  const loading = useState('barangLoading', () => false)
  const lastFetchTime = useState('lastFetchTimeBarang', () => Date.now())

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

      // Check if data has changed
      const newData = data || []
      const hasChanged = JSON.stringify(barangList.value) !== JSON.stringify(newData)

      if (hasChanged) {
        barangList.value = newData
        lastFetchTime.value = Date.now()
        console.log('Barang data updated at:', new Date().toLocaleTimeString())
      }

      return newData
    } catch (error: any) {
      console.error('Error fetching barang:', error)
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

      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

      const newBarang = {
        id: generateUUID(),
        nama: barang.nama,
        kode: barang.kode,
        stok: barang.stok || 0,
        lokasi_rak: barang.lokasi_rak || '',
        created_at: new Date(),
        updated_at: new Date()
      }

      const { data, error } = await supabase
        .from('barang')
        .insert([newBarang])
        .select()
        .single()

      if (error) throw error

      // Immediate refresh after create
      await fetchBarang()

      return { success: true, data }
    } catch (error: any) {
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
        .update({ ...updates, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchBarang()
      return { success: true, data }
    } catch (error: any) {
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
      return { success: false, error: error.message }
    }
  }

  const getLowStockBarang = () => {
    return barangList.value.filter(b => b.stok < 10)
  }

  return {
    barangList: readonly(barangList),
    loading: readonly(loading),
    lastFetchTime: readonly(lastFetchTime),
    fetchBarang,
    createBarang,
    updateBarang,
    deleteBarang,
    getLowStockBarang
  }
}