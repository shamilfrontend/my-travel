import api from './api';
import type { ActivityFeedResponse, RecommendedTag } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import { getMockActivityFeed, mockRecommendedTags } from '@/mocks';

export interface ActivityFeedParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  scope?: string;
}

export const activityApi = {
  async getFeed(params: ActivityFeedParams = {}): Promise<ActivityFeedResponse> {
    if (USE_MOCKS) {
      return mockDelay(getMockActivityFeed(params));
    }

    const { data } = await api.get<ActivityFeedResponse>('/activity', { params });
    return data;
  },

  async getRecommendedTags(): Promise<RecommendedTag[]> {
    if (USE_MOCKS) {
      return mockDelay(mockRecommendedTags);
    }

    const { data } = await api.get<RecommendedTag[]>('/activity/tags');
    return data;
  },
};
