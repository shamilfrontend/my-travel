<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Media } from '@/types';
import { mediaApi } from '@/services/mediaApi';
import { USE_MOCKS } from '@/config/useMocks';
import { mockMedia } from '@/mocks';
import MediaItem from './MediaItem.vue';

interface Props {
  mediaIds: string[];
  mediaList?: Media[];
  editable?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  removed: [id: string];
}>();

const lightboxMedia = ref<Media | null>(null);
const loadedMedia = ref<Media[]>([]);

const displayMedia = computed<Media[]>(() => {
  if (props.mediaList && props.mediaList.length > 0) {
    return props.mediaList;
  }
  return loadedMedia.value;
});

watch(
  () => props.mediaIds,
  async (ids) => {
    if (props.mediaList && props.mediaList.length > 0) return;
    if (!ids || ids.length === 0) {
      loadedMedia.value = [];
      return;
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        const cached = loadedMedia.value.find((item) => item._id === id);
        if (cached) return cached;

        if (USE_MOCKS) {
          return mockMedia.find((item) => item._id === id) ?? null;
        }

        return mediaApi.getById(id);
      }),
    );

    loadedMedia.value = results.filter((item): item is Media => item !== null);
  },
  { immediate: true },
);

function openLightbox(media: Media) {
  lightboxMedia.value = media;
}

function closeLightbox() {
  lightboxMedia.value = null;
}

async function handleRemove(id: string) {
  if (!confirm('Удалить медиа-файл?')) return;
  try {
    await mediaApi.remove(id);
    emit('removed', id);
  } catch {
    alert('Не удалось удалить файл');
  }
}
</script>

<template>
  <div class="media-gallery" v-if="displayMedia.length > 0">
    <div class="gallery-grid">
      <MediaItem
        v-for="media in displayMedia"
        :key="media._id"
        :media="media"
        :editable="editable"
        @click="openLightbox(media)"
        @remove="handleRemove(media._id)"
      />
    </div>

    <div v-if="lightboxMedia" class="lightbox" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="closeLightbox">&times;</button>
        <img
          v-if="lightboxMedia.type === 'image'"
          :src="mediaApi.getFileUrl(lightboxMedia._id)"
          :alt="lightboxMedia.originalName"
        />
        <video
          v-else
          :src="mediaApi.getFileUrl(lightboxMedia._id)"
          controls
          autoplay
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;

  img,
  video {
    max-width: 100%;
    max-height: 85vh;
    border-radius: $radius;
  }
}

.lightbox-close {
  position: absolute;
  top: -2rem;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}
</style>
