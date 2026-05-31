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
  const metadata = props.activity.metadata;
  if (!metadata) return '';

  if (typeof metadata.title === 'string' && metadata.title.trim()) {
    return metadata.title;
  }

  if (typeof metadata.name === 'string' && metadata.name.trim()) {
    return metadata.name;
  }

  return '';
}

function getUserLink(): string {
  return `/users/${props.activity.userId._id}`;
}

function getPreviewText(): string {
  const preview = props.activity.metadata?.preview;
  if (typeof preview !== 'string' || !preview.trim()) {
    return '';
  }

  return preview.trim();
}

function getBodyText(): string {
  const title = getTitle();
  const preview = getPreviewText();

  if (preview) {
    return preview;
  }

  if (title) {
    if (props.activity.type === 'like') {
      return `Отметил(а) понравившимся: ${title}`;
    }
    if (props.activity.type === 'visited_place') {
      return `Поделился(-ась) местом: ${title}`;
    }
    return title;
  }

  if (props.activity.type === 'registration') {
    return 'Новый участник сообщества путешественников.';
  }

  return 'Подробности активности пока недоступны.';
}

function getMetaTag(): string {
  if (props.activity.targetType === 'Route') {
    return 'Маршрут';
  }
  if (props.activity.targetType === 'VisitedPlace') {
    return 'Место';
  }
  if (props.activity.targetType === 'GeoMark') {
    return 'Метка';
  }
  if (props.activity.type === 'post') {
    return 'Пост';
  }
  if (props.activity.type === 'event') {
    return 'Событие';
  }

  return 'Активность';
}

function getTargetLink(): string | null {
  if (!props.activity.targetId) {
    return null;
  }

  if (props.activity.type === 'route') {
    return `/routes/${props.activity.targetId}`;
  }

  if (props.activity.type === 'event') {
    return `/events?eventId=${props.activity.targetId}`;
  }

  if (props.activity.type === 'post') {
    return `/posts/${props.activity.targetId}`;
  }

  if (props.activity.type === 'geo_mark') {
    return `/map?markId=${props.activity.targetId}`;
  }

  if (props.activity.type === 'visited_place') {
    return `/map?tab=all&placeId=${props.activity.targetId}`;
  }

  return null;
}

function isCardClickable(): boolean {
  return getTargetLink() !== null;
}

function getTargetActionLabel(): string {
  if (props.activity.type === 'route') {
    return 'Открыть маршрут';
  }
  if (props.activity.type === 'event') {
    return 'К событиям';
  }
  if (props.activity.type === 'post') {
    return 'Открыть пост';
  }
  if (props.activity.type === 'geo_mark' || props.activity.type === 'visited_place') {
    return 'Открыть на карте';
  }

  return 'Открыть';
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

    <router-link
      v-if="isCardClickable()"
      :to="getTargetLink()!"
      class="card-body card-body-link"
    >
      <h3 v-if="getTitle()" class="activity-title">{{ getTitle() }}</h3>
      <p class="activity-text">{{ getBodyText() }}</p>
      <div class="meta-row">
        <span class="meta-tag">{{ getMetaTag() }}</span>
        <span class="meta-action">{{ getTargetActionLabel() }}</span>
      </div>
    </router-link>

    <div v-else class="card-body">
      <h3 v-if="getTitle()" class="activity-title">{{ getTitle() }}</h3>
      <p class="activity-text">{{ getBodyText() }}</p>
      <div class="meta-row">
        <span class="meta-tag">{{ getMetaTag() }}</span>
      </div>
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

.card-body-link {
  display: block;
  text-decoration: none;
  color: inherit;
  border-radius: $radius-lg;
  transition: background-color $transition;

  &:hover {
    background: $gray-50;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }
}

.activity-title {
  margin: 0 0 0.375rem;
  font-size: $font-size-base;
  font-weight: 600;
  color: $gray-800;
}

.activity-text {
  margin: 0;
  color: $gray-700;
  font-size: $font-size-sm;
  line-height: 1.5;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid $gray-100;
  flex-wrap: wrap;
}

.meta-tag {
  padding: 0.25rem 0.625rem;
  border-radius: $radius-xl;
  background: $gray-100;
  color: $gray-700;
  font-size: 0.75rem;
  font-weight: 600;
}

.meta-action {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 600;
  color: $primary;
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
