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
      
      if (error) throw error
      barangList.value = data || []
      return data || []
    } catch (error) {
      console.error('Error fetching barang:', error)
      return []
    } finally {
      loading.value = false
    }
  }
  
  const getBarangById = async (id: string) => {
    try {
      if (!supabase) return null
      
      const { data, error } = await supabase
        .from('barang')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error get barang by id:', error)
      return null
    }
  }
  
  const createBarang = async (barang: any) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }
      
      // Check if kode already exists
      const { data: existing } = await supabase
        .from('barang')
        .select('kode')
        .eq('kode', barang.kode)
        .single()
      
      if (existing) {
        throw new Error('Kode barang sudah ada')
      }
      
      const { data, error } = await supabase
        .from('barang')
        .insert([barang])
        .select()
        .single()
      
      if (error) throw error
      
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
    fetchBarang,
    getBarangById,
    createBarang,
    updateBarang,
    deleteBarang,
    getLowStockBarang
  }
}