<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useVisitedStore } from '@/stores/visited';
import { useAuthStore } from '@/stores/auth';
import type { Coordinates, GeoMark, Like, VisitedPlace, Media } from '@/types';
import { likeApi } from '@/services/likeApi';
import { geoMarkApi } from '@/services/geoMarkApi';
import VisitedPlaceForm from '@/components/visited/VisitedPlaceForm.vue';
import LikeButton from '@/components/likes/LikeButton.vue';
import MediaGallery from '@/components/media/MediaGallery.vue';
import MediaUploader from '@/components/media/MediaUploader.vue';
import { addMapTileLayer, cleanupMapTileLayer, createLeafletMap, syncMapTileLayer } from '@/config/map-tiles';
import { USE_MOCKS } from '@/config/useMocks';
import { mockVisitedPlaceComments } from '@/mocks';
import {
  isPointInRussia,
  type MapRegion,
} from '@/utils/map-regions';

interface Props {
  mode: 'all' | 'my';
  region?: MapRegion;
}

const props = withDefaults(defineProps<Props>(), {
  region: 'world',
});

const currentRoute = useRoute();
const router = useRouter();
const visitedStore = useVisitedStore();
const authStore = useAuthStore();

const mapContainer = ref<HTMLDivElement>();
const mapInstance = ref<L.Map>();
const isMapMounted = ref(true);
const markersLayer = ref<L.FeatureGroup>();
const hasAppliedInitialViewport = ref(false);

const showForm = ref(false);
const formCoords = ref<Coordinates>({ lat: 0, lng: 0 });
const selectedPlace = ref<VisitedPlace | null>(null);
const selectedGeoMark = ref<GeoMark | null>(null);
const geoMarkMarker = ref<L.Marker | null>(null);

const editingPlace = ref<VisitedPlace | null>(null);
const editTitle = ref('');
const editNote = ref('');
const editMediaIds = ref<string[]>([]);
const editMediaList = ref<Media[]>([]);
const showEditPanel = ref(false);

const myLikes = ref<Like[]>([]);
const selectedCommentText = ref('');
interface PlaceComment {
  text: string;
  authorId?: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string;
}

const selectedPlaceComments = ref<Record<string, PlaceComment[]>>({});

const LOCAL_COMMENTS_KEY = 'visited-place-comments-v1';

function getSelectedPlaceComments(): PlaceComment[] {
  if (!selectedPlace.value) return [];
  return selectedPlaceComments.value[selectedPlace.value._id] || [];
}

function loadCommentsFromStorage() {
  const baseComments = USE_MOCKS ? { ...mockVisitedPlaceComments } : {};
  try {
    const saved = localStorage.getItem(LOCAL_COMMENTS_KEY);
    if (!saved) {
      selectedPlaceComments.value = baseComments;
      return;
    }

    const parsed = JSON.parse(saved) as Record<string, PlaceComment[] | string[]>;
    if (parsed && typeof parsed === 'object') {
      const migrated: Record<string, PlaceComment[]> = {};
      for (const placeId of Object.keys(parsed)) {
        const rawComments = parsed[placeId] || [];
        migrated[placeId] = rawComments.map((comment) => {
          if (typeof comment === 'string') {
            return {
              text: comment,
              authorName: 'Путешественник',
              createdAt: new Date().toISOString(),
            };
          }

          return {
            text: comment.text,
            authorId: comment.authorId,
            authorName: comment.authorName || 'Путешественник',
            authorAvatarUrl: comment.authorAvatarUrl,
            createdAt: comment.createdAt || new Date().toISOString(),
          };
        });
      }
      selectedPlaceComments.value = { ...baseComments, ...migrated };
    }
  } catch {
    // ignore corrupted local data
    selectedPlaceComments.value = baseComments;
  }
}

function saveCommentsToStorage() {
  try {
    localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(selectedPlaceComments.value));
  } catch {
    // ignore storage errors
  }
}

function addCommentForSelectedPlace() {
  const text = selectedCommentText.value.trim();
  if (!selectedPlace.value || !text) return;
  const placeId = selectedPlace.value._id;
  const authorName = authStore.user?.name || 'Путешественник';
  const comments = selectedPlaceComments.value[placeId] || [];
  selectedPlaceComments.value[placeId] = [{
    text,
    authorId: authStore.user?._id,
    authorName,
    authorAvatarUrl: authStore.user?.avatarUrl,
    createdAt: new Date().toISOString(),
  }, ...comments].slice(0, 20);
  selectedCommentText.value = '';
  saveCommentsToStorage();
}

function getCommentAuthorInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function closeAllPanels() {
  showForm.value = false;
  showEditPanel.value = false;
  selectedPlace.value = null;
  clearSelectedGeoMark(true);

  if (typeof currentRoute.query.placeId === 'string') {
    const query = { ...currentRoute.query };
    delete query.placeId;
    router.replace({ query });
  }
}

function clearGeoMarkMarker() {
  if (!geoMarkMarker.value) return;

  geoMarkMarker.value.remove();
  geoMarkMarker.value = null;
}

function clearSelectedGeoMark(clearQuery = true) {
  selectedGeoMark.value = null;
  clearGeoMarkMarker();

  if (!clearQuery || typeof currentRoute.query.markId !== 'string') {
    return;
  }

  const query = { ...currentRoute.query };
  delete query.markId;
  router.replace({ query });
}

function focusMapOnCoordinates(coordinates: Coordinates, zoom = 12) {
  if (!mapInstance.value) return;

  mapInstance.value.setView(
    [coordinates.lat, coordinates.lng],
    zoom,
    { animate: false },
  );
}

function renderGeoMarkMarker(mark: GeoMark) {
  if (!mapInstance.value) return;

  clearGeoMarkMarker();
  geoMarkMarker.value = L.marker(
    [mark.coordinates.lat, mark.coordinates.lng],
    { icon: blueIcon },
  ).addTo(mapInstance.value);
}

async function openGeoMarkById(markId: string) {
  const mark = await geoMarkApi.getById(markId);
  if (!mark || !isMapMounted.value) return;

  showForm.value = false;
  showEditPanel.value = false;
  selectedPlace.value = null;
  selectedGeoMark.value = mark;
  focusMapOnCoordinates(mark.coordinates);
  renderGeoMarkMarker(mark);
}

function openPlaceById(placeId: string) {
  const place = visitedStore.displayPlaces.find((item) => item._id === placeId);
  if (!place) return;

  showForm.value = false;
  showEditPanel.value = false;
  clearSelectedGeoMark(false);
  selectedPlace.value = place;
  focusMapOnCoordinates(place.coordinates);
}

function closeSelectedGeoMarkPanel() {
  clearSelectedGeoMark();
}

function getDeepLinkMarkId(): string {
  const value = currentRoute.query.markId;
  return typeof value === 'string' ? value : '';
}

function getDeepLinkPlaceId(): string {
  const value = currentRoute.query.placeId;
  return typeof value === 'string' ? value : '';
}

async function applyDeepLinkFromQuery() {
  if (!isMapReady.value || !isDataReady.value) return;

  const markId = getDeepLinkMarkId();
  if (markId) {
    await openGeoMarkById(markId);
    return;
  }

  const placeId = getDeepLinkPlaceId();
  if (placeId) {
    openPlaceById(placeId);
  }
}

const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_MAP_CENTER: L.LatLngExpression = [26.947978976023382, 10.994881808870337];
const DEFAULT_WORLD_ZOOM = 3;
const RUSSIA_MAP_CENTER: L.LatLngExpression = [61.079063759728385, 88.19588694594019];
const RUSSIA_MAP_ZOOM = 3.5;

function initMarkersLayer() {
  if (!mapInstance.value) return;

  if (markersLayer.value) {
    mapInstance.value.removeLayer(markersLayer.value);
  }

  markersLayer.value = L.featureGroup().addTo(mapInstance.value);
}

function refreshMapOverlays() {
  if (!mapInstance.value || !isMapReady.value || !isDataReady.value) return;

  if (!markersLayer.value) {
    initMarkersLayer();
  }

  renderMarkers();
  syncMapTileLayer(mapInstance.value);
}

function scheduleMapOverlaysRefresh() {
  window.requestAnimationFrame(() => {
    if (!mapInstance.value) return;
    refreshMapOverlays();
  });
}

const isMapReady = ref(false);
const isDataReady = ref(false);

function tryApplyInitialOverlays() {
  if (!mapInstance.value || !isMapReady.value || !isDataReady.value) return;

  window.requestAnimationFrame(() => {
    if (!mapInstance.value || !isMapReady.value || !isDataReady.value) return;

    mapInstance.value.invalidateSize({ animate: false });

    if (!hasAppliedInitialViewport.value) {
      hasAppliedInitialViewport.value = true;
      applyMapViewportAndRefresh();
      void applyDeepLinkFromQuery();
      return;
    }

    scheduleMapOverlaysRefresh();
  });
}

function onMapBaseReady() {
  if (!mapInstance.value) return;

  isMapReady.value = true;
  tryApplyInitialOverlays();
}

function isOwnPlace(place: VisitedPlace): boolean {
  return place.userId === authStore.user?._id;
}

function getVisiblePlaces(): VisitedPlace[] {
  if (props.region === 'russia') {
    return visitedStore.displayPlaces.filter((place) =>
      isPointInRussia(place.coordinates.lat, place.coordinates.lng),
    );
  }
  return visitedStore.displayPlaces;
}

function renderMarkers() {
  if (!markersLayer.value) return;
  markersLayer.value.clearLayers();

  getVisiblePlaces().forEach((place) => {
    const marker = L.marker([place.coordinates.lat, place.coordinates.lng], { icon: greenIcon });
    marker.on('click', () => {
      selectedPlace.value = place;
      showForm.value = false;
      clearSelectedGeoMark();
    });
    markersLayer.value!.addLayer(marker);
  });
}

async function refreshStatistics() {
  const year = visitedStore.selectedYear;
  await Promise.all([
    visitedStore.fetchStatistics(year),
    visitedStore.fetchAllStatistics(year),
  ]);
}

function getInitialWorldZoom(): number {
  const qZoom = parseInt(currentRoute.query.zoom as string, 10);
  const zoom = !isNaN(qZoom) ? qZoom : DEFAULT_WORLD_ZOOM;
  return Math.round(zoom);
}

function applyMapViewport(onSettled?: () => void) {
  if (!mapInstance.value) {
    onSettled?.();
    return;
  }

  const finishViewportChange = () => {
    onSettled?.();
  };

  if (props.region === 'russia') {
    mapInstance.value.setView(RUSSIA_MAP_CENTER, RUSSIA_MAP_ZOOM, { animate: false });
    window.requestAnimationFrame(() => {
      syncMapTileLayer(mapInstance.value);
      finishViewportChange();
    });
    return;
  }

  mapInstance.value.setView(DEFAULT_MAP_CENTER, getInitialWorldZoom(), { animate: false });
  window.requestAnimationFrame(() => {
    syncMapTileLayer(mapInstance.value);
    finishViewportChange();
  });
}

function applyMapViewportAndRefresh() {
  applyMapViewport(() => {
    refreshMapOverlays();
  });
}

watch(
  () => visitedStore.displayPlaces,
  () => refreshMapOverlays(),
  { deep: true },
);

watch(
  () => props.mode,
  (newMode) => {
    visitedStore.setMode(newMode);
    closeAllPanels();
    refreshMapOverlays();
  },
);

watch(
  () => props.region,
  () => {
    applyMapViewportAndRefresh();
    closeAllPanels();
  },
);

watch(
  () => [currentRoute.query.markId, currentRoute.query.placeId],
  () => {
    void applyDeepLinkFromQuery();
  },
);

onMounted(async () => {
  visitedStore.setMode(props.mode);

  const dataPromise = visitedStore.loadAll().finally(() => {
    isDataReady.value = true;
  });

  await nextTick();
  if (!mapContainer.value || !isMapMounted.value) return;

  mapInstance.value = createLeafletMap(mapContainer.value).setView(
    DEFAULT_MAP_CENTER,
    getInitialWorldZoom(),
  );

  await addMapTileLayer(mapInstance.value, {
    onReady: onMapBaseReady,
  });

  if (!isMapMounted.value || !mapInstance.value) return;

  mapInstance.value.whenReady(onMapBaseReady);

  mapInstance.value.on('click', (event: L.LeafletMouseEvent) => {
    formCoords.value = { lat: event.latlng.lat, lng: event.latlng.lng };
    showForm.value = true;
    showEditPanel.value = false;
    selectedPlace.value = null;
    clearSelectedGeoMark();
  });

  try {
    myLikes.value = await likeApi.getMyLikes();
  } catch {
    // ignore
  }

  await dataPromise;
  if (!isMapMounted.value || !mapInstance.value) return;
  tryApplyInitialOverlays();
});

function openEditPanel(place: VisitedPlace) {
  editingPlace.value = place;
  editTitle.value = place.title;
  editNote.value = place.note || '';
  editMediaIds.value = [...(place.mediaIds || [])];
  editMediaList.value = [];
  showEditPanel.value = true;
  showForm.value = false;
  selectedPlace.value = null;
}

function handleEditMediaUploaded(media: Media) {
  editMediaIds.value.push(media._id);
  editMediaList.value.push(media);
}

function handleEditMediaRemoved(id: string) {
  editMediaIds.value = editMediaIds.value.filter((mid) => mid !== id);
  editMediaList.value = editMediaList.value.filter((m) => m._id !== id);
}

async function handleEditSave() {
  if (!editingPlace.value) return;
  await visitedStore.updatePlace(editingPlace.value._id, {
    title: editTitle.value,
    note: editNote.value || undefined,
    mediaIds: editMediaIds.value,
  });
  showEditPanel.value = false;
  editingPlace.value = null;
  renderMarkers();
  await refreshStatistics();
}

async function handlePlaceAdded() {
  showForm.value = false;
  await visitedStore.loadAll();
  renderMarkers();
}

function createMarkFromSelectedPlace() {
  if (!selectedPlace.value) return;
  router.push({
    path: '/map',
    query: {
      tab: 'my',
      lat: selectedPlace.value.coordinates.lat.toString(),
      lng: selectedPlace.value.coordinates.lng.toString(),
      title: selectedPlace.value.title,
      description: selectedPlace.value.note || undefined,
    },
  });
}

async function deleteSelectedPlace() {
  if (!selectedPlace.value) return;
  await visitedStore.deletePlace(selectedPlace.value._id);
  selectedPlace.value = null;
  renderMarkers();
  await refreshStatistics();
}

function closeSelectedPlacePanel() {
  selectedPlace.value = null;
  selectedCommentText.value = '';

  if (typeof currentRoute.query.placeId !== 'string') {
    return;
  }

  const query = { ...currentRoute.query };
  delete query.placeId;
  router.replace({ query });
}

function closeEditPanel() {
  showEditPanel.value = false;
  editingPlace.value = null;
}

onBeforeUnmount(() => {
  isMapMounted.value = false;
  cleanupMapTileLayer(mapInstance.value);
  mapInstance.value?.remove();
  mapInstance.value = undefined;
});

onMounted(() => {
  loadCommentsFromStorage();
});
</script>

<template>
  <div class="visited-map">
    <div class="map-section">
      <div ref="mapContainer" class="map-container" />

      <VisitedPlaceForm
        v-if="showForm"
        :coordinates="formCoords"
        class="form-overlay"
        @added="handlePlaceAdded"
        @cancel="showForm = false"
      />

      <div v-if="selectedGeoMark && !showEditPanel" class="selected-place-panel">
        <div class="panel-header">
          <h3>{{ selectedGeoMark.title }}</h3>
          <button
            type="button"
            class="close-btn"
            aria-label="Закрыть карточку метки"
            @click="closeSelectedGeoMarkPanel"
          >
            &times;
          </button>
        </div>
        <p v-if="selectedGeoMark.description" class="note">{{ selectedGeoMark.description }}</p>
        <p v-else class="note muted">Описание не добавлено</p>

        <div v-if="selectedGeoMark.mediaIds?.length" class="selected-gallery">
          <p class="section-title">Фотографии</p>
          <MediaGallery :media-ids="selectedGeoMark.mediaIds" />
        </div>
      </div>

      <div v-if="selectedPlace && !showEditPanel && !selectedGeoMark" class="selected-place-panel">
        <div class="panel-header">
          <h3>{{ selectedPlace.title }}</h3>
          <button type="button" class="close-btn" aria-label="Закрыть карточку места" @click="closeSelectedPlacePanel">
            &times;
          </button>
        </div>
        <p v-if="selectedPlace.visitedDate" class="date">
          Посещено: {{ new Date(selectedPlace.visitedDate).toLocaleDateString('ru-RU') }}
        </p>
        <p v-if="selectedPlace.note" class="note">{{ selectedPlace.note }}</p>
        <p v-else class="note muted">Описание не добавлено</p>

        <div v-if="selectedPlace.mediaIds?.length" class="selected-gallery">
          <p class="section-title">Фотографии</p>
          <MediaGallery :media-ids="selectedPlace.mediaIds" />
        </div>

        <div class="panel-actions" v-if="isOwnPlace(selectedPlace)">
          <button type="button" class="btn-primary" @click="openEditPanel(selectedPlace)">Изменить</button>
          <button type="button" class="btn-danger" @click="deleteSelectedPlace">Удалить</button>
          <button type="button" class="btn-secondary" @click="createMarkFromSelectedPlace">
            Создать метку
          </button>
        </div>

        <div class="selected-comments">
          <p class="section-title">Комментарии</p>
          <p v-if="getSelectedPlaceComments().length === 0" class="muted comment-empty">
            Пока нет комментариев
          </p>
          <div v-else class="comment-list">
            <p v-for="(comment, index) in getSelectedPlaceComments()" :key="`${selectedPlace._id}-${index}`" class="comment-item">
              <span class="comment-author">
                <router-link
                  v-if="comment.authorId"
                  :to="`/users/${comment.authorId}`"
                  class="comment-author-link"
                >
                  <img
                    v-if="comment.authorAvatarUrl"
                    :src="comment.authorAvatarUrl"
                    :alt="comment.authorName"
                    class="comment-author-avatar"
                  />
                  <span v-else class="comment-author-avatar comment-author-avatar-placeholder">
                    {{ getCommentAuthorInitials(comment.authorName) }}
                  </span>
                  <strong>{{ comment.authorName }}</strong>
                </router-link>
                <span v-else class="comment-author-link comment-author-text">
                  <img
                    v-if="comment.authorAvatarUrl"
                    :src="comment.authorAvatarUrl"
                    :alt="comment.authorName"
                    class="comment-author-avatar"
                  />
                  <span v-else class="comment-author-avatar comment-author-avatar-placeholder">
                    {{ getCommentAuthorInitials(comment.authorName) }}
                  </span>
                  <strong>{{ comment.authorName }}</strong>
                </span>
              </span>
              <span class="comment-text">{{ comment.text }}</span>
            </p>
          </div>
          <div class="comment-form-wrap">
            <form class="comment-form" @submit.prevent="addCommentForSelectedPlace">
              <textarea
                v-model="selectedCommentText"
                class="input"
                rows="2"
                maxlength="300"
                placeholder="Оставьте комментарий..."
              />
              <button type="submit" class="btn-secondary">Отправить</button>
            </form>
          </div>
        </div>
      </div>

      <p class="map-disclaimer">
        Границы и наименования на карте отображаются согласно выбранному картографическому источнику и региональной конфигурации.
      </p>

      <div v-if="showEditPanel" class="edit-panel">
        <div class="edit-panel-header">
          <h3>Редактировать</h3>
          <div class="edit-panel-actions">
            <LikeButton
              v-if="editingPlace"
              target-type="VisitedPlace"
              :target-id="editingPlace._id"
              :likes="myLikes"
            />
            <button type="button" class="close-btn" aria-label="Закрыть панель редактирования" @click="closeEditPanel">
              &times;
            </button>
          </div>
        </div>
        <form @submit.prevent="handleEditSave">
          <div class="form-group">
            <label>Название</label>
            <input v-model="editTitle" class="input" required />
          </div>
          <div class="form-group">
            <label>Заметка</label>
            <textarea v-model="editNote" class="input" rows="3" maxlength="500" />
          </div>
          <div class="form-group">
            <label>Медиа</label>
            <MediaGallery
              v-if="editMediaIds.length > 0"
              :media-ids="editMediaIds"
              :media-list="editMediaList"
              editable
              @removed="handleEditMediaRemoved"
            />
            <MediaUploader @uploaded="handleEditMediaUploaded" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">Сохранить</button>
            <button type="button" class="btn-secondary" @click="closeEditPanel">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.visited-map {
  flex: 1;
  display: flex;
  height: 100%;
}

.map-section {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.map-disclaimer {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 0.5rem;
  z-index: 900;
  margin: 0;
  font-size: 0.6875rem;
  color: rgba(15, 23, 42, 0.72);
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: $radius-sm;
  padding: 0.35rem 0.5rem;
  backdrop-filter: blur(2px);
  pointer-events: none;
}

.form-overlay {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 340px;
  max-width: calc(100% - 2rem);
}

.selected-place-panel {
  position: absolute;
  top: 1rem;
  left: 1rem;
  bottom: 1rem;
  z-index: 1000;
  @include card;
  width: 420px;
  max-width: calc(100% - 2rem);
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  h3 {
    margin-bottom: 0.25rem;
  }

  p {
    margin-bottom: 0.5rem;
    font-size: $font-size-sm;
    color: $gray-600;
  }
}

.section-title {
  margin: 0.75rem 0 0.5rem;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $gray-700;
}

.selected-gallery {
  margin-top: 0.5rem;
}

.selected-comments {
  margin-top: auto;
  padding-top: 0.75rem;
}

.comment-form-wrap {
  position: sticky;
  bottom: -1rem;
  background: white;
  padding-top: 0.5rem;
  border-top: 1px solid $gray-100;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.comment-item {
  margin: 0;
  padding: 0.5rem 0.625rem;
  border-radius: $radius-sm;
  background: $gray-50;
  border: 1px solid $gray-100;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: $gray-600;
}

.comment-author-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: inherit;
  text-decoration: none;
}

.comment-author-link:hover strong {
  text-decoration: underline;
}

.comment-author-text:hover strong {
  text-decoration: none;
}

.comment-author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-author-avatar-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: $gray-300;
  color: $gray-700;
  font-size: 0.6875rem;
  font-weight: 700;
}

.comment-text {
  font-size: $font-size-sm;
  color: $gray-700;
  line-height: 1.35;
  white-space: pre-wrap;
}

.comment-empty {
  margin-top: 0.375rem;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.date {
  font-weight: 500;
}

.note {
  white-space: pre-wrap;
}

.muted {
  color: $gray-400 !important;
}

.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  button {
    min-height: 36px;
  }
}

.edit-panel {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  @include card;
  width: 360px;
  max-width: calc(100% - 2rem);
  max-height: calc(100vh - 130px);
  overflow-y: auto;

  h3 {
    margin-bottom: 1rem;
  }
}

.edit-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;

  h3 {
    margin-bottom: 0;
  }
}

.edit-panel-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: $gray-700;
  }

  textarea {
    resize: vertical;
  }
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-danger {
  @include button-base;
  background: $danger;
  color: white;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: $gray-100;
  color: $gray-600;
  cursor: pointer;
  line-height: 1;
  font-size: 1.25rem;
  flex-shrink: 0;

  &:hover {
    background: $gray-200;
    color: $gray-800;
  }
}

@include mobile {
  .form-overlay {
    top: auto;
    bottom: 0.75rem;
    left: 0.75rem;
    right: 0.75rem;
    transform: none;
    width: auto;
    max-width: none;
  }

  .selected-place-panel,
  .edit-panel {
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
    width: auto;
    max-width: none;
    max-height: min(52vh, 420px);
    overflow-y: auto;
  }

  .map-disclaimer {
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.35rem;
    font-size: 0.625rem;
  }

  .panel-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .panel-actions button,
  .form-actions button {
    width: 100%;
  }
}
</style>
