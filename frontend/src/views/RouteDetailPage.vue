<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/utils/leaflet-icons';
import { useRoutesStore } from '@/stores/routes';
import { useAuthStore } from '@/stores/auth';
import { routeApi } from '@/services/routeApi';
import type { TravelRoute } from '@/types';
import MediaGallery from '@/components/media/MediaGallery.vue';
import { addMapTileLayer } from '@/config/map-tiles';

const route = useRoute();
const router = useRouter();
const routesStore = useRoutesStore();
const authStore = useAuthStore();
const travelRoute = ref<TravelRoute | null>(null);
const mapContainer = ref<HTMLDivElement>();
const mapInstance = ref<L.Map>();
const isLoading = ref(true);
const errorMessage = ref('');

const isOwner = computed(() => {
  if (!travelRoute.value || !authStore.user) return false;
  const authorId = typeof travelRoute.value.author === 'object' && travelRoute.value.author
    ? travelRoute.value.author._id
    : travelRoute.value.authorId;
  return authorId === authStore.user._id;
});

const canCopy = computed(() => {
  return travelRoute.value?.isPublic && !isOwner.value;
});

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  return `${km.toFixed(1)} км`;
}

const exportError = ref('');
const copySuccess = ref(false);

async function handleExport(format: 'gpx' | 'json') {
  if (!travelRoute.value) return;
  exportError.value = '';
  try {
    await routeApi.downloadExport(travelRoute.value._id, format);
  } catch {
    exportError.value = `Не удалось скачать ${format.toUpperCase()} файл`;
  }
}

async function handleCopy() {
  if (!travelRoute.value) return;
  try {
    await routesStore.copyRoute(travelRoute.value._id);
    copySuccess.value = true;
    setTimeout(() => router.push('/routes'), 1500);
  } catch {
    exportError.value = 'Не удалось скопировать маршрут';
  }
}

onMounted(async () => {
  const id = route.params.id as string;
  isLoading.value = true;
  errorMessage.value = '';
  try {
    travelRoute.value = await routesStore.fetchRouteById(id);
    if (!travelRoute.value) {
      errorMessage.value = 'Маршрут не найден';
      isLoading.value = false;
      return;
    }
  } catch {
    errorMessage.value = 'Ошибка загрузки маршрута';
    isLoading.value = false;
    return;
  }
  isLoading.value = false;

  if (mapContainer.value && travelRoute.value?.geoMarks?.length) {
    const map = L.map(mapContainer.value).setView([26.947978976023382, 10.994881808870337], 4);
    mapInstance.value = map;

    addMapTileLayer(map);

    const points: L.LatLngExpression[] = [];

    travelRoute.value.geoMarks.forEach((mark, index) => {
      const latlng: L.LatLngExpression = [mark.coordinates.lat, mark.coordinates.lng];
      points.push(latlng);

      const mediaCount = mark.mediaIds?.length || 0;
      const popupContent = `
        <div class="mark-detail-popup">
          <h4>${index + 1}. ${mark.title}</h4>
          ${mark.description ? `<p>${mark.description}</p>` : ''}
          ${mediaCount > 0 ? `<p class="media-note">${mediaCount} медиафайлов</p>` : ''}
        </div>
      `;

      L.marker(latlng)
        .addTo(map)
        .bindPopup(popupContent);
    });

    if (points.length > 1) {
      L.polyline(points, { color: '#2563eb', weight: 3, opacity: 0.8 }).addTo(map);
    }

    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
    }
  }
});

onBeforeUnmount(() => {
  mapInstance.value?.remove();
  mapInstance.value = undefined;
});
</script>

<template>
  <div class="route-detail">
    <div v-if="isLoading" class="route-loading">
      <div class="loading-spinner" />
      <p>Загрузка маршрута...</p>
    </div>
    <div v-else-if="errorMessage" class="route-error">
      <p>{{ errorMessage }}</p>
      <router-link to="/routes" class="btn-secondary">Назад к маршрутам</router-link>
    </div>
    <div class="route-info container" v-else-if="travelRoute">
      <div class="route-header">
        <div>
          <h1>{{ travelRoute.name }}</h1>
          <p v-if="travelRoute.description" class="description">{{ travelRoute.description }}</p>
        </div>
        <div class="route-badges">
          <span v-if="travelRoute.isPublic" class="badge public">Публичный</span>
        </div>
      </div>

      <div class="route-meta-bar">
        <span>{{ travelRoute.geoMarks?.length || 0 }} точек</span>
        <span v-if="travelRoute.distanceKm !== undefined && travelRoute.distanceKm > 0" class="distance">
          {{ formatDistance(travelRoute.distanceKm) }}
        </span>
        <span v-if="travelRoute.author" class="author">
          от <router-link :to="`/users/${travelRoute.author._id}`" class="author-link">{{ travelRoute.author.name }}</router-link>
        </span>
      </div>

      <div class="route-actions">
        <button class="btn-secondary btn-sm" @click="handleExport('gpx')">Скачать GPX</button>
        <button class="btn-secondary btn-sm" @click="handleExport('json')">Скачать JSON</button>
        <button v-if="canCopy" class="btn-primary btn-sm" @click="handleCopy">Копировать маршрут</button>
      </div>
      <div v-if="exportError" class="toast toast-error">{{ exportError }}</div>
      <div v-if="copySuccess" class="toast toast-success">Маршрут скопирован в ваш список!</div>

      <div v-if="travelRoute.geoMarks?.length" class="marks-list">
        <h3>Точки маршрута</h3>
        <div v-for="(mark, idx) in travelRoute.geoMarks" :key="mark._id" class="mark-item">
          <div class="mark-number">{{ idx + 1 }}</div>
          <div class="mark-content">
            <h4>{{ mark.title }}</h4>
            <p v-if="mark.description" class="mark-description">{{ mark.description }}</p>
            <MediaGallery v-if="mark.mediaIds.length > 0" :media-ids="mark.mediaIds" />
          </div>
        </div>
      </div>
    </div>
    <div class="route-map">
      <div ref="mapContainer" class="route-map-container" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.route-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.route-info {
  padding: 1.5rem 1rem;
}

.route-header {
  @include flex-between;
  margin-bottom: 0.75rem;

  h1 {
    margin-bottom: 0.25rem;
  }

  .description {
    color: $gray-600;
    margin-bottom: 0;
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

.route-meta-bar {
  display: flex;
  gap: 1rem;
  font-size: $font-size-sm;
  color: $gray-400;
  margin-bottom: 1rem;
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
  margin-bottom: 1.5rem;
}

.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: $font-size-sm;
}

.marks-list {
  margin-bottom: 1.5rem;

  h3 {
    margin-bottom: 1rem;
    font-size: $font-size-lg;
  }
}

.mark-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid $gray-100;

  &:last-child {
    border-bottom: none;
  }
}

.mark-number {
  @include flex-center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: $primary;
  color: white;
  font-weight: 600;
  font-size: $font-size-sm;
  flex-shrink: 0;
}

.mark-content {
  flex: 1;
  min-width: 0;

  h4 {
    margin: 0 0 0.25rem;
  }
}

.mark-description {
  color: $gray-600;
  font-size: $font-size-sm;
  margin-bottom: 0.5rem;
}

.route-map {
  position: relative;
  flex: 1;
  min-height: 500px;
}

.route-map-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.route-loading,
.route-error {
  @include flex-center;
  flex-direction: column;
  gap: 1rem;
  padding: 4rem 1rem;
  color: $gray-500;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid $gray-200;
  border-top-color: $primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.toast {
  padding: 0.625rem 1rem;
  border-radius: $radius;
  font-size: $font-size-sm;
  margin-bottom: 1rem;
}

.toast-error {
  background: rgba($danger, 0.1);
  color: $danger;
}

.toast-success {
  background: rgba($secondary, 0.1);
  color: $secondary;
}
</style>

<style>
.mark-detail-popup h4 {
  margin: 0 0 0.25rem;
  font-size: 14px;
}

.mark-detail-popup p {
  margin: 0 0 0.25rem;
  font-size: 12px;
  color: #666;
}

.mark-detail-popup .media-note {
  color: #2563eb;
  font-weight: 500;
}
</style>
