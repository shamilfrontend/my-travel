<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useRoutesStore } from '@/stores/routes';
import { useMapStore } from '@/stores/map';
import type { TravelRoute } from '@/types';
import RouteList from '@/components/routes/RouteList.vue';
import RouteEditor from '@/components/routes/RouteEditor.vue';

const route = useRoute();
const routesStore = useRoutesStore();
const mapStore = useMapStore();
const activeTab = ref<'my' | 'public'>('my');
const publicSort = ref<'recent' | 'popular'>('recent');
const showEditor = ref(false);
const editingRoute = ref<TravelRoute | null>(null);

onMounted(async () => {
  routesStore.fetchMyRoutes();
  routesStore.fetchPublicRoutes();
  if (route.query.new === '1') {
    await ensureMarksLoaded();
    editingRoute.value = null;
    showEditor.value = true;
  }
});

watch(publicSort, (sort) => {
  routesStore.fetchPublicRoutes(sort);
});

async function ensureMarksLoaded() {
  if (mapStore.geoMarks.length === 0) {
    await mapStore.fetchGeoMarks();
  }
}

async function openEditor() {
  await ensureMarksLoaded();
  editingRoute.value = null;
  showEditor.value = true;
}

async function openEditRoute(route: TravelRoute) {
  await ensureMarksLoaded();
  const fullRoute = await routesStore.fetchRouteById(route._id);
  editingRoute.value = fullRoute;
  showEditor.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeEditor() {
  showEditor.value = false;
  editingRoute.value = null;
}

function handleRouteCreated() {
  closeEditor();
  routesStore.fetchMyRoutes();
}

function handleRouteUpdated() {
  closeEditor();
  routesStore.fetchMyRoutes();
}
</script>

<template>
  <div class="routes-page container">
    <div class="page-header">
      <h1>Маршруты</h1>
      <button class="btn-primary" @click="openEditor" v-if="!showEditor">Создать маршрут</button>
    </div>

    <RouteEditor v-if="showEditor" :route="editingRoute ?? undefined" @created="handleRouteCreated" @updated="handleRouteUpdated" />
    <button v-if="showEditor" class="btn-secondary cancel-btn" @click="closeEditor">Отмена</button>

    <div class="tabs">
      <button :class="['tab', { active: activeTab === 'my' }]" @click="activeTab = 'my'">Мои</button>
      <button :class="['tab', { active: activeTab === 'public' }]" @click="activeTab = 'public'">Публичные</button>
    </div>

    <div v-if="activeTab === 'public'" class="sort-bar">
      <button :class="['sort-btn', { active: publicSort === 'recent' }]" @click="publicSort = 'recent'">Новые</button>
      <button :class="['sort-btn', { active: publicSort === 'popular' }]" @click="publicSort = 'popular'">Популярные</button>
    </div>

    <RouteList v-if="activeTab === 'my'" :routes="routesStore.myRoutes" :show-actions="true" @edit="openEditRoute" />
    <RouteList v-else :routes="routesStore.publicRoutes" :show-copy="true" />
  </div>
</template>

<style lang="scss" scoped>
.routes-page {
  padding: 2rem 1rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  h1 {
    margin: 0;
  }
}

.cancel-btn {
  margin-top: 0.75rem;
  margin-bottom: 1.5rem;
}

.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1rem;
  border-bottom: 2px solid $gray-200;
}

.tab {
  padding: 0.75rem 1.5rem;
  font-size: $font-size-base;
  font-weight: 500;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  color: $gray-500;
  transition: all 0.2s;

  &.active {
    color: $primary;
    border-bottom-color: $primary;
  }
}

.sort-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.sort-btn {
  padding: 0.375rem 0.75rem;
  font-size: $font-size-sm;
  border: 1px solid $gray-200;
  border-radius: $radius-sm;
  background: white;
  color: $gray-500;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: $primary;
    color: white;
    border-color: $primary;
  }
}
</style>
