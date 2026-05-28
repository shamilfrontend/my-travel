import api from './api';
import type { TravelEvent, Coordinates } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import {
  getMockMyEvents,
  getMockPublicEvents,
  mockCreateEvent,
  mockJoinEvent,
  mockLeaveEvent,
  mockRemoveEvent,
} from '@/mocks';

export const eventsApi = {
  async getPublic(): Promise<TravelEvent[]> {
    if (USE_MOCKS) {
      return mockDelay(getMockPublicEvents());
    }

    const { data } = await api.get<TravelEvent[]>('/events');
    return data;
  },

  async getMine(): Promise<TravelEvent[]> {
    if (USE_MOCKS) {
      return mockDelay(getMockMyEvents());
    }

    const { data } = await api.get<TravelEvent[]>('/events/mine');
    return data;
  },

  async create(payload: {
    title: string;
    description?: string;
    location?: string;
    coordinates?: Coordinates;
    startDate: string;
    endDate?: string;
    isPublic?: boolean;
  }): Promise<TravelEvent> {
    if (USE_MOCKS) {
      return mockDelay(mockCreateEvent(payload));
    }

    const { data } = await api.post<TravelEvent>('/events', payload);
    return data;
  },

  async join(id: string): Promise<TravelEvent> {
    if (USE_MOCKS) {
      return mockDelay(mockJoinEvent(id));
    }

    const { data } = await api.post<TravelEvent>(`/events/${id}/join`);
    return data;
  },

  async leave(id: string): Promise<void> {
    if (USE_MOCKS) {
      mockLeaveEvent(id);
      await mockDelay(undefined);
      return;
    }

    await api.post(`/events/${id}/leave`);
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCKS) {
      mockRemoveEvent(id);
      await mockDelay(undefined);
      return;
    }

    await api.delete(`/events/${id}`);
  },
};
