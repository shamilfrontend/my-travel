<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { eventsApi } from '@/services/eventsApi';
import type { TravelEvent } from '@/types';

const publicEvents = ref<TravelEvent[]>([]);
const myEvents = ref<TravelEvent[]>([]);
const activeTab = ref<'public' | 'mine'>('public');
const isLoading = ref(false);

const showForm = ref(false);
const formTitle = ref('');
const formDescription = ref('');
const formLocation = ref('');
const formStartDate = ref('');
const isCreating = ref(false);

async function loadEvents() {
  isLoading.value = true;
  try {
    const [pub, mine] = await Promise.all([
      eventsApi.getPublic(),
      eventsApi.getMine(),
    ]);
    publicEvents.value = pub;
    myEvents.value = mine;
  } finally {
    isLoading.value = false;
  }
}

async function handleCreate() {
  if (!formTitle.value || !formStartDate.value) return;
  isCreating.value = true;
  try {
    await eventsApi.create({
      title: formTitle.value,
      description: formDescription.value || undefined,
      location: formLocation.value || undefined,
      startDate: new Date(formStartDate.value).toISOString(),
    });
    showForm.value = false;
    formTitle.value = '';
    formDescription.value = '';
    formLocation.value = '';
    formStartDate.value = '';
    await loadEvents();
  } finally {
    isCreating.value = false;
  }
}

async function handleJoin(id: string) {
  await eventsApi.join(id);
  await loadEvents();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(loadEvents);
</script>

<template>
  <div class="events-page container">
    <div class="page-header">
      <h1>События</h1>
      <button class="btn-primary" @click="showForm = !showForm">Создать событие</button>
    </div>

    <div v-if="showForm" class="create-form">
      <h3>Новое событие</h3>
      <div class="form-group">
        <label>Название</label>
        <input v-model="formTitle" class="input" required />
      </div>
      <div class="form-group">
        <label>Описание</label>
        <textarea v-model="formDescription" class="input" rows="2" />
      </div>
      <div class="form-group">
        <label>Место</label>
        <input v-model="formLocation" class="input" />
      </div>
      <div class="form-group">
        <label>Дата начала</label>
        <input v-model="formStartDate" type="datetime-local" class="input" required />
      </div>
      <button class="btn-primary" :disabled="isCreating" @click="handleCreate">
        {{ isCreating ? 'Создание...' : 'Создать' }}
      </button>
    </div>

    <div class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'public' }]" @click="activeTab = 'public'">
        Публичные
      </button>
      <button :class="['tab-btn', { active: activeTab === 'mine' }]" @click="activeTab = 'mine'">
        Мои
      </button>
    </div>

    <div v-if="isLoading" class="empty">Загрузка...</div>
    <div v-else class="events-list">
      <div
        v-for="event in (activeTab === 'public' ? publicEvents : myEvents)"
        :key="event._id"
        class="event-card"
      >
        <h3>{{ event.title }}</h3>
        <p v-if="event.description" class="desc">{{ event.description }}</p>
        <p v-if="event.location" class="location">{{ event.location }}</p>
        <p class="date">{{ formatDate(event.startDate) }}</p>
        <p class="participants">{{ event.participantIds.length }} участников</p>
        <button class="btn-secondary btn-sm" @click="handleJoin(event._id)">Участвовать</button>
      </div>
      <div v-if="(activeTab === 'public' ? publicEvents : myEvents).length === 0" class="empty">
        Событий пока нет
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.events-page {
  padding: 2rem 1rem;
}

.page-header {
  @include flex-between;
  margin-bottom: 1.5rem;

  h1 {
    margin: 0;
  }
}

.create-form {
  @include card;
  padding: 1.5rem;
  margin-bottom: 1.5rem;

  h3 {
    margin-bottom: 1rem;
  }
}

.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: 1px solid $gray-200;
  background: white;
  border-radius: $radius;
  cursor: pointer;

  &.active {
    background: $primary;
    color: white;
    border-color: $primary;
  }
}

.events-list {
  display: grid;
  gap: 1rem;
}

.event-card {
  @include card;
  padding: 1.25rem;

  h3 {
    margin-bottom: 0.5rem;
  }
}

.desc {
  color: $gray-600;
  font-size: $font-size-sm;
  margin-bottom: 0.5rem;
}

.location,
.date,
.participants {
  font-size: $font-size-sm;
  color: $gray-500;
  margin-bottom: 0.25rem;
}

.btn-sm {
  margin-top: 0.75rem;
  padding: 0.375rem 0.75rem;
  font-size: $font-size-sm;
}

.empty {
  text-align: center;
  color: $gray-400;
  padding: 2rem;
}
</style>
