import api from './api';
import type { UserWithStats, TravelRoute, VisitedPlace, VisitedStatistics } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import {
  getMockUserById,
  getMockRoutesByAuthor,
  getMockVisitedByUser,
  getMockVisitedStatistics,
  mockUsersWithStats,
} from '@/mocks';
import { buildStatsFromPlaces } from '@/utils/visited-statistics';

export const usersApi = {
  async getAll(): Promise<UserWithStats[]> {
    if (USE_MOCKS) {
      return mockDelay(mockUsersWithStats);
    }

    const { data } = await api.get<UserWithStats[]>('/users');
    return data;
  },

  async getById(id: string): Promise<UserWithStats> {
    if (USE_MOCKS) {
      const user = getMockUserById(id);
      if (!user) throw new Error('User not found');
      return mockDelay(user);
    }

    const { data } = await api.get<UserWithStats>(`/users/${id}`);
    return data;
  },

  async getUserRoutes(id: string): Promise<TravelRoute[]> {
    if (USE_MOCKS) {
      return mockDelay(getMockRoutesByAuthor(id));
    }

    const { data } = await api.get<TravelRoute[]>(`/users/${id}/routes`);
    return data;
  },

  async getUserPlaces(id: string): Promise<VisitedPlace[]> {
    if (USE_MOCKS) {
      return mockDelay(getMockVisitedByUser(id));
    }

    const { data } = await api.get<VisitedPlace[]>(`/users/${id}/places`);
    return data;
  },

  async getUserStatistics(id: string): Promise<VisitedStatistics> {
    if (USE_MOCKS) {
      const stats = getMockVisitedStatistics(id);
      if (stats) return mockDelay(stats);
      return mockDelay(buildStatsFromPlaces(getMockVisitedByUser(id)));
    }

    const { data } = await api.get<VisitedStatistics>(`/users/${id}/statistics`);
    return data;
  },
};
