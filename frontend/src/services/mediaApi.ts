import api from './api';
import type { Media } from '@/types';

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
    return `/api/media/${id}/file`;
  },

  getThumbnailUrl(media: Media): string {
    return `/uploads/${media.thumbnailPath}`;
  },
};
