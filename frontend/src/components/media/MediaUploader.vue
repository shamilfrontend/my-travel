<script setup lang="ts">
import { ref } from 'vue';
import { mediaApi } from '@/services/mediaApi';
import type { Media } from '@/types';

const emit = defineEmits<{
  uploaded: [media: Media];
}>();

const isDragging = ref(false);
const isUploading = ref(false);
const error = ref('');

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

async function handleDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files?.length) {
    await uploadFile(files[0]);
  }
}

async function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files?.length) {
    await uploadFile(input.files[0]);
    input.value = '';
  }
}

async function uploadFile(file: File) {
  if (file.size > 20 * 1024 * 1024) {
    error.value = 'Файл слишком большой (макс. 20 МБ)';
    return;
  }

  error.value = '';
  isUploading.value = true;
  try {
    const media = await mediaApi.upload(file);
    emit('uploaded', media);
  } catch {
    error.value = 'Ошибка загрузки файла';
  } finally {
    isUploading.value = false;
  }
}
</script>

<template>
  <div
    :class="['uploader', { dragging: isDragging }]"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div v-if="isUploading" class="uploading">Загрузка...</div>
    <div v-else class="upload-content">
      <p>Перетащите файл сюда или</p>
      <label class="btn-secondary upload-btn">
        Выберите файл
        <input type="file" accept="image/*,video/mp4,video/webm" hidden @change="handleFileSelect" />
      </label>
      <p class="hint">JPG, PNG, WebP, MP4, WebM (макс. 20 МБ)</p>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style lang="scss" scoped>
.uploader {
  border: 2px dashed $gray-300;
  border-radius: $radius-lg;
  padding: 2rem;
  text-align: center;
  transition: all $transition;
  cursor: pointer;

  &.dragging {
    border-color: $primary;
    background: rgba($primary, 0.05);
  }
}

.upload-content p {
  color: $gray-500;
  margin-bottom: 0.5rem;
}

.upload-btn {
  cursor: pointer;
}

.hint {
  font-size: 0.75rem;
  color: $gray-400;
  margin-top: 0.5rem;
}

.uploading {
  color: $primary;
  font-weight: 500;
}

.error {
  color: $danger;
  font-size: $font-size-sm;
  margin-top: 0.5rem;
}
</style>
