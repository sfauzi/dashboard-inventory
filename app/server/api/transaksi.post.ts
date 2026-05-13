import { useSupabaseClient } from '#imports'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const supabase = useSupabaseClient()

    console.log('Transaction request:', body)

    // For testing, use a fixed test user ID
    // You can also implement proper authentication
    const testUserId = 'test-user-id' // Replace with actual test user ID

    try {
        // Validate input
        if (!body.id_barang) {
            throw createError({
                statusCode: 400,
                message: 'Barang ID is required'
            })
        }

        if (!body.tipe_transaksi || !['masuk', 'keluar'].includes(body.tipe_transaksi)) {
            throw createError({
                statusCode: 400,
                message: 'Invalid transaction type'
            })
        }

        if (!body.jumlah || body.jumlah <= 0) {
            throw createError({
                statusCode: 400,
                message: 'Jumlah must be greater than 0'
            })
        }

        let result

        if (body.tipe_transaksi === 'masuk') {
            // For now, use direct insert instead of RPC to debug
            const { data: barang, error: barangError } = await supabase
                .from('barang')
                .select('stok')
                .eq('id', body.id_barang)
                .single()

            if (barangError || !barang) {
                throw createError({
                    statusCode: 404,
                    message: 'Barang not found'
                })
            }

            const newStock = barang.stok + body.jumlah

            const { error: updateError } = await supabase
                .from('barang')
                .update({ stok: newStock, updated_at: new Date() })
                .eq('id', body.id_barang)

            if (updateError) throw updateError

            const { error: transaksiError } = await supabase
                .from('transaksi')
                .insert([{
                    id_barang: body.id_barang,
                    tanggal: new Date(),
                    tipe_transaksi: 'masuk',
                    jumlah: body.jumlah,
                    id_user: testUserId,
                    catatan: body.catatan || null
                }])

            if (transaksiError) throw transaksiError

            result = { success: true, new_stok: newStock }
        } else {
            // Stock out
            const { data: barang, error: barangError } = await supabase
                .from('barang')
                .select('stok')
                .eq('id', body.id_barang)
                .single()

            if (barangError || !barang) {
                throw createError({
                    statusCode: 404,
                    message: 'Barang not found'
                })
            }

            if (barang.stok < body.jumlah) {
                throw createError({
                    statusCode: 400,
                    message: `Insufficient stock. Available: ${barang.stok}`
                })
            }

            const newStock = barang.stok - body.jumlah

            const { error: updateError } = await supabase
                .from('barang')
                .update({ stok: newStock, updated_at: new Date() })
                .eq('id', body.id_barang)

            if (updateError) throw updateError

            const { error: transaksiError } = await supabase
                .from('transaksi')
                .insert([{
                    id_barang: body.id_barang,
                    tanggal: new Date(),
                    tipe_transaksi: 'keluar',
                    jumlah: body.jumlah,
                    id_user: testUserId,
                    catatan: body.catatan || null
                }])

            if (transaksiError) throw transaksiError

            result = { success: true, new_stok: newStock }
        }

        return {
            success: true,
            new_stok: result.new_stok,
            message: 'Transaction successful'
        }
    } catch (error: any) {
        console.error('Transaction error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Internal server error'
        })
    }
})