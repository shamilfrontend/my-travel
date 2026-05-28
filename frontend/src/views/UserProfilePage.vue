<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { UserWithStats, TravelRoute } from '@/types';
import { usersApi } from '@/services/usersApi';
import RouteList from '@/components/routes/RouteList.vue';
import { getUserInitials } from '@/utils/user-initials';

const route = useRoute();

const profile = ref<UserWithStats | null>(null);
const routes = ref<TravelRoute[]>([]);
const isLoading = ref(false);
const error = ref('');

const userId = computed(() => route.params.id as string);

async function loadProfile() {
  isLoading.value = true;
  try {
    const [profileData, routesData] = await Promise.all([
      usersApi.getById(userId.value),
      usersApi.getUserRoutes(userId.value),
    ]);
    profile.value = profileData;
    routes.value = routesData;
  } catch {
    error.value = 'Не удалось загрузить профиль';
  } finally {
    isLoading.value = false;
  }
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

onMounted(loadProfile);
</script>

<template>
  <div class="profile-page container">
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>

    <template v-else-if="profile">
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar">
            <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="profile.name" />
            <span v-else class="initials">{{ getUserInitials(profile.name) }}</span>
          </div>
          <div class="profile-info">
            <h1>{{ profile.name }}</h1>
            <span class="since">на PPR Travel с {{ formatDate(profile.createdAt) }}</span>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat">
            <span class="stat-count">{{ profile.visitedCount }}</span>
            <span class="stat-label">{{ pluralizePlaces(profile.visitedCount) }}</span>
          </div>
          <div class="stat">
            <span class="stat-count countries">{{ profile.countriesCount }}</span>
            <span class="stat-label">{{ pluralizeCountries(profile.countriesCount) }}</span>
          </div>
          <div v-if="profile.publicRoutesCount !== undefined" class="stat">
            <span class="stat-count routes-count">{{ profile.publicRoutesCount }}</span>
            <span class="stat-label">маршрутов</span>
          </div>
        </div>
      </div>

      <div v-if="routes.length > 0" class="profile-routes">
        <h2>Публичные маршруты</h2>
        <RouteList :routes="routes" :show-copy="true" />
      </div>
      <div v-else class="empty">У пользователя пока нет публичных маршрутов</div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  padding: 2rem 1rem;
}

.profile-header {
  @include card;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 2rem;
  flex-wrap: wrap;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.avatar {
  @include flex-center;
  width: 5rem;
  height: 5rem;
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
    font-weight: 700;
    font-size: $font-size-2xl;
  }
}

.profile-info {
  h1 {
    margin: 0 0 0.25rem;
    font-size: $font-size-2xl;
  }
}

.since {
  font-size: $font-size-sm;
  color: $gray-400;
}

.profile-stats {
  display: flex;
  gap: 2rem;
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

  &.routes-count {
    color: $gray-600;
  }
}

.stat-label {
  font-size: $font-size-sm;
  color: $gray-500;
  margin-top: 0.25rem;
}

.profile-routes {
  h2 {
    margin-bottom: 1rem;
  }
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
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .avatar {
    width: 4rem;
    height: 4rem;
  }
}
</style>
