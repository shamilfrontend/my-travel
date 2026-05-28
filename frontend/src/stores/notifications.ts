import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AppNotification } from '@/types';
import { notificationsApi } from '@/services/notificationsApi';

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([]);
  const unreadCount = ref(0);
  const isOpen = ref(false);
  const isLoading = ref(false);

  async function fetchNotifications() {
    isLoading.value = true;
    try {
      const [notifications, count] = await Promise.all([
        notificationsApi.getAll(),
        notificationsApi.getUnreadCount(),
      ]);
      items.value = notifications;
      unreadCount.value = count;
    } finally {
      isLoading.value = false;
    }
  }

  async function markRead(id: string) {
    await notificationsApi.markRead(id);
    const item = items.value.find((n) => n._id === id);
    if (item && !item.isRead) {
      item.isRead = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
  }

  async function markAllRead() {
    await notificationsApi.markAllRead();
    items.value.forEach((n) => { n.isRead = true; });
    unreadCount.value = 0;
  }

  function toggleOpen() {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
      fetchNotifications();
    }
  }

  function close() {
    isOpen.value = false;
  }

  return {
    items,
    unreadCount,
    isOpen,
    isLoading,
    fetchNotifications,
    markRead,
    markAllRead,
    toggleOpen,
    close,
  };
});
