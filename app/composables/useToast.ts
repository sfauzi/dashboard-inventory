export const useToast = () => {
    const toasts = useState('toasts', () => [])

    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) => {
        const id = Date.now()
        const toast = {
            id,
            message,
            type,
            duration
        }

        toasts.value.push(toast)

        // Auto remove after duration
        setTimeout(() => {
            removeToast(id)
        }, duration)

        return id
    }

    const removeToast = (id: number) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }

    const clearToasts = () => {
        toasts.value = []
    }

    return {
        toasts: readonly(toasts),
        showToast,
        removeToast,
        clearToasts
    }
}