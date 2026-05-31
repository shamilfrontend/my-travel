<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useVisitedStore } from '@/stores/visited';
import { useRoutesStore } from '@/stores/routes';
import { usePostsStore } from '@/stores/posts';
import { usersApi } from '@/services/usersApi';
import ProfileSidebar from '@/components/profile/ProfileSidebar.vue';
import { getUserInitials } from '@/utils/user-initials';
import type { UserWithStats } from '@/types';

const authStore = useAuthStore();
const route = useRoute();
const visitedStore = useVisitedStore();
const routesStore = useRoutesStore();
const postsStore = usePostsStore();

const activeTab = ref('travels');
const profileStats = ref<UserWithStats | null>(null);
const isLoadingProfile = ref(true);
const newPostText = ref('');
const isCreatingPost = ref(false);

const showEditForm = ref(false);
const editName = ref('');
const editBirthDate = ref('');
const editCity = ref('');
const editBio = ref('');
const editInterests = ref('');
const isSaving = ref(false);

const tabs = computed(() => [
  { key: 'travels', label: 'Метки', count: profileStats.value?.visitedCount ?? 0 },
  { key: 'routes', label: 'Маршруты', count: profileStats.value?.routesCount ?? routesStore.myRoutes.length },
  { key: 'posts', label: 'Посты', count: postsStore.posts.length },
]);

const avatarUrl = computed(() => authStore.user?.avatarUrl || null);
const userInitials = computed(() => getUserInitials(authStore.user?.name || ''));

const userAge = computed(() => {
  if (!authStore.user?.birthDate) return null;
  const birth = new Date(authStore.user.birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

const ageText = computed(() => {
  if (!userAge.value) return '';
  const n = userAge.value;
  const lastTwo = n % 100;
  const lastOne = n % 10;
  if (lastTwo >= 11 && lastTwo <= 19) return `${n} лет`;
  if (lastOne === 1) return `${n} год`;
  if (lastOne >= 2 && lastOne <= 4) return `${n} года`;
  return `${n} лет`;
});

async function createPost() {
  if (!newPostText.value.trim()) return;
  isCreatingPost.value = true;
  try {
    await postsStore.createPost(newPostText.value.trim());
    newPostText.value = '';
  } finally {
    isCreatingPost.value = false;
  }
}

function openEditForm() {
  editName.value = authStore.user?.name || '';
  editBirthDate.value = authStore.user?.birthDate
    ? new Date(authStore.user.birthDate).toISOString().split('T')[0]
    : '';
  editCity.value = authStore.user?.city || '';
  editBio.value = authStore.user?.bio || '';
  editInterests.value = (authStore.user?.interests || []).join(', ');
  showEditForm.value = true;
}

async function saveProfile() {
  isSaving.value = true;
  try {
    const payload: Record<string, unknown> = {};
    if (editName.value) payload.name = editName.value;
    if (editBirthDate.value) payload.birthDate = new Date(editBirthDate.value).toISOString();
    payload.city = editCity.value;
    payload.bio = editBio.value;
    payload.interests = editInterests.value
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    await authStore.updateProfile(payload as Parameters<typeof authStore.updateProfile>[0]);
    showEditForm.value = false;
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  const queryTab = route.query.tab;
  if (
    queryTab === 'travels' ||
    queryTab === 'routes' ||
    queryTab === 'posts'
  ) {
    activeTab.value = queryTab;
  }

  isLoadingProfile.value = true;
  try {
    if (authStore.user?._id) {
      const [stats] = await Promise.all([
        usersApi.getById(authStore.user._id),
        visitedStore.fetchStatistics(),
        routesStore.fetchMyRoutes(),
        visitedStore.fetchPlaces(),
        postsStore.fetchPosts(authStore.user._id),
      ]);
      profileStats.value = stats;
    }
  } finally {
    isLoadingProfile.value = false;
  }
});
</script>

<template>
	<div class="container">
		<div class="profile-layout">
			<!-- Loading skeleton -->
			<div v-if="isLoadingProfile" class="profile-content">
				<div class="skeleton-cover" />
				<div class="skeleton-info">
					<div class="skeleton-avatar" />
					<div class="skeleton-lines">
						<div class="skeleton-line w60" />
						<div class="skeleton-line w40" />
					</div>
				</div>
			</div>

			<div v-else class="profile-content">
				<!-- Cover -->
				<div class="profile-cover">
					<div class="cover-pattern">
						<svg class="cover-svg" viewBox="0 0 800 200" preserveAspectRatio="none">
							<defs>
								<linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" style="stop-color:#6C5CE7;stop-opacity:1" />
									<stop offset="100%" style="stop-color:#A29BFE;stop-opacity:1" />
								</linearGradient>
							</defs>
							<rect width="800" height="200" fill="url(#coverGrad)" />
							<circle cx="150" cy="100" r="120" fill="rgba(255,255,255,0.06)" />
							<circle cx="650" cy="50" r="80" fill="rgba(255,255,255,0.06)" />
							<circle cx="400" cy="150" r="60" fill="rgba(255,255,255,0.04)" />
							<path d="M0 140 Q200 80 400 140 T800 120 V200 H0Z" fill="rgba(255,255,255,0.05)" />
							<path d="M0 160 Q200 120 400 160 T800 150 V200 H0Z" fill="rgba(255,255,255,0.04)" />
						</svg>
					</div>
				</div>

				<!-- Profile Info -->
				<div class="profile-info">
					<div class="avatar-wrapper">
						<div class="avatar-container">
							<img v-if="avatarUrl" :src="avatarUrl" alt="Аватар" class="profile-avatar" />
							<div v-else class="profile-avatar-placeholder">{{ userInitials }}</div>
							<span class="online-indicator"></span>
						</div>
					</div>

					<div class="info-main">
						<div class="info-header">
							<div>
								<h1 class="user-name">{{ authStore.user?.name }}</h1>
								<p class="user-meta">
									<template v-if="ageText">{{ ageText }}</template>
									<template v-if="ageText && authStore.user?.city"> &bull; </template>
									<template v-if="authStore.user?.city">{{ authStore.user.city }}</template>
								</p>
							</div>
							<button class="btn-edit-profile" @click="openEditForm">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
								</svg>
								Редактировать
							</button>
						</div>
						<p class="user-bio">{{ authStore.user?.bio || 'Нажмите "Редактировать", чтобы рассказать о себе' }}</p>
					</div>
				</div>

				<!-- Edit Form Modal -->
				<div v-if="showEditForm" class="edit-overlay" @click.self="showEditForm = false">
					<div class="edit-form-card">
						<div class="edit-form-header">
							<h3>Редактировать профиль</h3>
							<button class="close-btn" @click="showEditForm = false">&times;</button>
						</div>
						<form @submit.prevent="saveProfile">
							<div class="form-group">
								<label for="edit-name">Имя</label>
								<input id="edit-name" v-model="editName" class="input" required />
							</div>
							<div class="form-group">
								<label for="edit-birth">Дата рождения</label>
								<input id="edit-birth" v-model="editBirthDate" type="date" class="input" />
							</div>
							<div class="form-group">
								<label for="edit-city">Город</label>
								<input id="edit-city" v-model="editCity" class="input" placeholder="Москва" />
							</div>
							<div class="form-group">
								<label for="edit-bio">О себе</label>
								<textarea id="edit-bio" v-model="editBio" class="input" rows="3" maxlength="500" placeholder="Расскажите о себе..." />
							</div>
							<div class="form-group">
								<label for="edit-interests">Интересы (через запятую)</label>
								<input id="edit-interests" v-model="editInterests" class="input" placeholder="Путешествия, Кино, Спорт" />
							</div>
							<div class="form-actions">
								<button type="submit" class="btn-primary" :disabled="isSaving">
									{{ isSaving ? 'Сохранение...' : 'Сохранить' }}
								</button>
								<button type="button" class="btn-secondary" @click="showEditForm = false">Отмена</button>
							</div>
						</form>
					</div>
				</div>

				<!-- Tabs -->
				<div class="profile-tabs">
					<button
						v-for="tab in tabs"
						:key="tab.key"
						class="tab-btn"
						:class="{ active: activeTab === tab.key }"
						@click="activeTab = tab.key"
					>
						{{ tab.label }}
						<span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
					</button>
				</div>

				<!-- Tab Content -->
				<div class="tab-content">
					<div v-if="activeTab === 'travels'">
						<div v-if="visitedStore.places.length === 0" class="empty-tab">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
								<path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" />
							</svg>
							<p>Пока нет посещённых мест</p>
							<router-link to="/map" class="btn-secondary btn-sm">Добавить место</router-link>
						</div>
						<div v-else class="places-grid">
							<div v-for="place in visitedStore.places.slice(0, 6)" :key="place._id" class="mini-card">
								<h4>{{ place.title }}</h4>
								<span v-if="place.note" class="mini-meta">{{ place.note }}</span>
							</div>
							<router-link
								v-if="visitedStore.places.length > 0"
								to="/map?tab=my"
								class="view-all-link"
							>
								Все метки ({{ visitedStore.places.length }}) &rarr;
							</router-link>
						</div>
					</div>

					<div v-else-if="activeTab === 'routes'">
						<div v-if="routesStore.myRoutes.length === 0" class="empty-tab">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
								<circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z" />
							</svg>
							<p>Маршрутов пока нет</p>
							<router-link to="/routes?new=1" class="btn-secondary btn-sm">Создать маршрут</router-link>
						</div>
						<div v-else class="places-grid">
							<div v-for="r in routesStore.myRoutes.slice(0, 6)" :key="r._id" class="mini-card">
								<router-link :to="`/routes/${r._id}`" class="mini-card-link">
									<h4>{{ r.name }}</h4>
									<span class="mini-meta">{{ r.geoMarkIds?.length || 0 }} точек</span>
								</router-link>
							</div>
							<router-link v-if="routesStore.myRoutes.length > 6" to="/routes" class="view-all-link">
								Все маршруты ({{ routesStore.myRoutes.length }}) &rarr;
							</router-link>
						</div>
					</div>

					<div v-else-if="activeTab === 'posts'" class="posts-tab">
						<div v-if="postsStore.posts.length === 0" class="empty-tab">
							<p>Постов пока нет</p>
						</div>
						<div v-else class="posts-list">
							<router-link
								v-for="post in postsStore.posts"
								:key="post._id"
								:to="`/posts/${post._id}`"
								class="post-card"
							>
								<p>{{ post.text }}</p>
								<span class="post-date">{{ new Date(post.createdAt).toLocaleDateString('ru-RU') }}</span>
							</router-link>
						</div>
					</div>
				</div>

				<div class="create-post-block">
					<textarea v-model="newPostText" class="input post-input" placeholder="Расскажите о впечатлениях..." rows="3" />
					<button class="btn-create-post" :disabled="isCreatingPost" @click="createPost">
						{{ isCreatingPost ? 'Публикация...' : 'Опубликовать пост' }}
					</button>
				</div>
			</div>

			<!-- Right Sidebar -->
			<ProfileSidebar v-if="!isLoadingProfile" :profile-stats="profileStats" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.profile-layout {
  display: flex;
  gap: 1.25rem;
	padding-top: 1.25rem;
}

.profile-content {
  flex: 1;
  min-width: 0;
}

// Skeleton
.skeleton-cover {
  height: 180px;
  border-radius: $radius-xl $radius-xl 0 0;
  background: linear-gradient(90deg, $gray-100 25%, $gray-50 50%, $gray-100 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-info {
  background: white;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.skeleton-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: $gray-200;
  flex-shrink: 0;
  margin-top: -40px;
}

.skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  padding-top: 0.5rem;
}

.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, $gray-100 25%, $gray-50 50%, $gray-100 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  &.w60 { width: 60%; }
  &.w40 { width: 40%; }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// Cover
.profile-cover {
  position: relative;
  height: 180px;
  border-radius: $radius-xl $radius-xl 0 0;
  overflow: hidden;
}

.cover-pattern {
  width: 100%;
  height: 100%;
}

.cover-svg {
  width: 100%;
  height: 100%;
}

// Profile Info
.profile-info {
  background: white;
  padding: 0 1.5rem 1.25rem;
  position: relative;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 0.75rem;
}

.avatar-container {
  position: relative;
}

.profile-avatar {
  width: 120px;
  height: 120px;
	margin-top: -60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
}

.profile-avatar-placeholder {
  @include flex-center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: $primary;
  color: white;
  font-size: $font-size-2xl;
  font-weight: 700;
  border: 3px solid white;
}

.online-indicator {
  position: absolute;
	top: 36px;
	left: 12px;
  width: 14px;
  height: 14px;
  background: #22C55E;
  border: 2px solid white;
  border-radius: 50%;
}

.info-header {
  @include flex-between;
  margin-bottom: 0.5rem;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: $gray-800;
  margin: 0;
}

.user-meta {
  font-size: $font-size-sm;
  color: $gray-500;
  margin: 0.125rem 0 0;
}

.btn-edit-profile {
  @include button-base;
  background: $primary;
  color: white;
  padding: 0.375rem 1rem;
  font-size: $font-size-sm;
  border-radius: $radius;
  gap: 0.375rem;

  &:hover {
    background: $primary-dark;
  }
}

.user-bio {
  font-size: $font-size-sm;
  color: $gray-500;
  margin: 0;
}

// Edit Form Overlay
.edit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.edit-form-card {
  background: white;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
}

.edit-form-header {
  @include flex-between;
  margin-bottom: 1.25rem;

  h3 {
    font-size: $font-size-lg;
    font-weight: 600;
    margin: 0;
  }
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: $gray-400;
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;

  &:hover {
    color: $gray-600;
  }
}

.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 500;
    margin-bottom: 0.375rem;
    color: $gray-700;
  }

  textarea {
    resize: vertical;
  }
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

// Tabs
.profile-tabs {
  display: flex;
  background: white;
  border-top: 1px solid $gray-200;
  padding: 0 1.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.875rem 1rem;
  border: none;
  background: none;
  color: $gray-500;
  font-size: $font-size-sm;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all $transition;

  &:hover {
    color: $gray-700;
  }

  &.active {
    color: $primary;
    border-bottom-color: $primary;
  }
}

.tab-count {
  background: $gray-100;
  color: $gray-600;
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-weight: 600;

  .active & {
    background: $accent;
    color: $primary;
  }
}

// Tab Content
.tab-content {
  @include card;
  margin-top: 1rem;
  min-height: 120px;
}

.empty-tab {
  @include flex-center;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;

  p {
    color: $gray-400;
    font-size: $font-size-sm;
    margin: 0;
  }

  .btn-sm {
    padding: 0.4rem 0.75rem;
    font-size: $font-size-sm;
    text-decoration: none;
  }
}

.empty-icon {
  color: $gray-300;
}

.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.mini-card {
  padding: 0.75rem;
  background: $gray-50;
  border-radius: $radius;
  transition: background $transition;

  &:hover {
    background: $gray-100;
  }

  h4 {
    font-size: $font-size-sm;
    font-weight: 600;
    margin: 0 0 0.25rem;
    color: $gray-800;
  }
}

.mini-card-link {
  text-decoration: none;
  color: inherit;
}

.mini-meta {
  font-size: 0.75rem;
  color: $gray-400;
}

.view-all-link {
  grid-column: 1 / -1;
  text-align: center;
  font-size: $font-size-sm;
  color: $primary;
  padding: 0.5rem;
}

// Create Post Block
.create-post-block {
  @include card;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.post-input {
  resize: vertical;
}

.posts-list {
  display: grid;
  gap: 1rem;
}

.post-card {
  @include card;
  padding: 1rem;
  display: block;
  text-decoration: none;
  color: inherit;
  transition: box-shadow $transition;

  &:hover {
    box-shadow: $shadow-md;
  }

  h4 {
    margin: 0 0 0.5rem;
  }
}

.post-date {
  font-size: 0.75rem;
  color: $gray-400;
}

.btn-create-post {
  @include button-base;
  background: $primary;
  color: white;
  padding: 0.5rem 2rem;
  font-size: $font-size-sm;
  border-radius: $radius-xl;
  text-decoration: none;

  &:hover {
    background: $primary-dark;
  }
}

@include tablet {
  .profile-layout {
    flex-direction: column;
  }
}

@include mobile {
  .profile-cover {
    height: 140px;
  }

  .profile-tabs {
    overflow-x: auto;
    padding: 0 1rem;
  }

  .tab-btn {
    white-space: nowrap;
  }

  .info-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
