import api from './api';
import type { Media } from '@/types';
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

  getFileUrl(id: string): string {
    const media = mockMedia.find((item) => item._id === id);
    if (media?.path && isAbsoluteUrl(media.path)) return media.path;
    return `/api/media/${id}/file`;
  },

  getThumbnailUrl(media: Media): string {
    if (isAbsoluteUrl(media.thumbnailPath)) return media.thumbnailPath;
    return `/uploads/${media.thumbnailPath}`;
  },
};
