import api from './api';
import type { Post, Coordinates } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import {
  getMockPostsResponse,
  mockCreatePost,
  mockRemovePost,
  mockUpdatePost,
} from '@/mocks';

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

export const postsApi = {
  async getAll(params?: { userId?: string; page?: number }): Promise<PostsResponse> {
    if (USE_MOCKS) {
      return mockDelay(getMockPostsResponse(params?.page ?? 1, 10, params?.userId));
    }

    const { data } = await api.get<PostsResponse>('/posts', { params });
    return data;
  },

  async create(payload: { text: string; mediaIds?: string[]; location?: Coordinates }): Promise<Post> {
    if (USE_MOCKS) {
      return mockDelay(mockCreatePost(payload));
    }

    const { data } = await api.post<Post>('/posts', payload);
    return data;
  },

  async update(id: string, payload: { text?: string; mediaIds?: string[]; location?: Coordinates }): Promise<Post> {
    if (USE_MOCKS) {
      return mockDelay(mockUpdatePost(id, payload));
    }

    const { data } = await api.put<Post>(`/posts/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCKS) {
      mockRemovePost(id);
      await mockDelay(undefined);
      return;
    }

    await api.delete(`/posts/${id}`);
  },
};
