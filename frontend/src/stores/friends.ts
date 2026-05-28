import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserWithStats, Friendship } from '@/types';
import { friendsApi } from '@/services/friendsApi';

export const useFriendsStore = defineStore('friends', () => {
  const friends = ref<UserWithStats[]>([]);
  const pending = ref<Friendship[]>([]);
  const isLoading = ref(false);

  async function fetchFriends() {
    isLoading.value = true;
    try {
      friends.value = await friendsApi.getFriends();
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPending() {
    pending.value = await friendsApi.getPending();
  }

  async function sendRequest(recipientId: string) {
    await friendsApi.sendRequest(recipientId);
  }

  async function acceptRequest(id: string) {
    await friendsApi.accept(id);
    await Promise.all([fetchFriends(), fetchPending()]);
  }

  async function declineRequest(id: string) {
    await friendsApi.decline(id);
    await fetchPending();
  }

  async function removeFriend(userId: string) {
    await friendsApi.remove(userId);
    await fetchFriends();
  }

  return {
    friends,
    pending,
    isLoading,
    fetchFriends,
    fetchPending,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  };
});
