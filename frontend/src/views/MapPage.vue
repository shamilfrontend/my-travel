<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { UserWithStats } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { useVisitedStore } from '@/stores/visited';
import { usersApi } from '@/services/usersApi';
import { ALPHA2_TO_NUMERIC } from '@/utils/country-codes';
import {
  getWorldCountryAreaStats,
  isPointInRussia,
  normalizeMapRegion,
  type MapRegion,
} from '@/utils/map-regions';

const VisitedMapView = defineAsyncComponent(() =>
  import('@/components/visited/VisitedMapView.vue'),
);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const visitedStore = useVisitedStore();
const activeRegion = ref<MapRegion>('world');
const activeMode = ref<'all' | 'my'>('all');
const users = ref<UserWithStats[]>([]);
const isLoadingUsers = ref(false);

const { countryAreaByNumericCode, totalWorldArea } = getWorldCountryAreaStats();

const mapUserOptions = computed(() => {
  const currentUserId = authStore.user?._id;

  return users.value
    .filter((user) => user.visitedCount > 0 && user._id !== currentUserId)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
});

const selectedUserId = computed(() => {
  const userId = route.query.userId;
  return typeof userId === 'string' ? userId : '';
});

function normalizeTab(value: unknown): 'all' | 'my' {
  if (value === 'my') return 'my';
  // legacy value used in deep links from route builder
  if (value === 'marks') return 'my';
  return 'all';
}

const regionTabs = computed(() => [
  { value: 'world' as const, label: 'Весь мир' },
  { value: 'russia' as const, label: 'Россия' },
]);

const modeOptions = computed(() => [
  { value: 'all' as const, label: 'Все метки' },
  { value: 'my' as const, label: 'Мои метки' },
]);

const mapStats = computed(() => {
  const statistics = visitedStore.displayStatistics;
  const countryCodes = statistics?.countryCodes ?? [];

  if (activeRegion.value === 'russia') {
    const russiaPlaces = visitedStore.displayPlaces.filter((place) =>
      isPointInRussia(place.coordinates.lat, place.coordinates.lng),
    );

    return {
      showPercent: false,
      showCountries: false,
      visitedLocations: russiaPlaces.length,
    };
  }

  const visitedCountries = statistics?.countries.length ?? 0;
  const visitedLocations = statistics?.totalPlaces ?? 0;
  const visitedArea = countryCodes.reduce((sum, countryCode) => {
    const numericCode = Number(ALPHA2_TO_NUMERIC[countryCode.toUpperCase()]);
    if (!Number.isFinite(numericCode)) return sum;
    return sum + (countryAreaByNumericCode.get(numericCode) ?? 0);
  }, 0);
  const worldPercent = totalWorldArea > 0
    ? Math.round((visitedArea / totalWorldArea) * 1000) / 10
    : 0;

  return {
    showPercent: true,
    showCountries: true,
    percent: worldPercent,
    percentLabel: 'мира',
    visitedCountries,
    visitedLocations,
  };
});

function buildRouteQuery(updates: {
  region?: MapRegion;
  tab?: 'all' | 'my';
  userId?: string | null;
}) {
  const query = { ...route.query } as Record<string, string | string[] | undefined>;

  if ('region' in updates) {
    if (updates.region === 'world') {
      delete query.region;
    } else {
      query.region = updates.region;
    }
  }

  if ('tab' in updates) {
    query.tab = updates.tab;
  }

  if ('userId' in updates) {
    if (updates.userId) {
      query.userId = updates.userId;
    } else {
      delete query.userId;
    }
  }

  return query;
}

onMounted(async () => {
  isLoadingUsers.value = true;
  try {
    users.value = await usersApi.getAll();
  } catch {
    users.value = [];
  } finally {
    isLoadingUsers.value = false;
  }
});

watch(
  () => route.query.region,
  (region) => {
    const nextRegion = normalizeMapRegion(region);
    if (activeRegion.value !== nextRegion) {
      activeRegion.value = nextRegion;
    }

    if (region === 'world' || (region !== nextRegion && region !== undefined)) {
      router.replace({ query: buildRouteQuery({ region: nextRegion }) });
    }
  },
  { immediate: true },
);

watch(
  () => route.query.tab,
  (tab) => {
    if (typeof route.query.userId === 'string') {
      if (activeMode.value !== 'all') {
        activeMode.value = 'all';
      }
      return;
    }

    const nextTab = normalizeTab(tab);
    if (activeMode.value !== nextTab) {
      activeMode.value = nextTab;
    }

    if (tab !== nextTab) {
      router.replace({ query: buildRouteQuery({ tab: nextTab }) });
    }
  },
  { immediate: true },
);

watch(
  () => route.query.userId,
  (userId) => {
    if (typeof userId !== 'string' || !userId) {
      visitedStore.setFilterUserId(null);
      return;
    }

    const currentUserId = authStore.user?._id;
    if (currentUserId && userId === currentUserId) {
      router.replace({ query: buildRouteQuery({ tab: 'my', userId: null }) });
      return;
    }

    visitedStore.setFilterUserId(userId);
    if (activeMode.value !== 'all') {
      activeMode.value = 'all';
    }
  },
  { immediate: true },
);

function setRegion(region: MapRegion) {
  if (activeRegion.value === region && normalizeMapRegion(route.query.region) === region) return;
  activeRegion.value = region;
  router.replace({ query: buildRouteQuery({ region }) });
}

function setMode(mode: 'all' | 'my') {
  const hasUserFilter = typeof route.query.userId === 'string';
  if (activeMode.value === mode && route.query.tab === mode && !hasUserFilter) return;

  visitedStore.setFilterUserId(null);
  activeMode.value = mode;
  router.replace({ query: buildRouteQuery({ tab: mode, userId: null }) });
}

function setFilterUser(userId: string) {
  if (!userId) {
    clearUserFilter();
    return;
  }

  const currentUserId = authStore.user?._id;
  if (currentUserId && userId === currentUserId) {
    activeMode.value = 'my';
    router.replace({ query: buildRouteQuery({ tab: 'my', userId: null }) });
    return;
  }

  activeMode.value = 'all';
  router.replace({ query: buildRouteQuery({ tab: 'all', userId }) });
}

function clearUserFilter() {
  visitedStore.setFilterUserId(null);
  router.replace({ query: buildRouteQuery({ userId: null }) });
}

function handleUserFilterChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  setFilterUser(target.value);
}
</script>

<template>
  <div class="map-page">
    <div class="tabs-bar">
      <div
        class="tabs-group"
        role="tablist"
        aria-label="Регион карты"
      >
        <button
          v-for="item in regionTabs"
          :key="item.value"
          class="tab-btn"
          :class="{ active: activeRegion === item.value }"
          role="tab"
          :aria-selected="activeRegion === item.value"
          :tabindex="activeRegion === item.value ? 0 : -1"
          @click="setRegion(item.value)"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="mode-controls">
        <div
          class="mode-radio-group"
          role="radiogroup"
          aria-label="Режим просмотра меток"
        >
          <label
            v-for="item in modeOptions"
            :key="item.value"
            class="mode-radio"
            :class="{ active: activeMode === item.value }"
          >
            <input
              type="radio"
              name="map-mode"
              class="mode-radio__input"
              :value="item.value"
              :checked="activeMode === item.value"
              @change="setMode(item.value)"
            >
            <span class="mode-radio__label">{{ item.label }}</span>
          </label>
        </div>

        <label class="user-filter">
          <span class="user-filter__label">Пользователь</span>
          <select
            class="user-filter__select"
            :value="selectedUserId"
            :disabled="isLoadingUsers"
            aria-label="Показать метки пользователя"
            @change="handleUserFilterChange"
          >
            <option value="">Не выбран</option>
            <option
              v-for="user in mapUserOptions"
              :key="user._id"
              :value="user._id"
            >
              {{ user.name }}
            </option>
          </select>
        </label>
      </div>

      <div class="stats-list" aria-label="Статистика посещений">
        <div v-if="mapStats.showPercent && mapStats.percent !== undefined" class="stats-item">
          <span class="stats-value">{{ mapStats.percent.toFixed(1) }}%</span>
          <span class="stats-label">{{ mapStats.percentLabel }}</span>
        </div>
        <div v-if="mapStats.showCountries && mapStats.visitedCountries !== undefined" class="stats-item">
          <span class="stats-value">{{ mapStats.visitedCountries }}</span>
          <span class="stats-label">стран</span>
        </div>
        <div class="stats-item">
          <span class="stats-value">{{ mapStats.visitedLocations }}</span>
          <span class="stats-label">локаций</span>
        </div>
      </div>
    </div>

    <div class="map-content">
      <Suspense>
        <VisitedMapView :mode="activeMode" :region="activeRegion" />
        <template #fallback>
          <div class="map-loading" aria-live="polite">
            <div class="map-loading__spinner" />
            <p>Загрузка карты...</p>
          </div>
        </template>
      </Suspense>
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
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  background: white;
  border-bottom: 1px solid $gray-200;
  padding: 0.5rem 1rem;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 5;
}

.tabs-group {
  grid-column: 1;
  justify-self: start;
  display: flex;
  gap: 0.25rem;
}

.tab-btn {
  min-height: 40px;
  padding: 0.625rem 1rem;
  font-size: $font-size-base;
  font-weight: 500;
  color: $gray-500;
  background: none;
  border: 1px solid transparent;
  border-radius: $radius;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;

  &:hover {
    color: $gray-700;
    background: $gray-50;
  }

  &:focus-visible {
    outline: none;
    border-color: rgba($primary, 0.35);
  }

  &.active {
    color: $primary;
    border-color: rgba($primary, 0.24);
    background: rgba($primary, 0.08);
  }
}

.mode-controls {
  grid-column: 2;
  justify-self: center;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.mode-radio-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mode-radio {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
  color: $gray-500;
  font-size: $font-size-sm;
  font-weight: 500;
  user-select: none;

  &:hover {
    color: $gray-700;
  }

  &.active {
    color: $gray-900;
  }
}

.mode-radio__input {
  width: 1rem;
  height: 1rem;
  margin: 0;
  accent-color: $primary;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid rgba($primary, 0.35);
    outline-offset: 2px;
  }
}

.mode-radio__label {
  line-height: 1;
}

.user-filter {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.user-filter__label {
  font-size: $font-size-sm;
  font-weight: 500;
  color: $gray-500;
  white-space: nowrap;
}

.user-filter__select {
  min-width: 9rem;
  max-width: 11rem;
  height: 36px;
  padding: 0 1.75rem 0 0.625rem;
  font-size: $font-size-sm;
  font-weight: 500;
  color: $gray-700;
  background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M3 4.5 6 7.5 9 4.5'/%3E%3C/svg%3E") no-repeat right 0.5rem center;
  border: 1px solid $gray-200;
  border-radius: $radius;
  cursor: pointer;
  appearance: none;

  &:hover:not(:disabled) {
    border-color: $gray-300;
  }

  &:focus-visible {
    outline: none;
    border-color: rgba($primary, 0.35);
    box-shadow: 0 0 0 3px rgba($primary, 0.12);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.stats-list {
  grid-column: 3;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stats-item {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  color: $gray-500;
  white-space: nowrap;
}

.stats-value {
  font-size: $font-size-base;
  font-weight: 700;
  color: $gray-900;
  line-height: 1;
}

.stats-label {
  font-size: $font-size-sm;
}

.map-content {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.map-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: $gray-500;
  background: $gray-50;
}

.map-loading__spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid $gray-200;
  border-top-color: $primary;
  border-radius: 50%;
  animation: map-loading-spin 0.8s linear infinite;
}

@keyframes map-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

@include mobile {
  .tabs-bar {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
  }

  .tabs-group {
    grid-column: 1;
    grid-row: 1;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .mode-controls {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-self: center;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .user-filter {
    width: 100%;
    justify-content: center;
  }

  .user-filter__select {
    max-width: 14rem;
    flex: 1;
  }

  .tab-btn {
    flex: 1 0 auto;
    font-size: $font-size-sm;
    padding: 0.5rem 0.875rem;
  }

  .stats-list {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
    gap: 0.75rem;
  }

  .stats-value {
    font-size: $font-size-sm;
  }
}
</style>
