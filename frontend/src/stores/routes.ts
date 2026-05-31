import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TravelRoute } from '@/types';
import { routeApi } from '@/services/routeApi';
import type { CreateRoutePayload, UpdateRoutePayload } from '@/services/routeApi';

export const useRoutesStore = defineStore('routes', () => {
  const myRoutes = ref<TravelRoute[]>([]);
  const communityRoutes = ref<TravelRoute[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMyRoutes() {
    isLoading.value = true;
    error.value = null;
    try {
      myRoutes.value = await routeApi.getMy();
    } catch {
      error.value = 'Не удалось загрузить маршруты';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCommunityRoutes(sort?: 'recent' | 'popular') {
    isLoading.value = true;
    error.value = null;
    try {
      communityRoutes.value = await routeApi.getCommunity(sort);
    } catch {
      error.value = 'Не удалось загрузить маршруты сообщества';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchRouteById(id: string): Promise<TravelRoute> {
    return routeApi.getById(id);
  }

  async function createRoute(payload: CreateRoutePayload) {
    const route = await routeApi.create(payload);
    myRoutes.value.unshift(route);
    return route;
  }

  async function updateRoute(id: string, payload: UpdateRoutePayload) {
    const updated = await routeApi.update(id, payload);
    const index = myRoutes.value.findIndex((r) => r._id === id);
    if (index !== -1) myRoutes.value[index] = updated;
    return updated;
  }

  async function deleteRoute(id: string) {
    await routeApi.remove(id);
    myRoutes.value = myRoutes.value.filter((r) => r._id !== id);
  }

  async function copyRoute(id: string) {
    const newRoute = await routeApi.copy(id);
    myRoutes.value.unshift(newRoute);
    return newRoute;
  }

  return {
    myRoutes,
    communityRoutes,
    isLoading,
    error,
    fetchMyRoutes,
    fetchCommunityRoutes,
    fetchRouteById,
    createRoute,
    updateRoute,
    deleteRoute,
    copyRoute,
  };
});
