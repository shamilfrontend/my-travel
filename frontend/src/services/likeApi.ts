import api from './api';
import type { Like } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import { getMockMyLikes, mockCreateLike, mockRemoveLike } from '@/mocks';

export const likeApi = {
  async create(targetType: 'GeoMark' | 'VisitedPlace', targetId: string): Promise<Like> {
    if (USE_MOCKS) {
      return mockDelay(mockCreateLike(targetType, targetId));
    }

    const { data } = await api.post<Like>('/likes', { targetType, targetId });
    return data;
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCKS) {
      mockRemoveLike(id);
      await mockDelay(undefined);
      return;
    }

    await api.delete(`/likes/${id}`);
  },

  async getMyLikes(): Promise<Like[]> {
    if (USE_MOCKS) {
      return mockDelay(getMockMyLikes());
    }

    const { data } = await api.get<Like[]>('/likes/my');
    return data;
  },
};
