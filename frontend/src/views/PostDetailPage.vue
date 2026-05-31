<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Post } from '@/types';
import { postsApi } from '@/services/postsApi';
import MediaGallery from '@/components/media/MediaGallery.vue';
import { getUserInitials } from '@/utils/user-initials';

const route = useRoute();

const post = ref<Post | null>(null);
const isLoading = ref(true);
const errorMessage = ref('');

const authorId = computed(() => {
  if (!post.value) return '';
  return typeof post.value.authorId === 'string'
    ? post.value.authorId
    : post.value.authorId._id;
});

const authorName = computed(() => {
  if (!post.value) return '';
  return typeof post.value.authorId === 'string'
    ? 'Путешественник'
    : post.value.authorId.name;
});

const authorAvatarUrl = computed(() => {
  if (!post.value || typeof post.value.authorId === 'string') {
    return undefined;
  }

  return post.value.authorId.avatarUrl;
});

const formattedDate = computed(() => {
  if (!post.value) return '';

  return new Date(post.value.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

const mapLink = computed(() => {
  if (!post.value?.location) return null;

  const { lat, lng } = post.value.location;
  return `/map?tab=all&lat=${lat}&lng=${lng}&zoom=12`;
});

onMounted(async () => {
  const id = route.params.id as string;
  isLoading.value = true;
  errorMessage.value = '';

  try {
    post.value = await postsApi.getById(id);
    if (!post.value) {
      errorMessage.value = 'Пост не найден';
    }
  } catch {
    errorMessage.value = 'Ошибка загрузки поста';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="post-detail-page container">
    <router-link to="/activity" class="back-link">&larr; Лента активности</router-link>

    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <article v-else-if="post" class="post-detail">
      <header class="post-header">
        <router-link :to="`/users/${authorId}`" class="author-link">
          <div class="author-avatar">
            <img
              v-if="authorAvatarUrl"
              :src="authorAvatarUrl"
              :alt="authorName"
            />
            <span v-else class="initials">{{ getUserInitials(authorName) }}</span>
          </div>
          <div class="author-meta">
            <span class="author-name">{{ authorName }}</span>
            <span class="post-date">{{ formattedDate }}</span>
          </div>
        </router-link>
      </header>

      <div class="post-body">
        <p class="post-text">{{ post.text }}</p>

        <MediaGallery
          v-if="post.mediaIds.length > 0"
          :media-ids="post.mediaIds"
          class="post-gallery"
        />

        <router-link
          v-if="mapLink"
          :to="mapLink"
          class="location-link"
        >
          Показать на карте
        </router-link>
      </div>
    </article>
  </div>
</template>

<style lang="scss" scoped>
.post-detail-page {
  padding: 1.5rem 1rem;
  max-width: 760px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: $gray-500;
  text-decoration: none;
  font-size: $font-size-sm;

  &:hover {
    color: $primary;
  }
}

.loading,
.error-message {
  text-align: center;
  padding: 3rem 1rem;
  color: $gray-500;
}

.error-message {
  color: $danger;
}

.post-detail {
  @include card;
}

.post-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid $gray-100;
}

.author-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.author-avatar {
  @include flex-center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: $primary-light;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .initials {
    color: white;
    font-weight: 600;
    font-size: $font-size-sm;
  }
}

.author-meta {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.author-name {
  font-weight: 600;
  color: $gray-800;
}

.post-date {
  font-size: $font-size-sm;
  color: $gray-400;
}

.post-text {
  margin: 0 0 1rem;
  color: $gray-800;
  font-size: $font-size-base;
  line-height: 1.6;
  white-space: pre-wrap;
}

.post-gallery {
  margin-bottom: 1rem;
}

.location-link {
  display: inline-flex;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $primary;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
