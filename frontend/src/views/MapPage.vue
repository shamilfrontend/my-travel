<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { geoArea } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import VisitedMapView from '@/components/visited/VisitedMapView.vue';
import { useVisitedStore } from '@/stores/visited';
import worldTopology from '@/utils/world-topology';
import { ALPHA2_TO_NUMERIC } from '@/utils/country-codes';
import {
  isPointInRussia,
  normalizeMapRegion,
  type MapRegion,
} from '@/utils/map-regions';

const route = useRoute();
const router = useRouter();
const visitedStore = useVisitedStore();
const activeRegion = ref<MapRegion>('world');
const activeMode = ref<'all' | 'my'>('all');

const topology = worldTopology as unknown as Topology<{ countries: GeometryCollection }>;
const countryFeatures = feature(topology, topology.objects.countries) as FeatureCollection<Geometry>;
const countryAreaByNumericCode = new Map<number, number>();
let totalWorldArea = 0;

countryFeatures.features.forEach((countryFeature) => {
  const numericCode = Number(countryFeature.id);
  if (!Number.isFinite(numericCode)) return;
  const countryArea = geoArea(countryFeature as Feature<Geometry>);
  countryAreaByNumericCode.set(numericCode, countryArea);
  totalWorldArea += countryArea;
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
    const hasVisitedRussia = countryCodes.includes('RU');
    const russiaPercent = hasVisitedRussia ? 100 : 0;

    return {
      percent: russiaPercent,
      percentLabel: 'России',
      visitedCountries: hasVisitedRussia ? 1 : 0,
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
    percent: worldPercent,
    percentLabel: 'мира',
    visitedCountries,
    visitedLocations,
  };
});

function buildRouteQuery(updates: { region?: MapRegion; tab?: 'all' | 'my' }) {
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

  return query;
}

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

function setRegion(region: MapRegion) {
  if (activeRegion.value === region && normalizeMapRegion(route.query.region) === region) return;
  activeRegion.value = region;
  router.replace({ query: buildRouteQuery({ region }) });
}

function setMode(mode: 'all' | 'my') {
  if (activeMode.value === mode && route.query.tab === mode) return;
  activeMode.value = mode;
  router.replace({ query: buildRouteQuery({ tab: mode }) });
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

      <div class="stats-list" aria-label="Статистика посещений">
        <div class="stats-item">
          <span class="stats-value">{{ mapStats.percent.toFixed(1) }}%</span>
          <span class="stats-label">{{ mapStats.percentLabel }}</span>
        </div>
        <div class="stats-item">
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
      <VisitedMapView :mode="activeMode" :region="activeRegion" />
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

.mode-radio-group {
  grid-column: 2;
  justify-self: center;
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

  .mode-radio-group {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-self: center;
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
