<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';
import worldTopology from 'world-atlas/countries-110m.json';
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

interface Props {
  mode: 'all' | 'my';
}

const props = defineProps<Props>();

const currentRoute = useRoute();
const router = useRouter();
const visitedStore = useVisitedStore();
const authStore = useAuthStore();

const mapContainer = ref<HTMLDivElement>();
const mapInstance = ref<L.Map>();
const markersLayer = ref<L.LayerGroup>();
const countriesLayer = ref<L.GeoJSON>();

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

const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function fixRing(ring: Position[]): Position[] {
  let crosses = false;
  for (let i = 1; i < ring.length; i++) {
    if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) {
      crosses = true;
      break;
    }
  }
  if (!crosses) return ring;
  return ring.map(([lng, lat]) => [lng < 0 ? lng + 360 : lng, lat]);
}

function fixAntimeridian(geojson: FeatureCollection<Geometry>): FeatureCollection<Geometry> {
  return {
    ...geojson,
    features: geojson.features.map((feat): Feature<Geometry> => {
      const geom = feat.geometry;
      if (geom.type === 'Polygon') {
        return { ...feat, geometry: { ...geom, coordinates: geom.coordinates.map(fixRing) } };
      }
      if (geom.type === 'MultiPolygon') {
        return {
          ...feat,
          geometry: { ...geom, coordinates: geom.coordinates.map((poly) => poly.map(fixRing)) },
        };
      }
      return feat;
    }),
  };
}

const rawGeoJSON = feature(
  worldTopology as unknown as Topology,
  (worldTopology as unknown as Topology).objects.countries as GeometryCollection,
) as FeatureCollection<Geometry>;

const countriesGeoJSON = fixAntimeridian(rawGeoJSON);

function getVisitedNumericIds(): Set<string> {
  const codes = visitedStore.displayStatistics?.countryCodes ?? [];
  const numericIds = new Set<string>();
  for (const alpha2 of codes) {
    const numeric = ALPHA2_TO_NUMERIC[alpha2];
    if (numeric) numericIds.add(numeric);
  }
  return numericIds;
}

function renderCountries() {
  if (!mapInstance.value) return;

  if (countriesLayer.value) {
    mapInstance.value.removeLayer(countriesLayer.value);
  }

  const visitedIds = getVisitedNumericIds();

  countriesLayer.value = L.geoJSON(countriesGeoJSON, {
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
        const name = (feat.properties as { name?: string })?.name ?? '';
        layer.bindTooltip(name, { sticky: true, className: 'country-tooltip' });
      }
    },
  }).addTo(mapInstance.value);

  countriesLayer.value.bringToBack();
}

function isOwnPlace(place: VisitedPlace): boolean {
  return place.userId === authStore.user?._id;
}

function renderMarkers() {
  if (!markersLayer.value) return;
  markersLayer.value.clearLayers();

  visitedStore.displayPlaces.forEach((place) => {
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

watch(
  () => visitedStore.displayStatistics?.countryCodes,
  () => renderCountries(),
);

watch(
  () => visitedStore.displayPlaces,
  () => renderMarkers(),
  { deep: true },
);

watch(
  () => props.mode,
  (newMode) => {
    visitedStore.setMode(newMode);
    showForm.value = false;
    showEditPanel.value = false;
    selectedPlace.value = null;
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

  const qLat = parseFloat(currentRoute.query.lat as string);
  const qLng = parseFloat(currentRoute.query.lng as string);
  const qZoom = parseInt(currentRoute.query.zoom as string, 10);
  const initialCenter: L.LatLngExpression = (!isNaN(qLat) && !isNaN(qLng))
    ? [qLat, qLng]
    : [26.947978976023382, 10.994881808870337];
  const initialZoom = !isNaN(qZoom) ? qZoom : 2.5;

  mapInstance.value = L.map(mapContainer.value).setView(initialCenter, initialZoom);
  addMapTileLayer(mapInstance.value);
  markersLayer.value = L.layerGroup().addTo(mapInstance.value);

  renderCountries();

  mapInstance.value.on('click', (event: L.LeafletMouseEvent) => {
    formCoords.value = { lat: event.latlng.lat, lng: event.latlng.lng };
    showForm.value = true;
    showEditPanel.value = false;
    selectedPlace.value = null;
  });

  renderMarkers();
});

function openEditPanel(place: VisitedPlace) {
  editingPlace.value = place;
  editTitle.value = place.title;
  editNote.value = place.note || '';
  editMediaIds.value = [...(place.mediaIds || [])];
  editMediaList.value = [];
  showEditPanel.value = true;
  showForm.value = false;
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
      tab: 'marks',
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

onBeforeUnmount(() => {
  mapInstance.value?.remove();
  mapInstance.value = undefined;
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
        <h3>{{ selectedPlace.title }}</h3>
        <p v-if="selectedPlace.visitedDate" class="date">
          {{ new Date(selectedPlace.visitedDate).toLocaleDateString('ru-RU') }}
        </p>
        <p v-if="selectedPlace.note">{{ selectedPlace.note }}</p>
        <div class="panel-actions" v-if="isOwnPlace(selectedPlace)">
          <button type="button" class="btn-primary" @click="openEditPanel(selectedPlace)">Изменить</button>
          <button type="button" class="btn-danger" @click="deleteSelectedPlace">Удалить</button>
          <button type="button" class="btn-secondary" @click="createMarkFromSelectedPlace">
            Создать метку
          </button>
        </div>
      </div>

      <div v-if="showEditPanel" class="edit-panel">
        <div class="edit-panel-header">
          <h3>Редактировать</h3>
          <LikeButton
            v-if="editingPlace"
            target-type="VisitedPlace"
            :target-id="editingPlace._id"
            :likes="myLikes"
          />
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
            <button type="button" class="btn-secondary" @click="showEditPanel = false">Отмена</button>
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

.form-overlay {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 340px;
}

.selected-place-panel {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  @include card;
  width: 300px;

  h3 {
    margin-bottom: 0.25rem;
  }

  p {
    margin-bottom: 0.5rem;
    font-size: $font-size-sm;
    color: $gray-600;
  }
}

.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.edit-panel {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  @include card;
  width: 360px;
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
  gap: 0.5rem;
}

.btn-danger {
  @include button-base;
  background: $danger;
  color: white;
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
