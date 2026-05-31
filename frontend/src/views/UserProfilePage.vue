<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { UserWithStats, TravelRoute, VisitedPlace, VisitedStatistics } from '@/types';
import { usersApi } from '@/services/usersApi';
import RouteList from '@/components/routes/RouteList.vue';
import { getUserInitials } from '@/utils/user-initials';

type ProfileTab = 'routes' | 'marks' | 'statistics';

const route = useRoute();

const profile = ref<UserWithStats | null>(null);
const routes = ref<TravelRoute[]>([]);
const places = ref<VisitedPlace[]>([]);
const statistics = ref<VisitedStatistics | null>(null);
const activeTab = ref<ProfileTab>('routes');
const isLoading = ref(false);
const error = ref('');

const userId = computed(() => route.params.id as string);

const tabs = computed(() => [
  { key: 'routes' as const, label: 'Маршруты', count: routes.value.length },
  { key: 'marks' as const, label: 'Метки', count: places.value.length },
  { key: 'statistics' as const, label: 'Статистика' },
]);

async function loadProfile() {
  isLoading.value = true;
  error.value = '';
  try {
    const [profileData, routesData, placesData, statsData] = await Promise.all([
      usersApi.getById(userId.value),
      usersApi.getUserRoutes(userId.value),
      usersApi.getUserPlaces(userId.value),
      usersApi.getUserStatistics(userId.value),
    ]);
    profile.value = profileData;
    routes.value = routesData;
    places.value = placesData;
    statistics.value = statsData;
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

function formatVisitedDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function pluralizeCountries(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'страна';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'страны';
  return 'стран';
}

onMounted(() => {
  const queryTab = route.query.tab;
  if (queryTab === 'routes' || queryTab === 'marks' || queryTab === 'statistics') {
    activeTab.value = queryTab;
  }
  loadProfile();
});
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
      </div>

      <div class="profile-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span v-if="tab.count !== undefined && tab.count > 0" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'routes'">
          <RouteList v-if="routes.length > 0" :routes="routes" />
          <div v-else class="empty-tab">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
              <circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z" />
            </svg>
            <p>У пользователя пока нет маршрутов</p>
          </div>
        </div>

        <div v-else-if="activeTab === 'marks'">
          <div v-if="places.length > 0" class="places-grid">
            <div v-for="place in places" :key="place._id" class="place-card">
              <h4>{{ place.title }}</h4>
              <p v-if="place.note" class="place-note">{{ place.note }}</p>
              <span v-if="place.visitedDate" class="place-date">{{ formatVisitedDate(place.visitedDate) }}</span>
            </div>
            <router-link :to="`/map?userId=${userId}`" class="view-map-link">
              Показать на карте &rarr;
            </router-link>
          </div>
          <div v-else class="empty-tab">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <p>У пользователя пока нет меток</p>
          </div>
        </div>

        <div v-else-if="activeTab === 'statistics' && statistics">
          <div class="stats-overview">
            <div class="stats-card">
              <span class="stats-card-value">{{ statistics.totalPlaces }}</span>
              <span class="stats-card-label">мест посещено</span>
            </div>
            <div class="stats-card">
              <span class="stats-card-value countries">{{ statistics.countries.length }}</span>
              <span class="stats-card-label">{{ pluralizeCountries(statistics.countries.length) }}</span>
            </div>
            <div class="stats-card">
              <span class="stats-card-value years">{{ statistics.years.length }}</span>
              <span class="stats-card-label">лет путешествий</span>
            </div>
          </div>

          <div v-if="statistics.countries.length > 0" class="stats-section">
            <h3>Страны</h3>
            <div class="tags-list">
              <span v-for="country in statistics.countries" :key="country" class="tag">{{ country }}</span>
            </div>
          </div>

          <div v-if="statistics.years.length > 0" class="stats-section">
            <h3>Годы</h3>
            <div class="tags-list">
              <span v-for="year in statistics.years" :key="year" class="tag year">{{ year }}</span>
            </div>
          </div>

          <div v-if="statistics.totalPlaces === 0" class="empty-tab">
            <p>Статистика пока пуста</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  padding: 2rem 1rem;
}

.profile-header {
  @include card;
  margin-bottom: 1.5rem;
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

.profile-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1rem;
  border-bottom: 2px solid $gray-200;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 1.5rem;
  font-size: $font-size-base;
  font-weight: 500;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  color: $gray-500;
  transition: all $transition;

  &:hover {
    color: $gray-700;
  }

  &.active {
    color: $primary;
    border-bottom-color: $primary;
  }
}

.tab-count {
  background: $gray-100;
  color: $gray-600;
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-weight: 600;

  .active & {
    background: $accent;
    color: $primary;
  }
}

.tab-content {
  @include card;
  min-height: 120px;
}

.empty-tab {
  @include flex-center;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;

  p {
    color: $gray-400;
    font-size: $font-size-sm;
    margin: 0;
  }
}

.empty-icon {
  color: $gray-300;
}

.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.place-card {
  padding: 0.875rem;
  background: $gray-50;
  border-radius: $radius;
  transition: background $transition;

  &:hover {
    background: $gray-100;
  }

  h4 {
    font-size: $font-size-sm;
    font-weight: 600;
    margin: 0 0 0.25rem;
    color: $gray-800;
  }
}

.place-note {
  font-size: 0.75rem;
  color: $gray-500;
  margin: 0 0 0.375rem;
  line-height: 1.4;
}

.place-date {
  font-size: 0.6875rem;
  color: $gray-400;
}

.view-map-link {
  grid-column: 1 / -1;
  text-align: center;
  font-size: $font-size-sm;
  color: $primary;
  padding: 0.5rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stats-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: $gray-50;
  border-radius: $radius;
}

.stats-card-value {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $primary;
  line-height: 1;

  &.countries {
    color: $secondary;
  }

  &.years {
    color: $gray-600;
  }
}

.stats-card-label {
  font-size: $font-size-sm;
  color: $gray-500;
  margin-top: 0.25rem;
  text-align: center;
}

.stats-section {
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $gray-700;
    margin: 0 0 0.625rem;
  }
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  background: $gray-50;
  border-radius: $radius-xl;
  font-size: 0.75rem;
  color: $gray-700;
  font-weight: 500;

  &.year {
    background: $accent;
    color: $primary;
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
  .avatar {
    width: 4rem;
    height: 4rem;
  }

  .profile-tabs {
    overflow-x: auto;
  }

  .tab-btn {
    white-space: nowrap;
    padding: 0.75rem 1rem;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }
}
</style>
