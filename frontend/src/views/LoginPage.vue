<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

async function handleLogin() {
  error.value = '';
  isLoading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.push('/map');
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    error.value = err.response?.data?.message || 'Ошибка входа';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <form class="auth-form" @submit.prevent="handleLogin">
      <h2>Вход</h2>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" class="input" placeholder="email@example.com" required />
      </div>
      <div class="form-group">
        <label for="password">Пароль</label>
        <input id="password" v-model="password" type="password" class="input" placeholder="Минимум 6 символов" required />
      </div>
      <button type="submit" class="btn-primary btn-full" :disabled="isLoading">
        {{ isLoading ? 'Вход...' : 'Войти' }}
      </button>
      <p class="auth-link">
        Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
      </p>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.auth-page {
  @include flex-center;
  min-height: calc(100vh - 64px);
  padding: 2rem;
}

.auth-form {
  @include card;
  width: 100%;
  max-width: 400px;

  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: $font-size-2xl;
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
}

.btn-full {
  width: 100%;
  margin-top: 0.5rem;
}

.auth-link {
  text-align: center;
  margin-top: 1rem;
  font-size: $font-size-sm;
  color: $gray-500;
}

.error-message {
  background: rgba($danger, 0.1);
  color: $danger;
  padding: 0.75rem;
  border-radius: $radius;
  margin-bottom: 1rem;
  font-size: $font-size-sm;
}
</style>
