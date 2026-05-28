<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMapStore } from '@/stores/map';
import { useRoutesStore } from '@/stores/routes';
import type { Coordinates, GeoMark, TravelRoute } from '@/types';

interface Props {
  route?: TravelRoute;
}

const props = defineProps<Props>();
const emit = defineEmits<{ created: []; updated: [] }>();

const router = useRouter();
const mapStore = useMapStore();
const routesStore = useRoutesStore();

const isEditMode = computed(() => !!props.route);

const name = ref('');
const description = ref('');
const selectedMarkIds = ref<string[]>([]);
const isPublic = ref(false);
const isLoading = ref(false);

const showQuickCreate = ref(false);
const quickTitle = ref('');
const quickDescription = ref('');
const quickCoords = ref<Coordinates>({ lat: 55.75, lng: 37.62 });
const isCreatingMark = ref(false);

watch(
  () => props.route,
  (route) => {
    if (route) {
      name.value = route.name;
      description.value = route.description || '';
      selectedMarkIds.value = [...(route.geoMarkIds || [])];
      isPublic.value = route.isPublic;
    } else {
      name.value = '';
      description.value = '';
      selectedMarkIds.value = [];
      isPublic.value = false;
    }
  },
  { immediate: true },
);

function toggleMark(mark: GeoMark) {
  const idx = selectedMarkIds.value.indexOf(mark._id);
  if (idx === -1) {
    selectedMarkIds.value.push(mark._id);
  } else {
    selectedMarkIds.value.splice(idx, 1);
  }
}

function moveUp(index: number) {
  if (index === 0) return;
  const temp = selectedMarkIds.value[index];
  selectedMarkIds.value[index] = selectedMarkIds.value[index - 1];
  selectedMarkIds.value[index - 1] = temp;
}

function moveDown(index: number) {
  if (index === selectedMarkIds.value.length - 1) return;
  const temp = selectedMarkIds.value[index];
  selectedMarkIds.value[index] = selectedMarkIds.value[index + 1];
  selectedMarkIds.value[index + 1] = temp;
}

function getMarkTitle(id: string): string {
  return mapStore.geoMarks.find((m) => m._id === id)?.title || 'Без названия';
}

function openQuickCreate() {
  showQuickCreate.value = true;
  quickTitle.value = '';
  quickDescription.value = '';
}

async function handleQuickCreate() {
  if (!quickTitle.value.trim()) return;
  isCreatingMark.value = true;
  try {
    const mark = await mapStore.addMark({
      title: quickTitle.value,
      description: quickDescription.value || undefined,
      coordinates: quickCoords.value,
    });
    selectedMarkIds.value.push(mark._id);
    showQuickCreate.value = false;
    quickTitle.value = '';
    quickDescription.value = '';
  } finally {
    isCreatingMark.value = false;
  }
}

function goToMapMarks() {
  router.push({ path: '/map', query: { tab: 'marks' } });
}

async function handleSubmit() {
  if (!name.value || selectedMarkIds.value.length === 0) return;
  isLoading.value = true;
  try {
    const payload = {
      name: name.value,
      description: description.value,
      geoMarkIds: selectedMarkIds.value,
      isPublic: isPublic.value,
    };

    if (isEditMode.value && props.route) {
      await routesStore.updateRoute(props.route._id, payload);
      emit('updated');
    } else {
      await routesStore.createRoute(payload);
      emit('created');
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="route-editor">
    <h3>{{ isEditMode ? 'Редактировать маршрут' : 'Новый маршрут' }}</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Название</label>
        <input v-model="name" class="input" placeholder="Название маршрута" required />
      </div>
      <div class="form-group">
        <label>Описание</label>
        <textarea v-model="description" class="input" rows="2" />
      </div>
      <div class="form-group">
        <label>
          <input v-model="isPublic" type="checkbox" />
          Публичный маршрут
        </label>
      </div>
      <div class="form-group">
        <div class="marks-header">
          <label>Выберите метки:</label>
          <div class="marks-actions">
            <button type="button" class="btn-link" @click="openQuickCreate">+ Быстро создать</button>
            <button type="button" class="btn-link" @click="goToMapMarks">На карте</button>
          </div>
        </div>
        <div v-if="mapStore.geoMarks.length === 0 && !showQuickCreate" class="empty-marks">
          <p>У вас пока нет меток</p>
          <button type="button" class="btn-secondary btn-sm" @click="openQuickCreate">Создать первую метку</button>
        </div>
        <div v-else class="marks-list">
          <div
            v-for="mark in mapStore.geoMarks"
            :key="mark._id"
            :class="['mark-item', { selected: selectedMarkIds.includes(mark._id) }]"
            @click="toggleMark(mark)"
          >
            {{ mark.title }}
          </div>
        </div>
      </div>
      <div v-if="showQuickCreate" class="quick-create">
        <h4>Новая метка</h4>
        <div class="form-group">
          <label>Название</label>
          <input v-model="quickTitle" class="input" placeholder="Название места" required />
        </div>
        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="quickDescription" class="input" rows="2" />
        </div>
        <div class="form-group coords-row">
          <div>
            <label>Широта</label>
            <input v-model.number="quickCoords.lat" type="number" step="any" class="input" />
          </div>
          <div>
            <label>Долгота</label>
            <input v-model.number="quickCoords.lng" type="number" step="any" class="input" />
          </div>
        </div>
        <div class="quick-actions">
          <button type="button" class="btn-primary btn-sm" :disabled="isCreatingMark" @click="handleQuickCreate">
            {{ isCreatingMark ? 'Создание...' : 'Создать и добавить' }}
          </button>
          <button type="button" class="btn-secondary btn-sm" @click="showQuickCreate = false">Отмена</button>
        </div>
      </div>
      <div v-if="selectedMarkIds.length > 0" class="form-group">
        <label>Порядок ({{ selectedMarkIds.length }} точек):</label>
        <div class="order-list">
          <div v-for="(id, index) in selectedMarkIds" :key="id" class="order-item">
            <span>{{ index + 1 }}. {{ getMarkTitle(id) }}</span>
            <div class="order-btns">
              <button type="button" @click="moveUp(index)" :disabled="index === 0">↑</button>
              <button type="button" @click="moveDown(index)" :disabled="index === selectedMarkIds.length - 1">↓</button>
            </div>
          </div>
        </div>
      </div>
      <button type="submit" class="btn-primary" :disabled="isLoading || selectedMarkIds.length === 0">
        {{ isLoading
          ? (isEditMode ? 'Сохранение...' : 'Создание...')
          : (isEditMode ? 'Сохранить' : 'Создать маршрут')
        }}
      </button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.route-editor {
  @include card;

  h3 {
    margin-bottom: 1rem;
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
}

.marks-header {
  @include flex-between;
  margin-bottom: 0.25rem;

  label {
    margin-bottom: 0;
  }
}

.marks-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-link {
  border: none;
  background: none;
  color: $primary;
  font-size: $font-size-sm;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: $primary-dark;
  }
}

.empty-marks {
  text-align: center;
  padding: 1.5rem;
  border: 1px dashed $gray-300;
  border-radius: $radius;

  p {
    margin: 0 0 0.75rem;
    font-size: $font-size-sm;
    color: $gray-500;
  }
}

.marks-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid $gray-200;
  border-radius: $radius;
}

.mark-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid $gray-100;
  font-size: $font-size-sm;

  &:hover {
    background: $gray-50;
  }

  &.selected {
    background: rgba($primary, 0.1);
    color: $primary;
    font-weight: 500;
  }
}

.quick-create {
  padding: 1rem;
  background: $gray-50;
  border-radius: $radius;
  margin-bottom: 1rem;

  h4 {
    margin: 0 0 0.75rem;
    font-size: $font-size-sm;
  }
}

.coords-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: $font-size-sm;
}

.order-list {
  border: 1px solid $gray-200;
  border-radius: $radius;
}

.order-item {
  @include flex-between;
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid $gray-100;
  font-size: $font-size-sm;

  &:last-child {
    border-bottom: none;
  }
}

.order-btns {
  display: flex;
  gap: 0.25rem;

  button {
    width: 24px;
    height: 24px;
    border: 1px solid $gray-300;
    border-radius: $radius-sm;
    background: white;
    cursor: pointer;
    font-size: 12px;

    &:disabled {
      opacity: 0.3;
    }
  }
}
</style>
