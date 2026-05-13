import { useSupabaseClient } from '#imports'

export const useRealtime = () => {
  const supabase = useSupabaseClient()
  const { fetchBarang } = useBarang()
  const { fetchTransaksi } = useTransaksi()

  // Untuk menyimpan subscriptions agar bisa di-unsubscribe
  const subscriptions = ref<any[]>([])

  const initRealtime = () => {
    if (!supabase) {
      console.error('Supabase client not available')
      return
    }

    console.log('Initializing Supabase Realtime...')

    // Subscribe ke perubahan tabel barang
    const barangChannel = supabase
      .channel('barang-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'barang'
        },
        (payload) => {
          console.log('Realtime - Barang changed:', payload)

          // Trigger refresh data
          fetchBarang()

          // Trigger notifikasi untuk stok menipis
          if (payload.eventType === 'UPDATE' && payload.new?.stok < 10) {
            showLowStockNotification(payload.new)
          }
        }
      )
      .subscribe((status) => {
        console.log('Barang channel status:', status)
      })

    // Subscribe ke perubahan tabel transaksi
    const transaksiChannel = supabase
      .channel('transaksi-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transaksi'
        },
        (payload) => {
          console.log('Realtime - New transaction:', payload)

          // Refresh transaksi dan stok
          fetchTransaksi()
          fetchBarang()

          // Trigger notifikasi transaksi baru
          showTransactionNotification(payload.new)
        }
      )
      .subscribe((status) => {
        console.log('Transaksi channel status:', status)
      })

    // Simpan subscriptions untuk cleanup
    subscriptions.value = [barangChannel, transaksiChannel]

    // Return cleanup function
    return () => {
      console.log('Cleaning up realtime subscriptions...')
      subscriptions.value.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }

  const showLowStockNotification = (barang: any) => {
    // Gunakan Notification API jika tersedia
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Peringatan Stok Menipis!', {
        body: `${barang.nama} (${barang.kode}) tersisa ${barang.stok} unit`,
        icon: '/icon.png'
      })
    }

    // Tampilkan toast notification di UI
    showToast(`⚠️ Stok ${barang.nama} menipis! Sisa: ${barang.stok}`, 'warning')
  }

  const showTransactionNotification = (transaksi: any) => {
    showToast(
      `Transaksi ${transaksi.tipe_transaksi === 'masuk' ? '📥 Masuk' : '📤 Keluar'}: ${transaksi.jumlah} unit`,
      'info'
    )
  }

  const showToast = (message: string, type: string = 'info') => {
    // Simple toast implementation
    const toast = document.createElement('div')
    toast.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-slide-in ${type === 'warning' ? 'bg-yellow-500' :
        type === 'error' ? 'bg-red-500' :
          'bg-green-500'
      } text-white`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.remove()
    }, 3000)
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  return {
    initRealtime,
    requestNotificationPermission,
    showToast
  }
}