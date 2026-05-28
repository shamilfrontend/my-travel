<script setup lang="ts">
import type { TravelRoute } from '@/types';
import RouteCard from './RouteCard.vue';

interface Props {
  routes: TravelRoute[];
  showActions?: boolean;
  showCopy?: boolean;
}

defineProps<Props>();
const emit = defineEmits<{ edit: [route: TravelRoute] }>();
</script>

<template>
  <div class="route-list">
    <div v-if="routes.length === 0" class="empty">
      Маршрутов пока нет
    </div>
    <RouteCard
      v-for="route in routes"
      :key="route._id"
      :route="route"
      :show-actions="showActions"
      :show-copy="showCopy"
      @edit="emit('edit', $event)"
    />
  </div>
</template>

<style lang="scss" scoped>
.route-list {
  display: grid;
  gap: 1rem;
}

.empty {
  text-align: center;
  color: $gray-400;
  padding: 3rem;
}
</style>
