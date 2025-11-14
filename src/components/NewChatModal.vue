<script setup lang="ts">
import { ref, watch } from 'vue'
import { chatService, type FollowData } from '../services/chatService'
import { getSafeImageUrl, onImgError } from '../utils/image'

interface Props {
  isOpen: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
  startChat: [username: string]
}>()

const search = ref('')
const users = ref<FollowData[]>([])

let timeoutId: ReturnType<typeof setTimeout> | null = null

const fetchUsers = async () => {
  try {
    const response = await chatService.getFollowing(search.value)
    users.value = response.content
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

watch(search, () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  timeoutId = setTimeout(fetchUsers, 300)
})

const handleStartChat = (username: string) => {
  emit('startChat', username)
  emit('close')
}

const getProfileImageUrl = (u: FollowData): string => getSafeImageUrl(u.profileImageUrl)
const onAvatarError = (e: Event) => onImgError(e)
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Nova mensagem</h3>
        <button class="close-button" @click="emit('close')">✕</button>
      </div>
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Pesquisar..."
          class="search-input"
          spellcheck="false"
          autocomplete="off"
        />
      </div>
      <div class="user-list">
        <div
          v-for="u in users"
          :key="u.username"
          class="user-item"
          @click="handleStartChat(u.username)"
        >
          <div class="user-avatar">
            <img :src="getProfileImageUrl(u)" @error="onAvatarError" alt="Avatar" />
          </div>
          <div class="user-name">{{ u.username }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: var(--color-background-elevated);
  border-radius: 16px;
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.modal-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--color-text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.close-button:hover {
  background: var(--color-background-alt);
  color: var(--color-text);
}

.search-container {
  position: relative;
  padding: 15px 20px;
  border-bottom: 1px solid var(--color-border);
}

.search-icon {
  position: absolute;
  left: 32px;
  top: 27px;
  font-size: 18px;
  pointer-events: none;
  opacity: 0.5;
  line-height: 1;
}

.search-input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: none;
  border-radius: 24px;
  outline: none;
  font-size: 15px;
  font-family: inherit;
  background: var(--color-background-alt);
  color: var(--color-text);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  background: var(--color-background);
  box-shadow: 0 0 0 2px var(--color-primary);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

.user-list {
  flex: 1;
  overflow-y: auto;
  padding: 5px 0;
}

.user-item {
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.2s ease;
}

.user-item:hover {
  background: var(--color-background-alt);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-background-alt);
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
}
</style>
