import { onMounted, onUnmounted, ref } from 'vue'

export const useInterval = (callback: () => void, delay: number) => {
  const intervalId = ref(null)
  const isRunning = ref(false)
  
  const start = () => {
    if (isRunning.value) return
    isRunning.value = true
    intervalId.value = setInterval(callback, delay)
  }
  
  const stop = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
      isRunning.value = false
    }
  }
  
  onMounted(() => {
    start()
  })
  
  onUnmounted(() => {
    stop()
  })
  
  return { start, stop, isRunning }
}