<script setup lang="ts">
import { ref } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const isReady = ref(!authStore.isAuthenticated);

if (authStore.isAuthenticated) {
  authStore.fetchProfile().finally(() => {
    isReady.value = true;
  });
}
</script>

<template>
  <div v-if="!isReady" class="app-loader">
    <div class="app-loader-spinner" />
  </div>
  <AppLayout v-else />
</template>

<style lang="scss" scoped>
.app-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.app-loader-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #6C5CE7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
