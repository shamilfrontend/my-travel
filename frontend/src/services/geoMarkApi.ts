import api from './api';
import type { GeoMark, Coordinates } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import { getMockMyGeoMarks } from '@/mocks';

export interface CreateGeoMarkPayload {
  title: string;
  description?: string;
  coordinates: Coordinates;
  mediaIds?: string[];
}

export interface UpdateGeoMarkPayload {
  title?: string;
  description?: string;
  coordinates?: Coordinates;
  mediaIds?: string[];
}

export const geoMarkApi = {
  async getAll(): Promise<GeoMark[]> {
    if (USE_MOCKS) {
      return mockDelay(getMockMyGeoMarks());
    }

    const { data } = await api.get<GeoMark[]>('/geo-marks');
    return data;
  },

  async create(payload: CreateGeoMarkPayload): Promise<GeoMark> {
    const { data } = await api.post<GeoMark>('/geo-marks', payload);
    return data;
  },

  async update(id: string, payload: UpdateGeoMarkPayload): Promise<GeoMark> {
    const { data } = await api.put<GeoMark>(`/geo-marks/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/geo-marks/${id}`);
  },
};
