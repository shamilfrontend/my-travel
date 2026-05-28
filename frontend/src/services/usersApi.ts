import api from './api';
import type { UserWithStats, TravelRoute } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import {
  getMockUserById,
  getMockRoutesByAuthor,
  mockUsersWithStats,
} from '@/mocks';

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
      return mockDelay(getMockRoutesByAuthor(id, true));
    }

    const { data } = await api.get<TravelRoute[]>(`/users/${id}/routes`);
    return data;
  },
};
