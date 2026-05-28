<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const comingSoonShown = ref(false);
let comingSoonTimer: ReturnType<typeof setTimeout> | null = null;

const menuItems = [
  { label: 'Мой профиль', to: '/profile', icon: 'profile' },
  { label: 'Карта', to: '/map', icon: 'feed' },
  { label: 'Мои друзья', to: '/users?friends=1', icon: 'friends' },
  { label: 'Мои маршруты', to: '/routes', icon: 'routes' },
  { label: 'Настройки', to: '/settings', icon: 'settings' },
];

function handleSoonClick() {
  comingSoonShown.value = true;
  if (comingSoonTimer) clearTimeout(comingSoonTimer);
  comingSoonTimer = setTimeout(() => { comingSoonShown.value = false; }, 2000);
}
</script>

<template>
  <aside v-if="isAuthenticated" class="sidebar">
    <nav class="sidebar-nav" aria-label="Боковая навигация">
      <template v-for="item in menuItems" :key="item.label">
        <router-link
          v-if="item.to"
          :to="item.to"
          class="sidebar-link"
        >
        <span class="sidebar-icon">
          <svg v-if="item.icon === 'profile'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <svg v-else-if="item.icon === 'feed'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <svg v-else-if="item.icon === 'messages'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <svg v-else-if="item.icon === 'friends'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
          <svg v-else-if="item.icon === 'ads'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6v6H9z" />
          </svg>
          <svg v-else-if="item.icon === 'routes'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z" />
          </svg>
          <svg v-else-if="item.icon === 'favorites'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <svg v-else-if="item.icon === 'settings'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </span>
          {{ item.label }}
        </router-link>
        <button
          v-else
          class="sidebar-link soon"
          @click="handleSoonClick"
        >
          <span class="sidebar-icon">
            <svg v-if="item.icon === 'messages'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <svg v-else-if="item.icon === 'settings'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </span>
          {{ item.label }}
          <span class="soon-badge">скоро</span>
        </button>
      </template>
    </nav>
    <transition name="toast">
      <div v-if="comingSoonShown" class="coming-soon-toast">Функция в разработке</div>
    </transition>
  </aside>
</template>

<style lang="scss" scoped>
.sidebar {
  display: none;
  width: 220px;
  flex-shrink: 0;
  padding: 1.25rem 0;
  position: relative;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  border-radius: $radius-lg;
  color: $gray-700;
  font-size: $font-size-sm;
  font-weight: 500;
  text-decoration: none;
  transition: all $transition;

  &:hover {
    background: $gray-100;
    color: $gray-800;
  }

  &.router-link-active {
    color: $primary;
    background: $accent;
    font-weight: 600;
  }

  &.soon {
    opacity: 0.6;
    cursor: pointer;
  }
}

.sidebar-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: inherit;
}

.soon-badge {
  margin-left: auto;
  font-size: 0.625rem;
  background: $gray-100;
  color: $gray-400;
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.coming-soon-toast {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: $gray-800;
  color: white;
  font-size: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: $radius;
  white-space: nowrap;
  box-shadow: $shadow-md;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

@include mobile {
  .sidebar {
    display: block;
  }
}
</style>
