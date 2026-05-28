<script setup lang="ts">
import { ref } from 'vue';
import { useMapStore } from '@/stores/map';
import type { Coordinates, Media } from '@/types';
import MediaUploader from '@/components/media/MediaUploader.vue';
import MediaGallery from '@/components/media/MediaGallery.vue';

interface Props {
  coordinates: Coordinates;
  initialTitle?: string;
  initialDescription?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  added: [];
  cancel: [];
}>();

const mapStore = useMapStore();
const title = ref(props.initialTitle || '');
const description = ref(props.initialDescription || '');
const isLoading = ref(false);
const mediaIds = ref<string[]>([]);
const mediaList = ref<Media[]>([]);

function handleMediaUploaded(media: Media) {
  mediaIds.value.push(media._id);
  mediaList.value.push(media);
}

function handleMediaRemoved(id: string) {
  mediaIds.value = mediaIds.value.filter((mid) => mid !== id);
  mediaList.value = mediaList.value.filter((m) => m._id !== id);
}

async function handleSubmit() {
  isLoading.value = true;
  try {
    await mapStore.addMark({
      title: title.value,
      description: description.value,
      coordinates: props.coordinates,
      mediaIds: mediaIds.value.length > 0 ? mediaIds.value : undefined,
    });
    emit('added');
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="side-panel">
    <h3>Новая метка</h3>
    <p class="coords-info">
      {{ coordinates.lat.toFixed(4) }}, {{ coordinates.lng.toFixed(4) }}
    </p>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Название</label>
        <input v-model="title" class="input" placeholder="Название места" required />
      </div>
      <div class="form-group">
        <label>Описание</label>
        <textarea v-model="description" class="input" placeholder="Описание (необязательно)" rows="3" />
      </div>
      <div class="form-group">
        <label>Медиа</label>
        <MediaGallery
          v-if="mediaList.length > 0"
          :media-ids="mediaIds"
          :media-list="mediaList"
          :editable="true"
          @removed="handleMediaRemoved"
        />
        <MediaUploader @uploaded="handleMediaUploaded" />
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Создание...' : 'Создать' }}
        </button>
        <button type="button" class="btn-secondary" @click="emit('cancel')">Отмена</button>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.side-panel {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  @include card;
  width: 320px;

  h3 {
    margin-bottom: 0.25rem;
    font-size: $font-size-lg;
  }
}

.coords-info {
  font-size: $font-size-sm;
  color: $gray-400;
  margin-bottom: 1rem;
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
</style>
