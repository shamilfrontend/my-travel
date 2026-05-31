<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/utils/leaflet-icons';
import { useRoutesStore } from '@/stores/routes';
import type { GeoMark, TravelRoute } from '@/types';
import MediaGallery from '@/components/media/MediaGallery.vue';
import { addMapTileLayer, cleanupMapTileLayer, createLeafletMap } from '@/config/map-tiles';

interface RouteDayView {
  title: string;
  marks: GeoMark[];
}

const route = useRoute();
const routesStore = useRoutesStore();
const travelRoute = ref<TravelRoute | null>(null);
const mapContainer = ref<HTMLDivElement>();
const mapInstance = ref<L.Map>();
const isLoading = ref(true);
const errorMessage = ref('');

const routeDays = computed<RouteDayView[]>(() => {
  const currentRoute = travelRoute.value;
  if (!currentRoute?.geoMarks?.length) return [];

  if (currentRoute.days?.length) {
    const marksById = new Map(currentRoute.geoMarks.map((mark) => [mark._id, mark]));

    return currentRoute.days.map((day) => ({
      title: day.title,
      marks: day.geoMarkIds
        .map((id) => marksById.get(id))
        .filter((mark): mark is GeoMark => !!mark),
    }));
  }

  return [{ title: 'Маршрут', marks: currentRoute.geoMarks }];
});

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  return `${km.toFixed(1)} км`;
}

function destroyMap() {
  cleanupMapTileLayer(mapInstance.value);
  mapInstance.value?.remove();
  mapInstance.value = undefined;
}

async function initRouteMap() {
  const marks = travelRoute.value?.geoMarks;
  if (!marks?.length) return;

  await nextTick();
  if (!mapContainer.value) return;

  destroyMap();

  const map = createLeafletMap(mapContainer.value).setView(
    [26.947978976023382, 10.994881808870337],
    4,
  );
  mapInstance.value = map;

  await addMapTileLayer(map);

  const points: L.LatLngExpression[] = [];

  marks.forEach((mark, index) => {
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

  await nextTick();
  map.invalidateSize();
}

async function loadRoute() {
  const id = route.params.id as string;
  isLoading.value = true;
  errorMessage.value = '';
  destroyMap();

  try {
    travelRoute.value = await routesStore.fetchRouteById(id);
    if (!travelRoute.value) {
      errorMessage.value = 'Маршрут не найден';
      return;
    }
  } catch {
    errorMessage.value = 'Ошибка загрузки маршрута';
    travelRoute.value = null;
    return;
  } finally {
    isLoading.value = false;
  }

  await initRouteMap();
}

watch(() => route.params.id, loadRoute, { immediate: true });

onBeforeUnmount(() => {
  destroyMap();
});
</script>

<template>
  <div class="route-detail">
		<div class="container">
			<nav class="route-breadcrumbs" aria-label="Навигация">
				<router-link to="/routes">Маршруты</router-link>
				<template v-if="travelRoute">
					<span class="separator" aria-hidden="true">/</span>
					<span class="current">{{ travelRoute.name }}</span>
				</template>
			</nav>

			<div v-if="isLoading" class="route-loading">
				<div class="loading-spinner" />
				<p>Загрузка маршрута...</p>
			</div>
			<div v-else-if="errorMessage" class="route-error">
				<p>{{ errorMessage }}</p>
				<router-link to="/routes" class="btn-secondary">Назад к маршрутам</router-link>
			</div>
			<div v-else-if="travelRoute" class="route-layout">
				<div class="route-info">
					<div class="route-header">
						<div>
							<h1>{{ travelRoute.name }}</h1>
							<p v-if="travelRoute.description" class="description">{{ travelRoute.description }}</p>
						</div>
					</div>

					<div class="route-meta-bar">
						<span>{{ travelRoute.geoMarks?.length || 0 }} точек</span>
						<span v-if="travelRoute.days?.length">{{ travelRoute.days.length }} дней</span>
						<span v-if="travelRoute.distanceKm !== undefined && travelRoute.distanceKm > 0" class="distance">
            {{ formatDistance(travelRoute.distanceKm) }}
          </span>
						<span v-if="travelRoute.author" class="author">
            от <router-link :to="`/users/${travelRoute.author._id}`" class="author-link">{{ travelRoute.author.name }}</router-link>
          </span>
					</div>

					<div v-if="routeDays.length" class="marks-list">
						<h3>Точки маршрута</h3>
						<div v-for="day in routeDays" :key="day.title" class="route-day">
							<h4 class="route-day-title">{{ day.title }}</h4>
							<div v-for="(mark, idx) in day.marks" :key="mark._id" class="mark-item">
								<div class="mark-number">{{ idx + 1 }}</div>
								<div class="mark-content">
									<h4>{{ mark.title }}</h4>
									<p v-if="mark.description" class="mark-description">{{ mark.description }}</p>
									<MediaGallery v-if="mark.mediaIds.length > 0" :media-ids="mark.mediaIds" />
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="route-map">
					<div ref="mapContainer" class="route-map-container" />
				</div>
			</div>
		</div>
  </div>
</template>

<style lang="scss" scoped>
.route-breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 1.5rem 0 0;
  font-size: $font-size-sm;

  a {
    color: $gray-500;
    text-decoration: none;

    &:hover {
      color: $primary;
    }
  }

  .separator {
    color: $gray-300;
  }

  .current {
    color: $gray-700;
    font-weight: 500;
  }
}

.route-layout {
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 1.5rem;
  padding: 1.5rem 0;
  align-items: flex-start;
}

.route-info {
  flex: 1 1 58%;
  min-width: 0;
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

.marks-list {
  margin-bottom: 1.5rem;

  > h3 {
    margin-bottom: 1rem;
    font-size: $font-size-lg;
  }
}

.route-day {
  &:not(:last-child) {
    margin-bottom: 1.5rem;
  }

  .mark-item:last-child {
    border-bottom: none;
  }
}

.route-day-title {
  margin: 0 0 0.75rem;
  font-size: $font-size-base;
  font-weight: 600;
  color: $gray-700;
}

.mark-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid $gray-100;
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
  position: sticky;
  top: 80px;
  flex: 1 1 42%;
  min-width: 280px;
  height: calc(100vh - 7rem);
  min-height: 420px;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-md;
}

.route-map-container {
  width: 100%;
  height: 100%;
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

@include tablet {
  .route-layout {
    flex-direction: column;
  }

  .route-map {
    position: relative;
    top: auto;
    flex: none;
    width: 100%;
    height: 360px;
    min-height: 360px;
  }
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
