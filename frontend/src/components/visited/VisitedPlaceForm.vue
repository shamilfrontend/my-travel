<script setup lang="ts">
import { ref } from 'vue';
import { useVisitedStore } from '@/stores/visited';
import type { Coordinates, Media } from '@/types';
import MediaUploader from '@/components/media/MediaUploader.vue';
import MediaGallery from '@/components/media/MediaGallery.vue';

interface Props {
  coordinates: Coordinates;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  added: [];
  cancel: [];
}>();

const visitedStore = useVisitedStore();
const title = ref('');
const visitedDate = ref('');
const note = ref('');
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
    await visitedStore.addPlace({
      title: title.value,
      coordinates: props.coordinates,
      visitedDate: visitedDate.value || undefined,
      note: note.value || undefined,
      mediaIds: mediaIds.value.length > 0 ? mediaIds.value : undefined,
    });
    emit('added');
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="visited-form">
    <h3>Я здесь был!</h3>
    <p class="coords-info">{{ coordinates.lat.toFixed(4) }}, {{ coordinates.lng.toFixed(4) }}</p>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Название</label>
        <input v-model="title" class="input" placeholder="Название места" required />
      </div>
      <div class="form-group">
        <label>Дата посещения</label>
        <input v-model="visitedDate" type="date" class="input" />
      </div>
      <div class="form-group">
        <label>Заметка</label>
        <textarea v-model="note" class="input" rows="3" maxlength="500" placeholder="Впечатления..." />
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
          {{ isLoading ? 'Сохранение...' : 'Сохранить' }}
        </button>
        <button type="button" class="btn-secondary" @click="emit('cancel')">Отмена</button>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.visited-form {
  @include card;

  h3 {
    margin-bottom: 0.25rem;
    color: $secondary;
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
