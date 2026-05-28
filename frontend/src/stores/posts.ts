import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Post } from '@/types';
import { postsApi } from '@/services/postsApi';

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<Post[]>([]);
  const isLoading = ref(false);

  async function fetchPosts(userId?: string) {
    isLoading.value = true;
    try {
      const response = await postsApi.getAll({ userId });
      posts.value = response.posts;
    } finally {
      isLoading.value = false;
    }
  }

  async function createPost(text: string) {
    const post = await postsApi.create({ text });
    posts.value.unshift(post);
    return post;
  }

  async function deletePost(id: string) {
    await postsApi.remove(id);
    posts.value = posts.value.filter((p) => p._id !== id);
  }

  return { posts, isLoading, fetchPosts, createPost, deletePost };
});
