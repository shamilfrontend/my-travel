import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { GeoMark } from '@/types';
import { geoMarkApi } from '@/services/geoMarkApi';
import type { CreateGeoMarkPayload, UpdateGeoMarkPayload } from '@/services/geoMarkApi';

export const useMapStore = defineStore('map', () => {
  const geoMarks = ref<GeoMark[]>([]);
  const selectedMark = ref<GeoMark | null>(null);
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

  async function updateMark(id: string, payload: UpdateGeoMarkPayload) {
    const updated = await geoMarkApi.update(id, payload);
    const index = geoMarks.value.findIndex((m) => m._id === id);
    if (index !== -1) geoMarks.value[index] = updated;
    return updated;
  }

  async function deleteMark(id: string) {
    await geoMarkApi.remove(id);
    geoMarks.value = geoMarks.value.filter((m) => m._id !== id);
    if (selectedMark.value?._id === id) selectedMark.value = null;
  }

  function selectMark(mark: GeoMark | null) {
    selectedMark.value = mark;
  }

  return { geoMarks, selectedMark, isLoading, error, fetchGeoMarks, addMark, updateMark, deleteMark, selectMark };
});
