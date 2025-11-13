<script setup lang="ts">
import { ref, watch } from 'vue'
import { chatService } from '../services/chatService'

interface Props {
  isOpen: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
  startChat: [username: string]
}>()

const search = ref('')
const users = ref<string[]>([])

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
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Nova mensagem</h3>
        <button class="close-button" @click="emit('close')">✕</button>
      </div>
      <input
        v-model="search"
        type="text"
        placeholder="Pesquisar..."
        class="search-input"
      />
      <div class="user-list">
        <div
          v-for="username in users"
          :key="username"
          class="user-item"
          @click="handleStartChat(username)"
        >
          <div class="user-avatar" />
          <div class="user-name">{{ username }}</div>
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: #fff;
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #333;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: none;
  border-bottom: 1px solid #eee;
  outline: none;
  font-size: 16px;
  font-family: inherit;
}

.search-input:focus {
  border-bottom: 1px solid #0084ff;
}

.search-input::placeholder {
  color: #999;
}

.user-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.user-item {
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-item:hover {
  background: #f0f2f5;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ddd;
}

.user-name {
  font-size: 16px;
  color: #333;
}
</style>
