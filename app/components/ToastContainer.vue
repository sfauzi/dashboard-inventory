<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md',
          toast.type === 'success' ? 'bg-green-500 text-white' : '',
          toast.type === 'error' ? 'bg-red-500 text-white' : '',
          toast.type === 'warning' ? 'bg-yellow-500 text-white' : '',
          toast.type === 'info' ? 'bg-blue-500 text-white' : '',
        ]"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <Icon :name="getIcon(toast.type)" class="w-5 h-5" />
        </div>

        <!-- Message -->
        <div class="flex-1 text-sm font-medium">
          {{ toast.message }}
        </div>

        <!-- Close button -->
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 hover:opacity-75 transition"
        >
          <Icon name="mdi:close" class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
const { toasts, removeToast } = useToast();

const getIcon = (type) => {
  switch (type) {
    case "success":
      return "mdi:check-circle";
    case "error":
      return "mdi:alert-circle";
    case "warning":
      return "mdi:alert";
    default:
      return "mdi:information";
  }
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
