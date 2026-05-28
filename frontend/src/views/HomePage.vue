<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useVisitedStore } from '@/stores/visited';

const authStore = useAuthStore();
const visitedStore = useVisitedStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

onMounted(() => {
  if (isAuthenticated.value) {
    visitedStore.fetchStatistics();
  }
});

const stats = computed(() => visitedStore.statistics);
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-brand">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill="#6C5CE7" />
          <text x="24" y="32" text-anchor="middle" fill="white" font-size="24" font-weight="700">П</text>
        </svg>
      </div>
      <h1>PPR Travel</h1>
      <p class="subtitle">Планируйте путешествия, создавайте маршруты и отмечайте посещённые места на карте мира</p>
      <div class="hero-actions">
        <router-link v-if="!isAuthenticated" to="/register" class="btn-primary btn-lg">
          Начать путешествие
        </router-link>
        <router-link v-else to="/map" class="btn-primary btn-lg">
          Открыть карту
        </router-link>
      </div>
    </section>

    <section v-if="isAuthenticated && stats" class="my-stats">
      <h2>Ваша статистика</h2>
      <div class="stats-cards">
        <router-link to="/map" class="stat-card">
          <div class="stat-icon places-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span class="stat-num">{{ stats.totalPlaces }}</span>
          <span class="stat-text">мест посещено</span>
        </router-link>
        <router-link to="/map" class="stat-card">
          <div class="stat-icon countries-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </div>
          <span class="stat-num countries">{{ stats.countries.length }}</span>
          <span class="stat-text">стран</span>
        </router-link>
        <router-link to="/routes" class="stat-card">
          <div class="stat-icon routes-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z" />
            </svg>
          </div>
          <span class="stat-num routes-stat">&rarr;</span>
          <span class="stat-text">Мои маршруты</span>
        </router-link>
      </div>
    </section>

    <section class="features">
      <div class="feature-card">
        <div class="feature-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <h3>Карта мира</h3>
        <p>Создавайте метки на интерактивной карте и планируйте маршруты</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" stroke-width="2">
            <circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z" />
          </svg>
        </div>
        <h3>Маршруты</h3>
        <p>Объединяйте метки в маршруты, делитесь ими с другими путешественниками</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <h3>Посещённые места</h3>
        <p>Отмечайте места, где вы побывали, и следите за своей статистикой</p>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  padding: 2rem 1rem;
}

.hero {
  text-align: center;
  padding: 3rem 1rem 4rem;
}

.hero-brand {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.hero h1 {
  font-size: 3rem;
  font-weight: 800;
  color: $primary;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: $font-size-lg;
  color: $gray-500;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.btn-lg {
  padding: 0.875rem 2rem;
  font-size: $font-size-lg;
}

.my-stats {
  max-width: 600px;
  margin: 0 auto 3rem;
  text-align: center;

  h2 {
    font-size: $font-size-xl;
    margin-bottom: 1rem;
    color: $gray-700;
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  @include card;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  text-decoration: none;
  transition: box-shadow $transition, transform $transition;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;

  &.places-icon {
    background: $accent;
    color: $primary;
  }

  &.countries-icon {
    background: $accent-green;
    color: $secondary;
  }

  &.routes-icon {
    background: $accent-blue;
    color: #3B82F6;
  }
}

.stat-num {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $primary;

  &.countries {
    color: $secondary;
  }

  &.routes-stat {
    font-size: $font-size-xl;
    color: $gray-500;
  }
}

.stat-text {
  font-size: $font-size-sm;
  color: $gray-500;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
}

.feature-card {
  @include card;
  text-align: center;
  transition: box-shadow $transition, transform $transition;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }

  h3 {
    font-size: $font-size-xl;
    margin-bottom: 0.5rem;
    color: $gray-800;
  }

  p {
    color: $gray-500;
  }
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: $accent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

@include mobile {
  .hero h1 {
    font-size: 2rem;
  }

  .stats-cards {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    flex-direction: row;
    justify-content: flex-start;
    gap: 0.75rem;
    padding: 1rem;
  }

  .stat-icon {
    margin-bottom: 0;
  }
}
</style>
