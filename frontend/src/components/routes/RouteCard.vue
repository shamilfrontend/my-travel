<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useRoutesStore } from '@/stores/routes';
import { routeApi } from '@/services/routeApi';
import type { TravelRoute } from '@/types';

interface Props {
  route: TravelRoute;
  showActions?: boolean;
  showCopy?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ edit: [route: TravelRoute] }>();
const router = useRouter();
const routesStore = useRoutesStore();

function viewRoute() {
  router.push(`/routes/${props.route._id}`);
}

async function handleDelete() {
  if (confirm('Удалить маршрут?')) {
    await routesStore.deleteRoute(props.route._id);
  }
}

async function handleCopy() {
  await routesStore.copyRoute(props.route._id);
  alert('Маршрут скопирован!');
}

async function exportGpx() {
  await routeApi.downloadExport(props.route._id, 'gpx');
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  return `${km.toFixed(1)} км`;
}
</script>

<template>
  <div class="route-card" @click="viewRoute">
    <div class="route-header">
      <h3>{{ route.name }}</h3>
      <span v-if="route.isPublic" class="badge public">Публичный</span>
    </div>
    <p v-if="route.description" class="route-description">{{ route.description }}</p>
    <div class="route-meta">
      <span>{{ route.geoMarkIds?.length || route.geoMarks?.length || 0 }} точек</span>
      <span v-if="route.distanceKm !== undefined && route.distanceKm > 0" class="distance">
        {{ formatDistance(route.distanceKm) }}
      </span>
      <span v-if="route.author">
        от <router-link :to="`/users/${route.author._id}`" class="author-link" @click.stop>{{ route.author.name }}</router-link>
      </span>
    </div>
    <div v-if="showActions || showCopy" class="route-actions" @click.stop>
      <button v-if="showCopy" class="btn-secondary btn-sm" @click="handleCopy">Копировать</button>
      <button v-if="showActions" class="btn-secondary btn-sm" @click="emit('edit', route)">Редактировать</button>
      <button v-if="showActions" class="btn-secondary btn-sm" @click="exportGpx">GPX</button>
      <button v-if="showActions" class="btn-danger btn-sm" @click="handleDelete">Удалить</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.route-card {
  @include card;
  cursor: pointer;
  transition: box-shadow $transition;

  &:hover {
    box-shadow: $shadow-md;
  }
}

.route-header {
  @include flex-between;
  margin-bottom: 0.5rem;

  h3 {
    font-size: $font-size-lg;
  }
}

.badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: $radius-sm;
  font-weight: 500;

  &.public {
    background: rgba($secondary, 0.1);
    color: $secondary;
  }
}

.route-description {
  color: $gray-600;
  font-size: $font-size-sm;
  margin-bottom: 0.5rem;
}

.route-meta {
  display: flex;
  gap: 1rem;
  font-size: $font-size-sm;
  color: $gray-400;
}

.distance {
  color: $primary;
  font-weight: 600;
}

.author-link {
  color: $primary;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

.route-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid $gray-100;
}

.btn-sm {
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
}
</style>
