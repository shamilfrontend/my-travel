<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/utils/leaflet-icons';
import { useMapStore } from '@/stores/map';
import type { Coordinates, GeoMark } from '@/types';
import AddMarkForm from '@/components/map/AddMarkForm.vue';
import LikeButton from '@/components/likes/LikeButton.vue';
import { addMapTileLayer } from '@/config/map-tiles';

const currentRoute = useRoute();
const mapStore = useMapStore();

const mapContainer = ref<HTMLDivElement>();
const mapInstance = ref<L.Map>();
const markersLayer = ref<L.LayerGroup>();

const showForm = ref(false);
const formCoords = ref<Coordinates>({ lat: 0, lng: 0 });
const initialTitle = ref('');
const initialDescription = ref('');

const selectedMark = ref<GeoMark | null>(null);
const showDetailPanel = ref(false);

const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function renderMarkers() {
  if (!markersLayer.value) return;
  markersLayer.value.clearLayers();

  mapStore.geoMarks.forEach((mark) => {
    const marker = L.marker([mark.coordinates.lat, mark.coordinates.lng], { icon: blueIcon });
    marker.on('click', () => {
      selectedMark.value = mark;
      showDetailPanel.value = true;
      showForm.value = false;
    });
    markersLayer.value!.addLayer(marker);
  });
}

function openAddForm(coords: Coordinates, title = '', description = '') {
  formCoords.value = coords;
  initialTitle.value = title;
  initialDescription.value = description;
  showForm.value = true;
  showDetailPanel.value = false;
  selectedMark.value = null;
}

function handleFormAdded() {
  showForm.value = false;
  initialTitle.value = '';
  initialDescription.value = '';
  renderMarkers();
}

function handleFormCancel() {
  showForm.value = false;
  initialTitle.value = '';
  initialDescription.value = '';
}

async function handleDeleteMark() {
  if (!selectedMark.value) return;
  if (!confirm('Удалить метку?')) return;
  await mapStore.deleteMark(selectedMark.value._id);
  showDetailPanel.value = false;
  selectedMark.value = null;
  renderMarkers();
}

onMounted(async () => {
  await mapStore.fetchGeoMarks();

  if (!mapContainer.value) return;

  const qLat = parseFloat(currentRoute.query.lat as string);
  const qLng = parseFloat(currentRoute.query.lng as string);
  const qZoom = parseInt(currentRoute.query.zoom as string, 10);
  const initialCenter: L.LatLngExpression = (!isNaN(qLat) && !isNaN(qLng))
    ? [qLat, qLng]
    : [55.75, 37.62];
  const initialZoom = !isNaN(qZoom) ? qZoom : 5;

  mapInstance.value = L.map(mapContainer.value).setView(initialCenter, initialZoom);
  addMapTileLayer(mapInstance.value);
  markersLayer.value = L.layerGroup().addTo(mapInstance.value);

  mapInstance.value.on('click', (event: L.LeafletMouseEvent) => {
    openAddForm({ lat: event.latlng.lat, lng: event.latlng.lng });
  });

  renderMarkers();

  const qTitle = currentRoute.query.title as string;
  const qDescription = currentRoute.query.description as string;
  if (qTitle && !isNaN(qLat) && !isNaN(qLng)) {
    openAddForm({ lat: qLat, lng: qLng }, qTitle, qDescription || '');
  }
});

onBeforeUnmount(() => {
  mapInstance.value?.remove();
  mapInstance.value = undefined;
});

watch(
  () => mapStore.geoMarks,
  () => renderMarkers(),
  { deep: true },
);

defineExpose({ openAddForm });
</script>

<template>
  <div class="geo-marks-map">
    <div class="hint-bar">
      Нажмите на карту, чтобы добавить метку
    </div>

    <AddMarkForm
      v-if="showForm"
      :coordinates="formCoords"
      :initial-title="initialTitle"
      :initial-description="initialDescription"
      @added="handleFormAdded"
      @cancel="handleFormCancel"
    />

    <div v-if="showDetailPanel && selectedMark" class="detail-panel">
      <h3>{{ selectedMark.title }}</h3>
      <p v-if="selectedMark.description" class="description">{{ selectedMark.description }}</p>
      <p class="coords">
        {{ selectedMark.coordinates.lat.toFixed(4) }}, {{ selectedMark.coordinates.lng.toFixed(4) }}
      </p>
      <div class="detail-actions">
        <LikeButton target-type="GeoMark" :target-id="selectedMark._id" />
        <button type="button" class="btn-danger btn-sm" @click="handleDeleteMark">Удалить</button>
        <button type="button" class="btn-secondary btn-sm" @click="showDetailPanel = false">Закрыть</button>
      </div>
    </div>

    <div ref="mapContainer" class="map-container" />
  </div>
</template>

<style lang="scss" scoped>
.geo-marks-map {
  flex: 1;
  display: flex;
  position: relative;
}

.map-container {
  flex: 1;
  z-index: 1;
}

.hint-bar {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  font-size: $font-size-sm;
  color: $gray-600;
}

.detail-panel {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  @include card;
  width: 300px;

  h3 {
    margin-bottom: 0.5rem;
    font-size: $font-size-lg;
  }
}

.description {
  font-size: $font-size-sm;
  color: $gray-600;
  margin-bottom: 0.5rem;
}

.coords {
  font-size: $font-size-sm;
  color: $gray-400;
  margin-bottom: 1rem;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.btn-danger {
  @include button-base;
  background: $danger;
  color: white;
  padding: 0.375rem 0.75rem;
  font-size: $font-size-sm;

  &:hover {
    opacity: 0.9;
  }
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: $font-size-sm;
}
</style>
