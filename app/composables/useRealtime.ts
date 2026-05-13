import { useSupabaseClient } from '#imports'

export const useRealtime = () => {
  const supabase = useSupabaseClient()
  const channels = ref<any[]>([])

  // Subscribe ke perubahan tabel transaksi
  const subscribeToTransaksi = (onChange: (payload: any) => void) => {
    if (!supabase) return null

    const channel = supabase
      .channel('transaksi-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'transaksi'
        },
        (payload) => {
          console.log('Realtime update transaksi:', payload)
          onChange(payload)
        }
      )
      .subscribe((status) => {
        console.log('Transaksi subscription status:', status)
      })

    channels.value.push(channel)
    return channel
  }

  // Subscribe ke perubahan tabel barang (untuk update stok)
  const subscribeToBarang = (onChange: (payload: any) => void) => {
    if (!supabase) return null

    const channel = supabase
      .channel('barang-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Only listen to stock updates
          schema: 'public',
          table: 'barang'
        },
        (payload) => {
          console.log('Realtime update stok:', payload)
          onChange(payload)
        }
      )
      .subscribe((status) => {
        console.log('Barang subscription status:', status)
      })

    channels.value.push(channel)
    return channel
  }

  // Subscribe ke semua perubahan
  const subscribeToAll = (
    onTransaksiChange: (payload: any) => void,
    onBarangChange: (payload: any) => void
  ) => {
    const transaksiChannel = subscribeToTransaksi(onTransaksiChange)
    const barangChannel = subscribeToBarang(onBarangChange)

    return () => {
      if (transaksiChannel) supabase?.removeChannel(transaksiChannel)
      if (barangChannel) supabase?.removeChannel(barangChannel)
    }
  }

  // Cleanup all subscriptions
  const cleanup = () => {
    channels.value.forEach(channel => {
      if (supabase) supabase.removeChannel(channel)
    })
    channels.value = []
  }

  return {
    subscribeToTransaksi,
    subscribeToBarang,
    subscribeToAll,
    cleanup
  }
}