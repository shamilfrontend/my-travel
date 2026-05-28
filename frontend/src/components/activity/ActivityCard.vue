<script setup lang="ts">
import type { ActivityItem } from '@/types';
import { getUserInitials } from '@/utils/user-initials';

interface Props {
  activity: ActivityItem;
}

const props = defineProps<Props>();

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  geo_mark: 'добавил(а) метку',
  route: 'создал(а) маршрут',
  visited_place: 'посетил(а) место',
  like: 'поставил(а) лайк',
  registration: 'присоединился(-ась) к PPR Travel',
  post: 'опубликовал(а) пост',
  event: 'создал(а) событие',
};

const ACTIVITY_TYPE_ICONS: Record<string, string> = {
  geo_mark: '📍',
  route: '🗺️',
  visited_place: '✈️',
  like: '❤️',
  registration: '👋',
  post: '📝',
  event: '📅',
};

function getTypeLabel(type: string): string {
  return ACTIVITY_TYPE_LABELS[type] || type;
}

function getTypeIcon(type: string): string {
  return ACTIVITY_TYPE_ICONS[type] || '📌';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTitle(): string {
  return (props.activity.metadata?.title as string) || '';
}

function getUserLink(): string {
  return `/users/${props.activity.userId._id}`;
}
</script>

<template>
  <div class="activity-card">
    <div class="card-header">
      <router-link :to="getUserLink()" class="user-info">
        <div class="user-avatar">
          <img
            v-if="activity.userId.avatarUrl"
            :src="activity.userId.avatarUrl"
            :alt="activity.userId.name"
          />
          <span v-else class="initials">{{ getUserInitials(activity.userId.name) }}</span>
        </div>
        <div class="user-meta">
          <span class="user-name">{{ activity.userId.name }}</span>
          <span class="activity-date">{{ formatDate(activity.createdAt) }}</span>
        </div>
      </router-link>
      <span class="activity-badge" :class="`badge-${activity.type}`">
        {{ getTypeIcon(activity.type) }} {{ getTypeLabel(activity.type) }}
      </span>
    </div>

    <div v-if="getTitle()" class="card-body">
      <h3 class="activity-title">{{ getTitle() }}</h3>
    </div>

    <div class="card-footer">
      <div class="footer-stats">
        <span class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </span>
        <span class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </span>
        <span class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
      </div>
      <button class="share-btn" title="Поделиться">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.activity-card {
  @include card;
  margin-bottom: 1rem;
  transition: box-shadow $transition;

  &:hover {
    box-shadow: $shadow-md;
  }
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  min-width: 0;
}

.user-avatar {
  @include flex-center;
  width: 2.75rem;
  height: 2.75rem;
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
    font-size: $font-size-sm;
  }
}

.user-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: $gray-800;
  font-size: $font-size-base;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-date {
  font-size: 0.75rem;
  color: $gray-400;
}

.activity-badge {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.625rem;
  border-radius: 1rem;
  white-space: nowrap;

  &.badge-geo_mark {
    background: $accent-blue;
    color: #2563eb;
  }

  &.badge-route {
    background: $accent-green;
    color: #059669;
  }

  &.badge-visited_place {
    background: $accent;
    color: $primary;
  }

  &.badge-like {
    background: $accent-pink;
    color: #db2777;
  }

  &.badge-registration {
    background: $gray-100;
    color: $gray-600;
  }
}

.card-body {
  margin-bottom: 0.75rem;
}

.activity-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $gray-800;
}

.card-footer {
  @include flex-between;
  padding-top: 0.75rem;
  border-top: 1px solid $gray-100;
}

.footer-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: $gray-400;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: color $transition;

  &:hover {
    color: $gray-600;
  }
}

.share-btn {
  @include flex-center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: $gray-400;
  cursor: pointer;
  border-radius: 50%;
  transition: all $transition;

  &:hover {
    background: $gray-100;
    color: $gray-600;
  }
}

@include mobile {
  .card-header {
    flex-direction: column;
  }

  .activity-badge {
    align-self: flex-start;
  }
}
</style>
