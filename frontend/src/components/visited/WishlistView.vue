<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useWishlistStore } from '@/stores/wishlist';
import type { Coordinates } from '@/types';

const wishlistStore = useWishlistStore();

const showForm = ref(false);
const formTitle = ref('');
const formNote = ref('');
const formCoords = ref<Coordinates>({ lat: 55.75, lng: 37.62 });
const isSaving = ref(false);

async function handleAdd() {
  if (!formTitle.value.trim()) return;
  isSaving.value = true;
  try {
    await wishlistStore.addPlace({
      title: formTitle.value,
      coordinates: formCoords.value,
      note: formNote.value || undefined,
    });
    showForm.value = false;
    formTitle.value = '';
    formNote.value = '';
  } finally {
    isSaving.value = false;
  }
}

async function handleRemove(id: string) {
  await wishlistStore.removePlace(id);
}

onMounted(() => {
  wishlistStore.fetchPlaces();
});
</script>

<template>
  <div class="wishlist-view">
    <div class="wishlist-header">
      <h2>Хочу посетить</h2>
      <button class="btn-primary btn-sm" @click="showForm = !showForm">Добавить</button>
    </div>

    <div v-if="showForm" class="add-form">
      <div class="form-group">
        <label>Название</label>
        <input v-model="formTitle" class="input" placeholder="Куда хотите поехать?" />
      </div>
      <div class="form-group coords-row">
        <div>
          <label>Широта</label>
          <input v-model.number="formCoords.lat" type="number" step="any" class="input" />
        </div>
        <div>
          <label>Долгота</label>
          <input v-model.number="formCoords.lng" type="number" step="any" class="input" />
        </div>
      </div>
      <div class="form-group">
        <label>Заметка</label>
        <textarea v-model="formNote" class="input" rows="2" />
      </div>
      <button class="btn-primary btn-sm" :disabled="isSaving" @click="handleAdd">
        {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
      </button>
    </div>

    <div v-if="wishlistStore.isLoading" class="empty">Загрузка...</div>
    <div v-else-if="wishlistStore.places.length === 0" class="empty">
      Список «Хочу» пуст
    </div>
    <div v-else class="places-list">
      <div v-for="place in wishlistStore.places" :key="place._id" class="place-item">
        <div>
          <h4>{{ place.title }}</h4>
          <p v-if="place.note" class="note">{{ place.note }}</p>
          <span class="coords">{{ place.coordinates.lat.toFixed(4) }}, {{ place.coordinates.lng.toFixed(4) }}</span>
        </div>
        <button class="btn-danger btn-sm" @click="handleRemove(place._id)">Удалить</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wishlist-view {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.wishlist-header {
  @include flex-between;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
    font-size: $font-size-xl;
  }
}

.add-form {
  @include card;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
}

.coords-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.places-list {
  display: grid;
  gap: 1rem;
}

.place-item {
  @include card;
  @include flex-between;
  padding: 1rem;
  gap: 1rem;

  h4 {
    margin: 0 0 0.25rem;
  }
}

.note {
  font-size: $font-size-sm;
  color: $gray-600;
  margin: 0 0 0.25rem;
}

.coords {
  font-size: 0.75rem;
  color: $gray-400;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: $font-size-sm;
}

.btn-danger {
  @include button-base;
  background: $danger;
  color: white;
  flex-shrink: 0;
}

.empty {
  text-align: center;
  color: $gray-400;
  padding: 2rem;
}
</style>
