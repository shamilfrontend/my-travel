import api from './api';
import type { AppNotification } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import {
  getMockNotifications,
  getMockUnreadNotificationsCount,
  mockMarkAllNotificationsRead,
  mockMarkNotificationRead,
} from '@/mocks';

export const notificationsApi = {
  async getAll(): Promise<AppNotification[]> {
    if (USE_MOCKS) {
      return mockDelay(getMockNotifications());
    }

    const { data } = await api.get<AppNotification[]>('/notifications');
    return data;
  },

  async getUnreadCount(): Promise<number> {
    if (USE_MOCKS) {
      return mockDelay(getMockUnreadNotificationsCount());
    }

    const { data } = await api.get<{ count: number }>('/notifications/unread-count');
    return data.count;
  },

  async markRead(id: string): Promise<void> {
    if (USE_MOCKS) {
      mockMarkNotificationRead(id);
      await mockDelay(undefined);
      return;
    }

    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    if (USE_MOCKS) {
      mockMarkAllNotificationsRead();
      await mockDelay(undefined);
      return;
    }

    await api.patch('/notifications/read-all');
  },
};
