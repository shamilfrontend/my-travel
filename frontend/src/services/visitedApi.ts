import api from './api';
import type { VisitedPlace, VisitedStatistics, Coordinates } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import {
  getMockMyVisited,
  getMockVisitedStatistics,
  mockVisitedPlaces,
  mockPublicVisitedStatistics,
} from '@/mocks';

export interface CreateVisitedPayload {
  title: string;
  coordinates: Coordinates;
  visitedDate?: string;
  note?: string;
  mediaIds?: string[];
}

export interface UpdateVisitedPayload {
  title?: string;
  coordinates?: Coordinates;
  visitedDate?: string;
  note?: string;
  mediaIds?: string[];
}

function filterByYear(places: VisitedPlace[], year?: number): VisitedPlace[] {
  if (!year) return places;

  return places.filter(
    (place) => place.visitedDate && new Date(place.visitedDate).getFullYear() === year,
  );
}

export const visitedApi = {
  async getAll(year?: number): Promise<VisitedPlace[]> {
    if (USE_MOCKS) {
      return mockDelay(filterByYear(getMockMyVisited(), year));
    }

    const params = year ? { year } : {};
    const { data } = await api.get<VisitedPlace[]>('/visited', { params });
    return data;
  },

  async create(payload: CreateVisitedPayload): Promise<VisitedPlace> {
    const { data } = await api.post<VisitedPlace>('/visited', payload);
    return data;
  },

  async update(id: string, payload: UpdateVisitedPayload): Promise<VisitedPlace> {
    const { data } = await api.put<VisitedPlace>(`/visited/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/visited/${id}`);
  },

  async getStatistics(year?: number): Promise<VisitedStatistics> {
    if (USE_MOCKS) {
      const stats = getMockVisitedStatistics();
      if (!stats) throw new Error('Statistics not found');
      return mockDelay(stats);
    }

    const params = year ? { year } : {};
    const { data } = await api.get<VisitedStatistics>('/visited/statistics', { params });
    return data;
  },

  async getAllPublic(year?: number): Promise<VisitedPlace[]> {
    if (USE_MOCKS) {
      return mockDelay(filterByYear(mockVisitedPlaces, year));
    }

    const params = year ? { year } : {};
    const { data } = await api.get<VisitedPlace[]>('/visited/public', { params });
    return data;
  },

  async getPublicStatistics(year?: number): Promise<VisitedStatistics> {
    if (USE_MOCKS) {
      return mockDelay(mockPublicVisitedStatistics);
    }

    const params = year ? { year } : {};
    const { data } = await api.get<VisitedStatistics>('/visited/public/statistics', { params });
    return data;
  },
};
