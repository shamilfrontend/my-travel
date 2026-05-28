import api from './api';
import type { WishlistPlace, Coordinates } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import { getMockMyWishlist } from '@/mocks';

export const wishlistApi = {
  async getAll(): Promise<WishlistPlace[]> {
    if (USE_MOCKS) {
      return mockDelay(getMockMyWishlist());
    }

    const { data } = await api.get<WishlistPlace[]>('/wishlist');
    return data;
  },

  async create(payload: { title: string; coordinates: Coordinates; note?: string }): Promise<WishlistPlace> {
    const { data } = await api.post<WishlistPlace>('/wishlist', payload);
    return data;
  },

  async update(id: string, payload: Partial<{ title: string; coordinates: Coordinates; note?: string }>): Promise<WishlistPlace> {
    const { data } = await api.put<WishlistPlace>(`/wishlist/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/wishlist/${id}`);
  },
};
