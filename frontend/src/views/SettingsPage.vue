<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/services/authApi';

const router = useRouter();
const authStore = useAuthStore();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isSaving = ref(false);
const passwordMessage = ref('');
const passwordError = ref('');

const profilePrivacy = ref<'public'>('public');
const emailLikes = ref(true);
const isSavingSettings = ref(false);
const settingsMessage = ref('');

async function handleChangePassword() {
  passwordMessage.value = '';
  passwordError.value = '';

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Пароли не совпадают';
    return;
  }

  isSaving.value = true;
  try {
    await authApi.changePassword(currentPassword.value, newPassword.value);
    passwordMessage.value = 'Пароль успешно изменён';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch {
    passwordError.value = 'Не удалось изменить пароль. Проверьте текущий пароль.';
  } finally {
    isSaving.value = false;
  }
}

async function handleSaveSettings() {
  isSavingSettings.value = true;
  settingsMessage.value = '';
  try {
    await authApi.updateSettings({
      profilePrivacy: profilePrivacy.value,
      emailNotifications: {
        likes: emailLikes.value,
      },
    });
    settingsMessage.value = 'Настройки сохранены';
  } finally {
    isSavingSettings.value = false;
  }
}

async function handleCoverUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  await authApi.uploadCover(file);
  await authStore.fetchProfile();
}

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}

onMounted(() => {
  profilePrivacy.value = authStore.user?.profilePrivacy || 'public';
  emailLikes.value = authStore.user?.emailNotifications?.likes ?? true;
});
</script>

<template>
  <div class="settings-page container">
    <h1>Настройки</h1>

    <section class="settings-section">
      <h2>Профиль</h2>
      <p class="section-desc">Редактируйте имя, биографию и интересы</p>
      <router-link to="/profile" class="btn-secondary">Перейти в профиль</router-link>
    </section>

    <section class="settings-section">
      <h2>Обложка профиля</h2>
      <input type="file" accept="image/*" @change="handleCoverUpload" />
    </section>

    <section class="settings-section">
      <h2>Приватность</h2>
      <div class="form-group">
        <label>Видимость профиля</label>
        <select v-model="profilePrivacy" class="input">
          <option value="public">Публичный</option>
        </select>
      </div>
      <h3>Email-уведомления</h3>
      <label class="checkbox-label">
        <input v-model="emailLikes" type="checkbox" />
        Лайки
      </label>
      <p v-if="settingsMessage" class="success">{{ settingsMessage }}</p>
      <button class="btn-primary" :disabled="isSavingSettings" @click="handleSaveSettings">
        {{ isSavingSettings ? 'Сохранение...' : 'Сохранить настройки' }}
      </button>
    </section>

    <section class="settings-section">
      <h2>Смена пароля</h2>
      <form @submit.prevent="handleChangePassword">
        <div class="form-group">
          <label>Текущий пароль</label>
          <input v-model="currentPassword" type="password" class="input" required />
        </div>
        <div class="form-group">
          <label>Новый пароль</label>
          <input v-model="newPassword" type="password" class="input" minlength="6" required />
        </div>
        <div class="form-group">
          <label>Подтвердите пароль</label>
          <input v-model="confirmPassword" type="password" class="input" minlength="6" required />
        </div>
        <p v-if="passwordError" class="error">{{ passwordError }}</p>
        <p v-if="passwordMessage" class="success">{{ passwordMessage }}</p>
        <button type="submit" class="btn-primary" :disabled="isSaving">
          {{ isSaving ? 'Сохранение...' : 'Изменить пароль' }}
        </button>
      </form>
    </section>

    <section class="settings-section">
      <h2>Аккаунт</h2>
      <button type="button" class="btn-danger" @click="handleLogout">Выйти из аккаунта</button>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  padding: 2rem 1rem;
  max-width: 640px;

  h1 {
    margin-bottom: 2rem;
  }
}

.settings-section {
  @include card;
  padding: 1.5rem;
  margin-bottom: 1.5rem;

  h2 {
    font-size: $font-size-lg;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-size: $font-size-sm;
    margin: 1rem 0 0.5rem;
  }
}

.section-desc {
  font-size: $font-size-sm;
  color: $gray-500;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: $gray-700;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: $font-size-sm;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.error {
  color: $danger;
  font-size: $font-size-sm;
  margin-bottom: 0.75rem;
}

.success {
  color: $secondary;
  font-size: $font-size-sm;
  margin-bottom: 0.75rem;
}

.btn-danger {
  @include button-base;
  background: $danger;
  color: white;
  padding: 0.5rem 1rem;

  &:hover {
    opacity: 0.9;
  }
}
</style>
