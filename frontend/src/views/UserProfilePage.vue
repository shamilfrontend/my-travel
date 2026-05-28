<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { UserWithStats, TravelRoute } from '@/types';
import { usersApi } from '@/services/usersApi';
import { friendsApi } from '@/services/friendsApi';
import RouteList from '@/components/routes/RouteList.vue';
import { getUserInitials } from '@/utils/user-initials';

const route = useRoute();
const authStore = useAuthStore();

const profile = ref<UserWithStats | null>(null);
const routes = ref<TravelRoute[]>([]);
const isLoading = ref(false);
const error = ref('');
const friendStatus = ref('none');
const friendshipId = ref<string | null>(null);
const isRequester = ref(false);
const isFriendActionLoading = ref(false);

const isOwnProfile = computed(() => profile.value?._id === authStore.user?._id);
const userId = computed(() => route.params.id as string);

async function loadProfile() {
  isLoading.value = true;
  try {
    const [profileData, routesData, status] = await Promise.all([
      usersApi.getById(userId.value),
      usersApi.getUserRoutes(userId.value),
      friendsApi.getStatus(userId.value),
    ]);
    profile.value = profileData;
    routes.value = routesData;
    friendStatus.value = status.status;
    friendshipId.value = status.friendshipId || null;
    isRequester.value = status.isRequester || false;
  } catch {
    error.value = 'Не удалось загрузить профиль';
  } finally {
    isLoading.value = false;
  }
}

async function handleAddFriend() {
  isFriendActionLoading.value = true;
  try {
    await friendsApi.sendRequest(userId.value);
    friendStatus.value = 'pending';
    isRequester.value = true;
  } finally {
    isFriendActionLoading.value = false;
  }
}

async function handleAcceptFriend() {
  if (!friendshipId.value) return;
  isFriendActionLoading.value = true;
  try {
    await friendsApi.accept(friendshipId.value);
    friendStatus.value = 'accepted';
  } finally {
    isFriendActionLoading.value = false;
  }
}

async function handleRemoveFriend() {
  isFriendActionLoading.value = true;
  try {
    await friendsApi.remove(userId.value);
    friendStatus.value = 'none';
    friendshipId.value = null;
  } finally {
    isFriendActionLoading.value = false;
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

        <div class="profile-actions" v-if="!isOwnProfile">
          <button
            v-if="friendStatus === 'none'"
            class="btn-primary btn-sm"
            :disabled="isFriendActionLoading"
            @click="handleAddFriend"
          >
            Добавить в друзья
          </button>
          <button
            v-else-if="friendStatus === 'pending' && !isRequester"
            class="btn-primary btn-sm"
            :disabled="isFriendActionLoading"
            @click="handleAcceptFriend"
          >
            Принять заявку
          </button>
          <span v-else-if="friendStatus === 'pending' && isRequester" class="status-text">Заявка отправлена</span>
          <template v-else-if="friendStatus === 'accepted'">
            <button
              class="btn-danger btn-sm"
              :disabled="isFriendActionLoading"
              @click="handleRemoveFriend"
            >
              Удалить из друзей
            </button>
          </template>
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

.profile-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.status-text {
  font-size: $font-size-sm;
  color: $gray-500;
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

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: $font-size-sm;
}

.btn-danger {
  @include button-base;
  background: $danger;
  color: white;

  &:hover {
    opacity: 0.9;
  }
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
