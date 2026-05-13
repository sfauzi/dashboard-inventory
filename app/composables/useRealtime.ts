import { useSupabaseClient } from '#imports'

export const useRealtime = () => {
  const supabase = useSupabaseClient()
  const { fetchBarang } = useBarang()
  const { fetchTransaksi } = useTransaksi()
  
  const initRealtime = () => {
    if (!supabase) {
      console.error('Supabase client not available')
      return
    }
    
    // Supabase Realtime Subscription
    const barangSubscription = supabase
      .channel('barang-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'barang' },
        (payload) => {
          console.log('Barang changed:', payload)
          fetchBarang()
        }
      )
      .subscribe()
    
    const transaksiSubscription = supabase
      .channel('transaksi-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transaksi' },
        (payload) => {
          console.log('Transaksi changed:', payload)
          fetchTransaksi()
          fetchBarang() // Refresh stok
        }
      )
      .subscribe()
    
    return () => {
      barangSubscription.unsubscribe()
      transaksiSubscription.unsubscribe()
    }
  }
  
  return {
    initRealtime
  }
}