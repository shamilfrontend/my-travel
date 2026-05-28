import api from './api';
import type { Friendship, UserWithStats } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import {
  getMockFriends,
  getMockFriendStatus,
  getMockPendingFriendships,
  mockAcceptFriendRequest,
  mockDeclineFriendRequest,
  mockRemoveFriend,
  mockSendFriendRequest,
} from '@/mocks';

export const friendsApi = {
  async getFriends(): Promise<UserWithStats[]> {
    if (USE_MOCKS) {
      return mockDelay(getMockFriends());
    }

    const { data } = await api.get<UserWithStats[]>('/friends');
    return data;
  },

  async getPending(): Promise<Friendship[]> {
    if (USE_MOCKS) {
      return mockDelay(getMockPendingFriendships());
    }

    const { data } = await api.get<Friendship[]>('/friends/pending');
    return data;
  },

  async getStatus(userId: string): Promise<{ status: string; friendshipId?: string; isRequester?: boolean }> {
    if (USE_MOCKS) {
      return mockDelay(getMockFriendStatus(userId));
    }

    const { data } = await api.get(`/friends/status/${userId}`);
    return data;
  },

  async sendRequest(recipientId: string): Promise<Friendship> {
    if (USE_MOCKS) {
      return mockDelay(mockSendFriendRequest(recipientId));
    }

    const { data } = await api.post<Friendship>('/friends/request', { recipientId });
    return data;
  },

  async accept(id: string): Promise<Friendship> {
    if (USE_MOCKS) {
      return mockDelay(mockAcceptFriendRequest(id));
    }

    const { data } = await api.patch<Friendship>(`/friends/${id}/accept`);
    return data;
  },

  async decline(id: string): Promise<Friendship> {
    if (USE_MOCKS) {
      return mockDelay(mockDeclineFriendRequest(id));
    }

    const { data } = await api.patch<Friendship>(`/friends/${id}/decline`);
    return data;
  },

  async remove(userId: string): Promise<void> {
    if (USE_MOCKS) {
      mockRemoveFriend(userId);
      await mockDelay(undefined);
      return;
    }

    await api.delete(`/friends/${userId}`);
  },
};
