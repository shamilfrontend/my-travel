<script setup lang="ts">
import AppHeader from './AppHeader.vue';
</script>

<template>
  <div class="app-layout">
    <AppHeader />

    <div class="app-body">
      <main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-body {
  flex: 1;
  margin: 0 auto;
  width: 100%;
}

.app-main {
  flex: 1;
  min-width: 0;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.15s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
