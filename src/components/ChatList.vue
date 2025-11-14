<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { chatService, type ChatPreview } from '../services/chatService'
import NewChatModal from './NewChatModal.vue'

interface Props {
  selectedChatId: number | null
  chats: ChatPreview[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  selectChat: [chatId: number]
  startChat: [username: string]
  updateChats: [chats: ChatPreview[]]
}>()

const search = ref('')
const isModalOpen = ref(false)

const loadChats = async () => {
  console.log('📬 Loading chats...')
  try {
    const response = await chatService.getMyChats()
    emit('updateChats', response.content)
  } catch (error) {
    console.error('Failed to load chats:', error)
  }
}

const filteredChats = computed(() => {
  return props.chats.filter(chat =>
    chat.receiverUsername.toLowerCase().includes(search.value.toLowerCase())
  )
})

onMounted(() => {
  const storedChats = localStorage.getItem('my_chats')
  if (storedChats) {
    emit('updateChats', JSON.parse(storedChats).content)
  }
  loadChats()
})
</script>

<template>
  <div class="sidebar">
    <div class="search-container">
      <input
        v-model="search"
        type="text"
        placeholder="Pesquisar chats..."
        class="search-input"
      />
      <button class="new-chat-button" @click="isModalOpen = true">
        Novo Chat
      </button>
    </div>
    <div class="chat-list">
      <div
        v-for="chat in filteredChats"
        :key="chat.chatId"
        :class="['chat-item', { active: chat.chatId === selectedChatId }]"
        @click="emit('selectChat', chat.chatId)"
      >
        <h4>{{ chat.receiverUsername }}</h4>
        <p>{{ chat.lastMessageContent }}</p>
        <small>
          {{ new Date(chat.lastMessageSentDate).toLocaleTimeString() }}
        </small>
      </div>
    </div>
    <NewChatModal
      :is-open="isModalOpen"
      @close="isModalOpen = false"
      @start-chat="(username) => { emit('startChat', username); isModalOpen = false }"
    />
  </div>
</template>

<style scoped>
.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  background: var(--color-background-elevated);
  border-right: 1px solid var(--color-border);
  height: 100%;
  color: var(--color-text);
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: 100%;
  }
}

.search-container {
  padding: 16px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
}

.search-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-background-alt);
  color: var(--color-text);
  outline: none;
  font-family: inherit;
  margin-bottom: 0 !important;
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

.new-chat-button {
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
}

.new-chat-button:hover {
  background: var(--color-button-hover);
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  background: transparent;
  transition: background 0.2s ease, border-left 0.2s ease;
  color: var(--color-text);
}

.chat-item.active {
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid var(--color-primary);
}

.chat-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.chat-item h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text);
}

.chat-item p {
  margin: 6px 0 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item small {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
</style>
