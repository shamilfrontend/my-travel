<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import VisitedMapView from '@/components/visited/VisitedMapView.vue';

const route = useRoute();
const activeTab = ref<'all' | 'my'>('all');

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'my') activeTab.value = 'my';
    else activeTab.value = 'all';
  },
  { immediate: true },
);
</script>

<template>
  <div class="map-page">
    <div class="tabs-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        Все метки
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'my' }"
        @click="activeTab = 'my'"
      >
        Мои метки
      </button>
    </div>

    <div class="map-content">
      <VisitedMapView :mode="activeTab" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  height: calc(100vh - 64px);
}

.tabs-bar {
  display: flex;
  gap: 0;
  background: white;
  border-bottom: 1px solid $gray-200;
  padding: 0 1rem;
  flex-shrink: 0;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  font-size: $font-size-base;
  font-weight: 500;
  color: $gray-500;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: $gray-700;
  }

  &.active {
    color: $primary;
    border-bottom-color: $primary;
  }
}

.map-content {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}
</style>
