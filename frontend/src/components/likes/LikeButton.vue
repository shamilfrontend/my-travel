<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { likeApi } from '@/services/likeApi';
import type { Like } from '@/types';

interface Props {
  targetType: 'GeoMark' | 'VisitedPlace';
  targetId: string;
  likes?: Like[];
}

const props = defineProps<Props>();

const isLiked = ref(false);
const likeId = ref<string | null>(null);
const isLoading = ref(false);

onMounted(() => {
  if (props.likes) {
    const myLike = props.likes.find(
      (l) => l.targetType === props.targetType && l.targetId === props.targetId,
    );
    if (myLike) {
      isLiked.value = true;
      likeId.value = myLike._id;
    }
  }
});

async function toggle() {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    if (isLiked.value && likeId.value) {
      await likeApi.remove(likeId.value);
      isLiked.value = false;
      likeId.value = null;
    } else {
      const like = await likeApi.create(props.targetType, props.targetId);
      isLiked.value = true;
      likeId.value = like._id;
    }
  } catch {
    // 409 means already liked
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <button
    :class="['like-btn', { liked: isLiked }]"
    :disabled="isLoading"
    @click.stop="toggle"
    :title="isLiked ? 'Убрать лайк' : 'Поставить лайк'"
  >
    <span class="like-icon">{{ isLiked ? '&#9829;' : '&#9825;' }}</span>
  </button>
</template>

<style lang="scss" scoped>
.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: 1px solid $gray-300;
  border-radius: $radius;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: $font-size-base;
  color: $gray-500;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: $danger;
    color: $danger;
  }

  &.liked {
    border-color: $danger;
    color: $danger;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.like-icon {
  font-size: 1.1rem;
  line-height: 1;
}
</style>
