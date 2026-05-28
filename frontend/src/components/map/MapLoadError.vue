<script setup lang="ts">
interface Props {
  message: string;
}

defineProps<Props>();
</script>

<template>
  <div class="map-load-error">
    <p>{{ message }}</p>
  </div>
</template>

<style lang="scss" scoped>
.map-load-error {
  position: absolute;
  inset: 0;
  z-index: 2;
  @include flex-center;
  padding: 1.5rem;
  background: $gray-50;
  text-align: center;

  p {
    max-width: 420px;
    margin: 0;
    font-size: $font-size-sm;
    color: $gray-600;
    line-height: 1.5;
  }
}
</style>
