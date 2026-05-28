import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { GeoMark } from '@/types';
import { geoMarkApi } from '@/services/geoMarkApi';
import type { CreateGeoMarkPayload } from '@/services/geoMarkApi';

export const useMapStore = defineStore('map', () => {
  const geoMarks = ref<GeoMark[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchGeoMarks() {
    isLoading.value = true;
    error.value = null;
    try {
      geoMarks.value = await geoMarkApi.getAll();
    } catch {
      error.value = 'Не удалось загрузить метки';
    } finally {
      isLoading.value = false;
    }
  }

  async function addMark(payload: CreateGeoMarkPayload) {
    const mark = await geoMarkApi.create(payload);
    geoMarks.value.unshift(mark);
    return mark;
  }

  return { geoMarks, isLoading, error, fetchGeoMarks, addMark };
});
