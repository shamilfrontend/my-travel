import api from './api';
import type { Media } from '@/types';
import { USE_MOCKS } from '@/config/useMocks';
import { mockMedia } from '@/mocks';

function isAbsoluteUrl(value: string): boolean {
  return /^(https?:\/\/|data:)/.test(value);
}

export const mediaApi = {
  async upload(file: File): Promise<Media> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<Media>('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/media/${id}`);
  },

  async getById(id: string): Promise<Media | null> {
    if (USE_MOCKS) {
      return mockMedia.find((item) => item._id === id) ?? null;
    }

    try {
      const { data } = await api.get<Media>(`/media/${id}`);
      return data;
    } catch {
      return null;
    }
  },

  getFileUrl(id: string): string {
    const media = mockMedia.find((item) => item._id === id);
    if (media?.path && isAbsoluteUrl(media.path)) return media.path;
    if (media?.path) return `/uploads/${media.path}`;
    return `/api/media/${id}/file`;
  },

  getThumbnailUrl(media: Media): string {
    if (media.thumbnailPath) {
      if (isAbsoluteUrl(media.thumbnailPath)) return media.thumbnailPath;
      return `/uploads/${media.thumbnailPath}`;
    }

    return this.getFileUrl(media._id);
  },
};
