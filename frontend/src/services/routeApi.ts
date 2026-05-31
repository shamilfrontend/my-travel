import api from './api';
import type { TravelRoute } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import { getMockMyRoutes, getMockCommunityRoutes, getMockRouteById } from '@/mocks';

export interface CreateRoutePayload {
  name: string;
  description?: string;
  geoMarkIds: string[];
}

export interface UpdateRoutePayload {
  name?: string;
  description?: string;
  geoMarkIds?: string[];
}

export const routeApi = {
  async getMy(): Promise<TravelRoute[]> {
    if (USE_MOCKS) {
      return mockDelay(getMockMyRoutes());
    }

    const { data } = await api.get<TravelRoute[]>('/routes');
    return data;
  },

  async getCommunity(sort?: 'recent' | 'popular'): Promise<TravelRoute[]> {
    if (USE_MOCKS) {
      const routes = getMockCommunityRoutes();
      const sorted = sort === 'popular'
        ? [...routes].sort((a, b) => (b.copyCount ?? 0) - (a.copyCount ?? 0))
        : routes;

      return mockDelay(sorted);
    }

    const params = sort === 'popular' ? { sort: 'popular' } : {};
    const { data } = await api.get<TravelRoute[]>('/routes/community', { params });
    return data;
  },

  async getById(id: string): Promise<TravelRoute> {
    if (USE_MOCKS) {
      const route = getMockRouteById(id);
      if (!route) throw new Error('Route not found');
      return mockDelay(route);
    }

    const { data } = await api.get<TravelRoute>(`/routes/${id}`);
    return data;
  },

  async create(payload: CreateRoutePayload): Promise<TravelRoute> {
    const { data } = await api.post<TravelRoute>('/routes', payload);
    return data;
  },

  async update(id: string, payload: UpdateRoutePayload): Promise<TravelRoute> {
    const { data } = await api.put<TravelRoute>(`/routes/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/routes/${id}`);
  },

  async copy(id: string): Promise<TravelRoute> {
    const { data } = await api.post<TravelRoute>(`/routes/${id}/copy`);
    return data;
  },

  async downloadExport(id: string, format: 'json' | 'gpx'): Promise<void> {
    const { data } = await api.get(`/routes/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format === 'gpx' ? 'route.gpx' : 'route.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  getExportUrl(id: string, format: 'json' | 'gpx'): string {
    return `/api/routes/${id}/export?format=${format}`;
  },
};
