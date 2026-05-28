import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { WishlistPlace, Coordinates } from '@/types';
import { wishlistApi } from '@/services/wishlistApi';

export const useWishlistStore = defineStore('wishlist', () => {
  const places = ref<WishlistPlace[]>([]);
  const isLoading = ref(false);

  async function fetchPlaces() {
    isLoading.value = true;
    try {
      places.value = await wishlistApi.getAll();
    } finally {
      isLoading.value = false;
    }
  }

  async function addPlace(payload: { title: string; coordinates: Coordinates; note?: string }) {
    const place = await wishlistApi.create(payload);
    places.value.unshift(place);
    return place;
  }

  async function removePlace(id: string) {
    await wishlistApi.remove(id);
    places.value = places.value.filter((p) => p._id !== id);
  }

  return { places, isLoading, fetchPlaces, addPlace, removePlace };
});
