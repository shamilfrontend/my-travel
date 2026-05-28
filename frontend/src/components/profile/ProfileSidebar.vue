<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { UserWithStats } from '@/types';

interface Props {
  profileStats: UserWithStats | null;
}

const props = defineProps<Props>();
const authStore = useAuthStore();

const interests = computed(() => authStore.user?.interests || []);
const visibleInterests = computed(() => interests.value.slice(0, 6));
const hiddenCount = computed(() => Math.max(0, interests.value.length - 6));

const mapStats = computed(() => [
  { label: 'Стран', value: props.profileStats?.countriesCount ?? 0 },
  { label: 'Городов', value: props.profileStats?.citiesCount ?? 0 },
  { label: 'Мест', value: props.profileStats?.visitedCount ?? 0 },
]);

const interestIcons: Record<string, string> = {
  'Стендап': '🎤',
  'Кафе и рестораны': '☕',
  'Футбол': '⚽',
  'Единоборства': '🥊',
  'Настольные игры': '🎲',
  'Настольный теннис': '🏓',
  'Путешествия': '✈️',
  'Музыка': '🎵',
  'Кино': '🎬',
  'Книги': '📚',
};

function getIcon(interest: string): string {
  return interestIcons[interest] || '🏷️';
}
</script>

<template>
  <aside class="profile-sidebar">
    <div class="sidebar-block map-block">
      <div class="map-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
          <path d="M8 2v16M16 6v16" />
        </svg>
        <span>Моя карта</span>
      </div>
      <div class="map-stats">
        <div v-for="stat in mapStats" :key="stat.label" class="map-stat">
          <span class="map-stat-value">{{ stat.value }}</span>
          <span class="map-stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <div class="sidebar-block">
      <div class="block-header">
        <h3>Мои интересы</h3>
        <button class="see-all-btn">Все</button>
      </div>
      <div v-if="interests.length > 0" class="interests-list">
        <span
          v-for="interest in visibleInterests"
          :key="interest"
          class="interest-tag"
        >
          <span class="interest-icon">{{ getIcon(interest) }}</span>
          {{ interest }}
        </span>
        <span v-if="hiddenCount > 0" class="interest-tag more">
          Ещё {{ hiddenCount }}
        </span>
      </div>
      <p v-else class="interests-empty">Добавьте интересы в профиле</p>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.profile-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-block {
  @include card;
  padding: 1rem 1.25rem;
}

.block-header {
  @include flex-between;
  margin-bottom: 0.75rem;

  h3 {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $gray-800;
    margin: 0;
  }
}

.add-btn {
  border: none;
  background: none;
  color: $primary;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  text-decoration: none;

  &:hover {
    color: $primary-dark;
  }
}

.see-all-btn {
  @extend .add-btn;
}

.map-block {
  background: linear-gradient(135deg, $primary, $primary-light);
  padding: 1rem 1.25rem;
}

.map-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: $font-size-sm;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.map-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.map-stat {
  text-align: center;
}

.map-stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.map-stat-label {
  display: block;
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.75);
}

.interests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.625rem;
  background: $gray-50;
  border-radius: $radius-xl;
  font-size: 0.75rem;
  color: $gray-700;
  font-weight: 500;

  &.more {
    background: $accent;
    color: $primary;
    cursor: pointer;
  }
}

.interest-icon {
  font-size: 0.875rem;
}

.interests-empty {
  font-size: 0.75rem;
  color: $gray-400;
  margin: 0;
}

@media (max-width: 1024px) {
  .profile-sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-block {
    flex: 1;
    min-width: 240px;
  }
}

@media (max-width: 768px) {
  .profile-sidebar {
    flex-direction: column;
  }

  .sidebar-block {
    min-width: unset;
  }
}
</style>
