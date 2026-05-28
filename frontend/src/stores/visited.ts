import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { VisitedPlace, VisitedStatistics } from '@/types';
import { visitedApi } from '@/services/visitedApi';
import type { CreateVisitedPayload, UpdateVisitedPayload } from '@/services/visitedApi';

export const useVisitedStore = defineStore('visited', () => {
  const places = ref<VisitedPlace[]>([]);
  const statistics = ref<VisitedStatistics | null>(null);

  const allPlaces = ref<VisitedPlace[]>([]);
  const allStatistics = ref<VisitedStatistics | null>(null);

  const mode = ref<'all' | 'my'>('all');
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const selectedYear = ref<number | undefined>(undefined);

  const displayPlaces = computed(() =>
    mode.value === 'all' ? allPlaces.value : places.value,
  );

  const displayStatistics = computed(() =>
    mode.value === 'all' ? allStatistics.value : statistics.value,
  );

  async function fetchPlaces(year?: number) {
    isLoading.value = true;
    error.value = null;
    try {
      places.value = await visitedApi.getAll(year);
    } catch {
      error.value = 'Не удалось загрузить места';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchStatistics(year?: number) {
    try {
      statistics.value = await visitedApi.getStatistics(year);
    } catch {
      error.value = 'Не удалось загрузить статистику';
    }
  }

  async function fetchAllPlaces(year?: number) {
    isLoading.value = true;
    error.value = null;
    try {
      allPlaces.value = await visitedApi.getAllPublic(year);
    } catch {
      error.value = 'Не удалось загрузить места';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAllStatistics(year?: number) {
    try {
      allStatistics.value = await visitedApi.getPublicStatistics(year);
    } catch {
      error.value = 'Не удалось загрузить статистику';
    }
  }

  async function addPlace(payload: CreateVisitedPayload) {
    const place = await visitedApi.create(payload);
    places.value.unshift(place);
    allPlaces.value.unshift(place);
    return place;
  }

  async function updatePlace(id: string, payload: UpdateVisitedPayload) {
    const updated = await visitedApi.update(id, payload);
    const idx = places.value.findIndex((p) => p._id === id);
    if (idx !== -1) places.value[idx] = updated;
    const allIdx = allPlaces.value.findIndex((p) => p._id === id);
    if (allIdx !== -1) allPlaces.value[allIdx] = updated;
    return updated;
  }

  async function deletePlace(id: string) {
    await visitedApi.remove(id);
    places.value = places.value.filter((p) => p._id !== id);
    allPlaces.value = allPlaces.value.filter((p) => p._id !== id);
  }

  function setMode(newMode: 'all' | 'my') {
    mode.value = newMode;
  }

  function filterByYear(year?: number) {
    selectedYear.value = year;
    fetchPlaces(year);
    fetchStatistics(year);
    fetchAllPlaces(year);
    fetchAllStatistics(year);
  }

  async function loadAll() {
    await Promise.all([
      fetchPlaces(),
      fetchStatistics(),
      fetchAllPlaces(),
      fetchAllStatistics(),
    ]);
  }

  return {
    places, statistics, allPlaces, allStatistics,
    mode, displayPlaces, displayStatistics,
    isLoading, error, selectedYear,
    fetchPlaces, fetchStatistics, fetchAllPlaces, fetchAllStatistics,
    addPlace, updatePlace, deletePlace,
    setMode, filterByYear, loadAll,
  };
});
