<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useActivityStore } from '@/stores/activity';
import ActivityCard from '@/components/activity/ActivityCard.vue';

const store = useActivityStore();

const TABS = [
  { key: 'all', label: 'Все' },
  { key: 'geo_mark', label: 'Метки' },
  { key: 'route', label: 'Маршруты' },
  { key: 'post', label: 'Посты' },
];

const TAB_LABELS: Record<string, string> = TABS.reduce((accumulator, tab) => {
  accumulator[tab.key] = tab.label;
  return accumulator;
}, {} as Record<string, string>);

const debouncedSearch = useDebounceFn((value: string) => {
  store.setSearch(value);
}, 300);

function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement;
  debouncedSearch(target.value);
}

const activeTabLabel = computed(() => TAB_LABELS[store.activeTab] ?? 'Все');
const hasSearchQuery = computed(() => store.search.trim().length > 0);
const hasFilteredEmptyState = computed(
  () => store.items.length === 0 && store.hasActiveFilters,
);
const hasInitialEmptyState = computed(
  () => store.items.length === 0 && !store.hasActiveFilters,
);

function handleResetFilters() {
  store.resetFilters();
}

onMounted(() => {
  store.fetchFeed();
  store.fetchTags();
});
</script>

<template>
  <div class="activity-page container">
    <div class="activity-layout">
      <main class="activity-main">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="Поиск"
            :value="store.search"
            @input="handleSearchInput"
          />
          <button
            v-if="store.search"
            class="search-clear"
            @click="store.setSearch('')"
          >
            &times;
          </button>
        </div>

        <div class="tabs">
          <button
            v-for="tab in TABS"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: store.activeTab === tab.key }"
            :aria-pressed="store.activeTab === tab.key"
            @click="store.setTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="filter-summary">
          <div class="filter-chips" aria-live="polite">
            <span class="filter-chip">
              Тип: {{ activeTabLabel }}
            </span>
            <span v-if="hasSearchQuery" class="filter-chip">
              Поиск: "{{ store.search }}"
            </span>
          </div>
          <button
            v-if="store.hasActiveFilters"
            class="reset-filters-btn"
            @click="handleResetFilters"
          >
            Сбросить все фильтры
          </button>
        </div>

        <p class="results-caption" aria-live="polite">
          Найдено: {{ store.total }}
        </p>

        <div v-if="store.isLoading" class="loading-skeleton" aria-label="Загрузка активности">
          <div class="skeleton-item" />
          <div class="skeleton-item" />
          <div class="skeleton-item" />
        </div>

        <template v-else>
          <div v-if="hasFilteredEmptyState" class="empty">
            <p>По текущим фильтрам ничего не найдено</p>
            <button class="empty-reset-btn" @click="handleResetFilters">
              Сбросить фильтры
            </button>
          </div>

          <div v-else-if="hasInitialEmptyState" class="empty">
            <p>Пока нет активности</p>
          </div>

          <div v-else class="feed-list">
            <ActivityCard
              v-for="item in store.items"
              :key="item._id"
              :activity="item"
            />
          </div>

          <div v-if="store.hasMore" class="load-more">
            <button
              class="load-more-btn"
              :disabled="store.isLoadingMore"
              @click="store.loadMore()"
            >
              {{ store.isLoadingMore ? 'Загрузка...' : 'Загрузить ещё' }}
            </button>
          </div>
        </template>
      </main>

      <aside class="activity-sidebar">
        <div v-if="store.tags.length > 0" class="sidebar-block">
          <h3 class="sidebar-title">Рекомендуем также</h3>
          <div class="tags-list">
            <span
              v-for="tag in store.tags"
              :key="tag.name"
              class="tag-item"
            >
              #{{ tag.name }}
            </span>
          </div>
        </div>

        <div class="sidebar-block cta-block">
          <div class="cta-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <p class="cta-text">Создай объявление и найди компанию в путешествие</p>
          <router-link to="/routes?new=1" class="cta-btn">Создать маршрут</router-link>
        </div>
      </aside>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.activity-page {
  padding: 1.5rem 1rem;
}

.activity-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.activity-main {
  min-width: 0;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: $gray-400;
  pointer-events: none;
}

.search-input {
  @include input-base;
  padding-left: 2.5rem;
  padding-right: 2.25rem;
  border-radius: $radius-xl;
  background: $gray-50;
  border-color: $gray-200;

  &:focus {
    background: white;
  }
}

.search-clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: $gray-200;
  color: $gray-500;
  border-radius: 50%;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  @include flex-center;

  &:hover {
    background: $gray-300;
  }
}

.tabs {
  display: flex;
  gap: 0.375rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab-btn {
  @include button-base;
  padding: 0.5rem 1rem;
  font-size: $font-size-sm;
  border-radius: $radius-xl;
  background: $gray-100;
  color: $gray-600;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: $gray-200;
    color: $gray-800;
  }

  &.active {
    background: $primary;
    color: white;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 1px;
  }
}

.filter-summary {
  @include flex-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.filter-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: $radius-xl;
  background: $gray-100;
  color: $gray-700;
  font-size: $font-size-sm;
  font-weight: 500;
}

.reset-filters-btn {
  @include button-base;
  padding: 0.375rem 0.875rem;
  border-radius: $radius-lg;
  background: white;
  color: $gray-700;
  border: 1px solid $gray-300;
  font-size: $font-size-sm;

  &:hover {
    background: $gray-50;
    color: $gray-900;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 1px;
  }
}

.results-caption {
  margin: 0 0 1rem;
  color: $gray-600;
  font-size: $font-size-sm;
  font-weight: 500;
}

.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.skeleton-item {
  height: 96px;
  border-radius: $radius-lg;
  background: linear-gradient(90deg, $gray-100 0%, $gray-200 50%, $gray-100 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s infinite linear;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.empty {
  text-align: center;
  color: $gray-500;
  padding: 3rem;
}

.empty-reset-btn {
  @include button-secondary;
  margin-top: 0.75rem;
}

.feed-list {
  display: flex;
  flex-direction: column;
}

.load-more {
  text-align: center;
  padding: 1.5rem 0;
}

.load-more-btn {
  @include button-secondary;
  padding: 0.625rem 2rem;
  border-radius: $radius-xl;
}

// Sidebar
.activity-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-block {
  @include card;
}

.sidebar-title {
  margin: 0 0 1rem;
  font-size: $font-size-base;
  font-weight: 700;
  color: $gray-800;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: $accent;
  color: $primary;
  font-size: $font-size-sm;
  font-weight: 500;
  border-radius: $radius-xl;
  cursor: pointer;
  transition: all $transition;

  &:hover {
    background: $primary;
    color: white;
  }
}

.cta-block {
  text-align: center;
  background: linear-gradient(135deg, $accent 0%, $accent-blue 100%);
  border: none;
}

.cta-icon {
  @include flex-center;
  width: 48px;
  height: 48px;
  margin: 0 auto 0.75rem;
  background: white;
  border-radius: 50%;
  color: $primary;
}

.cta-text {
  font-size: $font-size-sm;
  color: $gray-700;
  margin: 0 0 1rem;
  font-weight: 500;
}

.cta-btn {
  @include button-base;
  background: white;
  color: $gray-700;
  padding: 0.5rem 1.25rem;
  border-radius: $radius-xl;
  font-size: $font-size-sm;
  text-decoration: none;
  border: 1px solid $gray-200;

  &:hover {
    background: $gray-50;
    border-color: $gray-300;
  }
}

@include tablet {
  .activity-layout {
    grid-template-columns: 1fr;
  }

  .activity-sidebar {
    order: -1;
    flex-direction: row;
    overflow-x: auto;

    .sidebar-block {
      min-width: 260px;
    }
  }
}

@include mobile {
  .activity-page {
    padding: 1rem 0.5rem;
  }

  .activity-sidebar {
    flex-direction: column;
  }

  .filter-summary {
    align-items: flex-start;
  }

  .reset-filters-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
