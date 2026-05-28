<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { UserWithStats } from '@/types';
import { usersApi } from '@/services/usersApi';
import { useAuthStore } from '@/stores/auth';
import { getUserInitials } from '@/utils/user-initials';

const authStore = useAuthStore();
const users = ref<UserWithStats[]>([]);
const isLoading = ref(false);
const error = ref('');
const router = useRouter();

onMounted(async () => {
  isLoading.value = true;
  try {
    users.value = await usersApi.getAll();
  } catch {
    error.value = 'Не удалось загрузить пользователей';
  } finally {
    isLoading.value = false;
  }
});

function openProfile(userId: string) {
  router.push(`/users/${userId}`);
}

function isCurrentUser(userId: string): boolean {
  return authStore.user?._id === userId;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
  });
}

function pluralizePlaces(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'место';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'места';
  return 'мест';
}

function pluralizeCountries(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'страна';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'страны';
  return 'стран';
}
</script>

<template>
  <div class="users-page container">
    <h1>Пользователи</h1>

    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="!users.length" class="empty">Пользователей пока нет</div>

    <div v-else class="users-list">
      <div v-for="(user, index) in users" :key="user._id" class="user-card" @click="openProfile(user._id)">
        <div class="user-rank">{{ index + 1 }}</div>
        <div class="user-avatar">
          <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.name" />
          <span v-else class="initials">{{ getUserInitials(user.name) }}</span>
        </div>
        <div class="user-info">
          <h3 class="user-name">
            <span class="user-name-text">{{ user.name }}</span>
            <span v-if="isCurrentUser(user._id)" class="user-self-label">(Это вы)</span>
          </h3>
          <span class="user-since">с {{ formatDate(user.createdAt) }}</span>
        </div>
        <div class="user-stats">
          <div class="stat">
            <span class="stat-count">{{ user.visitedCount }}</span>
            <span class="stat-label">{{ pluralizePlaces(user.visitedCount) }}</span>
          </div>
          <div class="stat">
            <span class="stat-count countries">{{ user.countriesCount }}</span>
            <span class="stat-label">{{ pluralizeCountries(user.countriesCount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.users-page {
  padding: 2rem 1rem;

  h1 {
    margin-bottom: 1.5rem;
  }
}

.users-list {
  display: grid;
  gap: 0.75rem;
}

.user-card {
  @include card;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: box-shadow $transition;

  &:hover {
    box-shadow: $shadow-md;
  }
}

.user-rank {
  @include flex-center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: $gray-100;
  color: $gray-500;
  font-size: $font-size-sm;
  font-weight: 600;
  flex-shrink: 0;

  .user-card:nth-child(1) & {
    background: #fef3c7;
    color: #d97706;
  }

  .user-card:nth-child(2) & {
    background: #f1f5f9;
    color: #64748b;
  }

  .user-card:nth-child(3) & {
    background: #fef2f2;
    color: #b45309;
  }
}

.user-avatar {
  @include flex-center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: $primary-light;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .initials {
    color: white;
    font-weight: 600;
    font-size: $font-size-base;
  }
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  margin: 0 0 0.125rem;
  font-size: $font-size-lg;
  min-width: 0;
}

.user-name-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.user-self-label {
  flex-shrink: 0;
  color: #6C5CE7;
  font-weight: 500;
}

.user-since {
  font-size: $font-size-sm;
  color: $gray-400;
}

.user-stats {
  display: flex;
  gap: 1.25rem;
  flex-shrink: 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-count {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $primary;
  line-height: 1;

  &.countries {
    color: $secondary;
  }
}

.stat-label {
  font-size: $font-size-sm;
  color: $gray-500;
  margin-top: 0.125rem;
}

.loading,
.empty {
  text-align: center;
  color: $gray-500;
  padding: 2rem;
}

.error-message {
  text-align: center;
  color: $danger;
  padding: 2rem;
}

@include mobile {
  .user-card {
    padding: 1rem;
  }

  .user-rank {
    display: none;
  }

  .user-avatar {
    width: 2.5rem;
    height: 2.5rem;
  }

  .user-name {
    font-size: $font-size-base;
  }
}
</style>
