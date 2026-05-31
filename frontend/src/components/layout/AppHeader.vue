<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { getUserInitials } from '@/utils/user-initials';

const router = useRouter();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const avatarUrl = computed(() => authStore.user?.avatarUrl || null);
const userInitials = computed(() => getUserInitials(authStore.user?.name || ''));
const isMenuOpen = ref(false);
const isMobileNavOpen = ref(false);

const avatarWrapperRef = ref<HTMLDivElement>();
const notificationsRef = ref<HTMLDivElement>();

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function handleClickOutside(e: MouseEvent) {
  if (avatarWrapperRef.value && !avatarWrapperRef.value.contains(e.target as Node)) {
    isMenuOpen.value = false;
  }
  if (notificationsRef.value && !notificationsRef.value.contains(e.target as Node)) {
    notificationsStore.close();
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    isMenuOpen.value = false;
    isMobileNavOpen.value = false;
    notificationsStore.close();
  }
}

function notificationText(type: string): string {
  const map: Record<string, string> = {
    like: 'понравился ваш контент',
  };
  return map[type] || 'новое уведомление';
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'только что';
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ч назад`;
  return date.toLocaleDateString('ru-RU');
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
  if (authStore.isAuthenticated) {
    notificationsStore.fetchNotifications();
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});

async function handleLogout() {
  isMenuOpen.value = false;
  isMobileNavOpen.value = false;
  await authStore.logout();
  router.push('/login');
}

function closeMobileNav() {
  isMobileNavOpen.value = false;
}
</script>

<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <button
          v-if="isAuthenticated"
          class="hamburger-btn"
          aria-label="Открыть меню"
          @click="isMobileNavOpen = !isMobileNavOpen"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <router-link to="/" class="logo">
          <span class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="currentColor" />
              <text x="14" y="19" text-anchor="middle" fill="white" font-size="14" font-weight="700">П</text>
            </svg>
          </span>
          <span class="logo-text">PPR Travel</span>
        </router-link>
        <nav v-if="isAuthenticated" class="nav" aria-label="Основная навигация">
          <router-link to="/activity" class="nav-link">Лента активности</router-link>
          <router-link to="/map" class="nav-link">Карта</router-link>
          <router-link to="/routes" class="nav-link">Маршруты</router-link>
          <router-link to="/users" class="nav-link">Пользователи</router-link>
        </nav>
      </div>

      <div v-if="isAuthenticated" class="header-right">
        <router-link to="/routes?new=1" class="btn-create">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span class="btn-create-text">Создать</span>
        </router-link>

        <div ref="notificationsRef" class="notifications-wrapper">
          <button
            class="icon-btn"
            title="Уведомления"
            aria-label="Уведомления"
            @click="notificationsStore.toggleOpen()"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span v-if="notificationsStore.unreadCount > 0" class="badge">
              {{ notificationsStore.unreadCount > 9 ? '9+' : notificationsStore.unreadCount }}
            </span>
          </button>
          <transition name="dropdown">
            <div v-if="notificationsStore.isOpen" class="notifications-dropdown">
              <div class="notifications-header">
                <span>Уведомления</span>
                <button
                  v-if="notificationsStore.unreadCount > 0"
                  class="mark-all-btn"
                  @click="notificationsStore.markAllRead()"
                >
                  Прочитать все
                </button>
              </div>
              <div v-if="notificationsStore.isLoading" class="notifications-empty">Загрузка...</div>
              <div v-else-if="notificationsStore.items.length === 0" class="notifications-empty">
                Нет уведомлений
              </div>
              <div v-else class="notifications-list">
                <button
                  v-for="item in notificationsStore.items"
                  :key="item._id"
                  :class="['notification-item', { unread: !item.isRead }]"
                  @click="notificationsStore.markRead(item._id)"
                >
                  <span class="notification-text">
                    <strong>{{ item.actorId.name }}</strong>
                    {{ notificationText(item.type) }}
                  </span>
                  <span class="notification-time">{{ formatTime(item.createdAt) }}</span>
                </button>
              </div>
            </div>
          </transition>
        </div>

        <div ref="avatarWrapperRef" class="avatar-menu-wrapper">
          <button class="avatar-link" aria-label="Меню пользователя" :aria-expanded="isMenuOpen" @click="toggleMenu">
            <img v-if="avatarUrl" :src="avatarUrl" alt="Аватар" class="header-avatar" />
            <span v-else class="header-avatar-placeholder">{{ userInitials }}</span>
          </button>
          <transition name="dropdown">
            <div v-if="isMenuOpen" class="avatar-dropdown">
              <router-link to="/profile" class="dropdown-item" @click="isMenuOpen = false">Профиль</router-link>
              <router-link to="/settings" class="dropdown-item" @click="isMenuOpen = false">Настройки</router-link>
              <button class="dropdown-item" @click="handleLogout">Выйти</button>
            </div>
          </transition>
        </div>
      </div>

      <div v-else class="auth-links">
        <router-link to="/login" class="nav-link">Войти</router-link>
        <router-link to="/register" class="btn-create">Регистрация</router-link>
      </div>
    </div>
  </header>

  <!-- Mobile Nav Overlay -->
  <transition name="mobile-nav">
    <div v-if="isMobileNavOpen && isAuthenticated" class="mobile-nav-overlay" @click.self="closeMobileNav">
      <nav class="mobile-nav" aria-label="Мобильная навигация">
        <div class="mobile-nav-header">
          <span class="logo-text">PPR Travel</span>
          <button class="close-nav-btn" aria-label="Закрыть меню" @click="closeMobileNav">&times;</button>
        </div>
        <router-link to="/profile" class="mobile-nav-link" @click="closeMobileNav">Мой профиль</router-link>
        <router-link to="/activity" class="mobile-nav-link" @click="closeMobileNav">Лента активности</router-link>
        <router-link to="/map" class="mobile-nav-link" @click="closeMobileNav">Карта</router-link>
        <router-link to="/routes" class="mobile-nav-link" @click="closeMobileNav">Маршруты</router-link>
        <router-link to="/users" class="mobile-nav-link" @click="closeMobileNav">Пользователи</router-link>
        <router-link to="/events" class="mobile-nav-link" @click="closeMobileNav">События</router-link>
        <router-link to="/settings" class="mobile-nav-link" @click="closeMobileNav">Настройки</router-link>
        <hr class="mobile-nav-divider" />
        <button class="mobile-nav-link logout" @click="handleLogout">Выйти</button>
      </nav>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.header {
  background: #fff;
  border-bottom: 1px solid $gray-200;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  @include flex-between;

  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.hamburger-btn {
  @include flex-center;
  display: none;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: $gray-600;
  cursor: pointer;
  border-radius: $radius;

  &:hover {
    background: $gray-100;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: $primary;
  text-decoration: none;

  &:hover {
    color: $primary-dark;
  }
}

.logo-icon {
  display: flex;
  color: $primary;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.nav {
  display: flex;
  gap: 0.25rem;
}

.nav-link {
  color: $gray-600;
  font-weight: 500;
  font-size: $font-size-sm;
  padding: 0.5rem 0.75rem;
  border-radius: $radius;
  transition: all $transition;
  text-decoration: none;

  &:hover {
    color: $gray-800;
    background: $gray-50;
  }

  &.router-link-active {
    color: $primary;
    background: $accent;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-create {
  @include button-base;
  background: $primary;
  color: white;
  padding: 0.5rem 1rem;
  font-size: $font-size-sm;
  border-radius: $radius-lg;
  text-decoration: none;

  &:hover {
    background: $primary-dark;
  }
}

.icon-btn {
  @include flex-center;
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: $gray-500;
  cursor: pointer;
  transition: all $transition;

  &:hover {
    background: $gray-100;
    color: $gray-700;
  }
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: $danger;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 8px;
  line-height: 16px;
  text-align: center;
}

.notifications-wrapper {
  position: relative;
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 320px;
  max-height: 400px;
  background: white;
  border-radius: $radius;
  box-shadow: $shadow-lg;
  z-index: 100;
  overflow: hidden;
}

.notifications-header {
  @include flex-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid $gray-100;
  font-size: $font-size-sm;
  font-weight: 600;
}

.mark-all-btn {
  border: none;
  background: none;
  color: $primary;
  font-size: 0.75rem;
  cursor: pointer;
}

.notifications-list {
  max-height: 340px;
  overflow-y: auto;
}

.notification-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 1px solid $gray-50;

  &:hover {
    background: $gray-50;
  }

  &.unread {
    background: rgba($primary, 0.04);
  }
}

.notification-text {
  display: block;
  font-size: $font-size-sm;
  color: $gray-700;
  margin-bottom: 0.25rem;
}

.notification-time {
  font-size: 0.6875rem;
  color: $gray-400;
}

.notifications-empty {
  padding: 1.5rem;
  text-align: center;
  font-size: $font-size-sm;
  color: $gray-400;
}

.avatar-menu-wrapper {
  position: relative;
  margin-left: 0.25rem;
}

.avatar-link {
  display: flex;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
}

.avatar-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: $radius;
  box-shadow: $shadow-lg;
  min-width: 140px;
  padding: 0.375rem 0;
  z-index: 100;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: $font-size-sm;
  color: $gray-700;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background: $gray-50;
    color: $gray-800;
  }
}

.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid $gray-200;
}

.header-avatar-placeholder {
  @include flex-center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: $primary;
  color: white;
  font-weight: 700;
  font-size: $font-size-sm;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

// Mobile Nav
.mobile-nav-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
}

.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background: white;
  box-shadow: $shadow-lg;
  padding: 1rem 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.mobile-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.25rem 1rem;
  border-bottom: 1px solid $gray-100;
  margin-bottom: 0.5rem;

  .logo-text {
    color: $primary;
  }
}

.close-nav-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: $gray-500;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.mobile-nav-link {
  display: block;
  padding: 0.75rem 1.25rem;
  color: $gray-700;
  font-size: $font-size-sm;
  font-weight: 500;
  text-decoration: none;
  transition: background $transition;
  border: none;
  background: none;
  text-align: left;
  width: 100%;
  cursor: pointer;

  &:hover {
    background: $gray-50;
  }

  &.router-link-active {
    color: $primary;
    background: $accent;
  }

  &.logout {
    color: $danger;
  }
}

.mobile-nav-divider {
  border: none;
  border-top: 1px solid $gray-100;
  margin: 0.5rem 0;
}

.mobile-nav-enter-active {
  transition: opacity 0.2s ease;

  .mobile-nav {
    transition: transform 0.25s ease;
  }
}

.mobile-nav-leave-active {
  transition: opacity 0.2s ease;

  .mobile-nav {
    transition: transform 0.2s ease;
  }
}

.mobile-nav-enter-from {
  opacity: 0;

  .mobile-nav {
    transform: translateX(-100%);
  }
}

.mobile-nav-leave-to {
  opacity: 0;

  .mobile-nav {
    transform: translateX(-100%);
  }
}

@include mobile {
  .nav {
    display: none;
  }

  .hamburger-btn {
    display: flex;
  }

  .btn-create-text {
    display: none;
  }

  .logo-text {
    display: none;
  }
}
</style>
