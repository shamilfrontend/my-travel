import api from './api';
import type { AuthResponse, User } from '@/types';
import { USE_MOCKS, mockDelay } from '@/config/useMocks';
import { mockUsers, MOCK_CURRENT_USER_ID } from '@/mocks';

const MOCK_TOKEN = 'mock-jwt-token';

function getMockCurrentUser(): User {
  const user = mockUsers.find((item) => item._id === MOCK_CURRENT_USER_ID);
  if (!user) throw new Error('Mock user not found');
  return user;
}

function createMockAuthResponse(): AuthResponse {
  return {
    user: getMockCurrentUser(),
    token: MOCK_TOKEN,
  };
}

export const authApi = {
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    if (USE_MOCKS) {
      return mockDelay({
        ...createMockAuthResponse(),
        user: { ...getMockCurrentUser(), email, name },
      });
    }

    const { data } = await api.post<AuthResponse>('/auth/register', { email, password, name });
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCKS) {
      return mockDelay({
        ...createMockAuthResponse(),
        user: { ...getMockCurrentUser(), email },
      });
    }

    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  async logout(): Promise<void> {
    if (USE_MOCKS) {
      await mockDelay(undefined);
      return;
    }

    await api.post('/auth/logout');
  },

  async me(): Promise<User> {
    if (USE_MOCKS) {
      return mockDelay(getMockCurrentUser());
    }

    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  async updateProfile(payload: {
    name?: string;
    password?: string;
    birthDate?: string;
    city?: string;
    bio?: string;
    interests?: string[];
  }): Promise<User> {
    if (USE_MOCKS) {
      return mockDelay({ ...getMockCurrentUser(), ...payload });
    }

    const { data } = await api.put<User>('/auth/profile', payload);
    return data;
  },

  async uploadAvatar(file: File): Promise<User> {
    if (USE_MOCKS) {
      return mockDelay(getMockCurrentUser());
    }

    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.put<User>('/auth/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (USE_MOCKS) {
      await mockDelay(undefined);
      return;
    }

    await api.put('/auth/password', { currentPassword, newPassword });
  },

  async getFeedback(): Promise<{ rating: number | null; dismissedAt: string | null }> {
    if (USE_MOCKS) {
      return mockDelay({ rating: null, dismissedAt: null });
    }

    const { data } = await api.get('/auth/feedback');
    return data;
  },

  async submitFeedback(payload: { rating?: number; dismissed?: boolean }): Promise<void> {
    if (USE_MOCKS) {
      await mockDelay(undefined);
      return;
    }

    await api.post('/auth/feedback', payload);
  },

  async uploadCover(file: File): Promise<User> {
    if (USE_MOCKS) {
      return mockDelay(getMockCurrentUser());
    }

    const formData = new FormData();
    formData.append('cover', file);
    const { data } = await api.put<User>('/auth/profile/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async updateSettings(payload: {
    profilePrivacy?: 'public';
    emailNotifications?: {
      likes?: boolean;
    };
  }): Promise<User> {
    if (USE_MOCKS) {
      return mockDelay({ ...getMockCurrentUser(), ...payload });
    }

    const { data } = await api.put<User>('/auth/settings', payload);
    return data;
  },
};
