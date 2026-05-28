import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';
import { authApi } from '@/services/authApi';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const isAuthenticated = computed(() => !!token.value);

  async function register(email: string, password: string, name: string) {
    const response = await authApi.register(email, password, name);
    token.value = response.token;
    user.value = response.user;
    localStorage.setItem('token', response.token);
  }

  async function login(email: string, password: string) {
    const response = await authApi.login(email, password);
    token.value = response.token;
    user.value = response.user;
    localStorage.setItem('token', response.token);
  }

  async function logout() {
    await authApi.logout();
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  async function fetchProfile() {
    if (!token.value) return;
    try {
      user.value = await authApi.me();
    } catch {
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
    }
  }

  async function updateProfile(payload: {
    name?: string;
    password?: string;
    birthDate?: string;
    city?: string;
    bio?: string;
    interests?: string[];
  }) {
    user.value = await authApi.updateProfile(payload);
  }

  async function uploadAvatar(file: File) {
    user.value = await authApi.uploadAvatar(file);
  }

  return { user, token, isAuthenticated, register, login, logout, fetchProfile, updateProfile, uploadAvatar };
});
