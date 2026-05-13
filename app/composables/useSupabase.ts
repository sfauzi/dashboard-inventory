export const useSupabase = () => {
    const { supabase } = useSupabaseClient()
    const isReady = ref(false)

    const waitForClient = async (timeout = 5000) => {
        const startTime = Date.now()
        while (!supabase && Date.now() - startTime < timeout) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        isReady.value = !!supabase
        return isReady.value
    }

    return {
        supabase: readonly(supabase),
        isReady: readonly(isReady),
        waitForClient
    }
}