import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ActivityItem, RecommendedTag } from '@/types';
import { activityApi } from '@/services/activityApi';

export const useActivityStore = defineStore('activity', () => {
  const items = ref<ActivityItem[]>([]);
  const tags = ref<RecommendedTag[]>([]);
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const total = ref(0);
  const search = ref('');
  const activeTab = ref('all');

  const hasMore = computed(() => currentPage.value < totalPages.value);
  const hasActiveFilters = computed(() => {
    return (
      activeTab.value !== 'all' ||
      search.value.trim().length > 0
    );
  });

  async function fetchFeed(reset = true) {
    if (reset) {
      isLoading.value = true;
      currentPage.value = 1;
    } else {
      isLoadingMore.value = true;
    }

    try {
      const response = await activityApi.getFeed({
        page: currentPage.value,
        limit: 20,
        type: activeTab.value !== 'all' ? activeTab.value : undefined,
        search: search.value || undefined,
      });

      if (reset) {
        items.value = response.items;
      } else {
        items.value.push(...response.items);
      }

      total.value = response.total;
      totalPages.value = response.totalPages;
    } finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }

  async function loadMore() {
    if (!hasMore.value || isLoadingMore.value) return;
    currentPage.value++;
    await fetchFeed(false);
  }

  async function fetchTags() {
    try {
      tags.value = await activityApi.getRecommendedTags();
    } catch {
      tags.value = [];
    }
  }

  function setSearch(value: string) {
    search.value = value;
    fetchFeed();
  }

  function setTab(tab: string) {
    activeTab.value = tab;
    fetchFeed();
  }

  function resetFilters() {
    search.value = '';
    activeTab.value = 'all';
    fetchFeed();
  }

  return {
    items,
    tags,
    isLoading,
    isLoadingMore,
    currentPage,
    totalPages,
    total,
    search,
    activeTab,
    hasMore,
    hasActiveFilters,
    fetchFeed,
    loadMore,
    fetchTags,
    setSearch,
    setTab,
    resetFilters,
  };
});
