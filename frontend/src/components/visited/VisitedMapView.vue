<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useVisitedStore } from '@/stores/visited';
import { useAuthStore } from '@/stores/auth';
import type { Coordinates, Like, VisitedPlace, Media } from '@/types';
import { likeApi } from '@/services/likeApi';
import { ALPHA2_TO_NUMERIC } from '@/utils/country-codes';
import VisitedPlaceForm from '@/components/visited/VisitedPlaceForm.vue';
import LikeButton from '@/components/likes/LikeButton.vue';
import MediaGallery from '@/components/media/MediaGallery.vue';
import MediaUploader from '@/components/media/MediaUploader.vue';
import { addMapTileLayer } from '@/config/map-tiles';
import { ACTIVE_MAP_POLICY } from '@/config/map-policy';
import {
  getCountryDisplayName,
  getCountryDisplayOverrides,
} from '@/config/country-display-overrides';
import { USE_MOCKS } from '@/config/useMocks';
import { mockVisitedPlaceComments } from '@/mocks';
import {
  getCountriesGeoJSON,
  getRussiaBounds,
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
const markersLayer = ref<L.FeatureGroup>();
const countriesLayer = ref<L.GeoJSON>();
const hasAppliedInitialViewport = ref(false);

const showForm = ref(false);
const formCoords = ref<Coordinates>({ lat: 0, lng: 0 });
const selectedPlace = ref<VisitedPlace | null>(null);

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
}

const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const rawGeoJSON = getCountriesGeoJSON();
const countriesGeoJSON = rawGeoJSON;
const DEFAULT_MAP_CENTER: L.LatLngExpression = [26.947978976023382, 10.994881808870337];
const DEFAULT_WORLD_ZOOM = 2.5;
const COUNTRIES_PANE = 'countriesPane';
const countryDisplayOverrides = getCountryDisplayOverrides(ACTIVE_MAP_POLICY);
const NUMERIC_TO_ALPHA2 = Object.entries(ALPHA2_TO_NUMERIC).reduce<Record<string, string>>(
  (acc, [alpha2, numeric]) => {
    acc[numeric] = alpha2;
    return acc;
  },
  {},
);

function expandCountryCodes(codes: string[]): string[] {
  const result = new Set(codes);
  codes.forEach((code) => {
    const implied = countryDisplayOverrides.impliedCountryCodes[code] || [];
    implied.forEach((extraCode) => result.add(extraCode));
  });
  return Array.from(result);
}

function getVisitedNumericIds(): Set<string> {
  const sourceCodes = visitedStore.displayStatistics?.countryCodes ?? [];
  const codes = expandCountryCodes(sourceCodes);
  const numericIds = new Set<string>();
  for (const alpha2 of codes) {
    const numeric = ALPHA2_TO_NUMERIC[alpha2];
    if (numeric) numericIds.add(numeric);
  }
  return numericIds;
}

function getDisplayCountryName(numericId: string, fallbackName: string): string {
  const alpha2 = NUMERIC_TO_ALPHA2[numericId];
  if (!alpha2) return fallbackName;
  return getCountryDisplayName(alpha2, fallbackName, ACTIVE_MAP_POLICY);
}

function setupMapPanes() {
  if (!mapInstance.value) return;

  if (!mapInstance.value.getPane(COUNTRIES_PANE)) {
    mapInstance.value.createPane(COUNTRIES_PANE);
    mapInstance.value.getPane(COUNTRIES_PANE)!.style.zIndex = '450';
  }

  const markerPane = mapInstance.value.getPane('markerPane');
  if (markerPane) {
    markerPane.style.zIndex = '650';
  }
}

function initMarkersLayer() {
  if (!mapInstance.value) return;

  if (markersLayer.value) {
    mapInstance.value.removeLayer(markersLayer.value);
  }

  markersLayer.value = L.featureGroup().addTo(mapInstance.value);
}

function refreshMapOverlays() {
  if (!mapInstance.value) return;

  renderCountries();

  if (!markersLayer.value) {
    initMarkersLayer();
  }

  renderMarkers();
}

function scheduleMapOverlaysRefresh() {
  window.setTimeout(() => {
    if (!mapInstance.value) return;
    setupMapPanes();
    refreshMapOverlays();
    mapInstance.value.invalidateSize({ animate: false });
  }, 0);
}

function onMapBaseReady() {
  if (!mapInstance.value) return;

  if (!hasAppliedInitialViewport.value) {
    hasAppliedInitialViewport.value = true;
    applyMapViewportAndRefresh();
    return;
  }

  scheduleMapOverlaysRefresh();
}

function renderCountries() {
  if (!mapInstance.value) return;

  if (countriesLayer.value) {
    mapInstance.value.removeLayer(countriesLayer.value);
    countriesLayer.value = undefined;
  }

  if (props.region === 'russia') return;

  const visitedIds = getVisitedNumericIds();

  countriesLayer.value = L.geoJSON(countriesGeoJSON, {
    pane: COUNTRIES_PANE,
    style: (feat) => {
      const id = feat?.id?.toString() ?? '';
      const isVisited = visitedIds.has(id);

      return isVisited
        ? {
            fillColor: '#10b981',
            fillOpacity: 0.4,
            color: '#059669',
            weight: 2,
          }
        : {
            fillColor: 'transparent',
            fillOpacity: 0,
            color: '#cbd5e1',
            weight: 0.5,
          };
    },
    onEachFeature: (feat, layer) => {
      const id = feat?.id?.toString() ?? '';
      if (getVisitedNumericIds().has(id)) {
        const sourceName = (feat.properties as { name?: string })?.name ?? '';
        const name = getDisplayCountryName(id, sourceName);
        layer.bindTooltip(name, { sticky: true, className: 'country-tooltip' });
      }
    },
  }).addTo(mapInstance.value);
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
  return !isNaN(qZoom) ? qZoom : DEFAULT_WORLD_ZOOM;
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
    mapInstance.value.once('moveend', finishViewportChange);
    mapInstance.value.fitBounds(getRussiaBounds(), {
      padding: [24, 24],
      maxZoom: 6,
      animate: false,
    });
    return;
  }

  mapInstance.value.setView(DEFAULT_MAP_CENTER, getInitialWorldZoom(), { animate: false });
  finishViewportChange();
}

function applyMapViewportAndRefresh() {
  applyMapViewport(() => {
    refreshMapOverlays();
  });
}

watch(
  () => visitedStore.displayStatistics?.countryCodes,
  () => {
    if (props.region === 'world') {
      refreshMapOverlays();
    }
  },
);

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

onMounted(async () => {
  visitedStore.setMode(props.mode);
  await visitedStore.loadAll();

  try {
    myLikes.value = await likeApi.getMyLikes();
  } catch {
    // ignore
  }

  if (!mapContainer.value) return;

  mapInstance.value = L.map(mapContainer.value).setView(DEFAULT_MAP_CENTER, getInitialWorldZoom());

  addMapTileLayer(mapInstance.value, {
    onReady: onMapBaseReady,
  });

  mapInstance.value.whenReady(onMapBaseReady);

  mapInstance.value.on('click', (event: L.LeafletMouseEvent) => {
    formCoords.value = { lat: event.latlng.lat, lng: event.latlng.lng };
    showForm.value = true;
    showEditPanel.value = false;
    selectedPlace.value = null;
  });
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
}

function closeEditPanel() {
  showEditPanel.value = false;
  editingPlace.value = null;
}

onBeforeUnmount(() => {
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

      <div v-if="selectedPlace && !showEditPanel" class="selected-place-panel">
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

<style>
.country-tooltip {
  background: rgba(16, 185, 129, 0.9);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.country-tooltip::before {
  border-top-color: rgba(16, 185, 129, 0.9);
}
</style>
