import { defineNuxtPlugin, useSupabaseClient } from '#imports'

export default defineNuxtPlugin(() => {
  // Pastikan Supabase client tersedia di client-side
  const supabase = useSupabaseClient()
  
  if (supabase) {
    console.log('Supabase client initialized')
    
    // Optional: Handle auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
    })
  } else {
    console.warn('Supabase client not available')
  }
})