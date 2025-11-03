<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { chatService } from '../services/chatService'

interface Props {
  onStartChat: (username: string) => void
}

defineProps<Props>()

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

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="container">
    <input
      v-model="search"
      type="text"
      placeholder="Search users..."
      class="search-input"
    />
    <div class="user-list">
      <div
        v-for="username in users"
        :key="username"
        class="user-item"
        @click="onStartChat(username)"
      >
        {{ username }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 15px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-alt);
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  margin-bottom: 10px;
  background: var(--color-background);
  color: var(--color-text);
  font-family: inherit;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.search-input::placeholder {
  color: var(--color-text-light);
}

.user-list {
  max-height: 200px;
  overflow-y: auto;
}

.user-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--color-text);
}

.user-item:hover {
  background: var(--color-background-elevated);
}
</style>
