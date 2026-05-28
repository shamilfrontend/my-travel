<script setup lang="ts">
import type { Media } from '@/types';
import { mediaApi } from '@/services/mediaApi';

interface Props {
  media: Media;
  editable?: boolean;
}

defineProps<Props>();
const emit = defineEmits<{
  click: [];
  remove: [];
}>();
</script>

<template>
  <div class="media-item" @click="emit('click')">
    <img :src="mediaApi.getThumbnailUrl(media)" :alt="media.originalName" class="thumbnail" />
    <div v-if="media.type === 'video'" class="video-badge">&#9654;</div>
    <button v-if="editable" class="remove-btn" @click.stop="emit('remove')">&times;</button>
  </div>
</template>

<style lang="scss" scoped>
.media-item {
  position: relative;
  border-radius: $radius;
  overflow: hidden;
  aspect-ratio: 1;
  cursor: pointer;

  &:hover .remove-btn {
    opacity: 1;
  }
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-badge {
  position: absolute;
  bottom: 0.25rem;
  right: 0.25rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.remove-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 22px;
  height: 22px;
  background: rgba($danger, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
</style>
