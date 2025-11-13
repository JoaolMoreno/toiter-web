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
  background: white;
  border-right: 1px solid var(--color-border);
  height: 100%;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: 100%;
  }
}

.search-container {
  padding: 15px;
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #eee;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  margin-bottom: 0 !important;
  border-radius: 20px;
  background: #fff;
  outline: none;
  font-family: inherit;
}

.search-input:focus {
  border-color: #0084ff;
}

.search-input::placeholder {
  color: #999;
}

.new-chat-button {
  padding: 8px 12px;
  border-radius: 20px;
  background: #0084ff;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.new-chat-button:hover {
  background: #0073e6;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  background: transparent;
  transition: background 0.2s;
}

.chat-item.active {
  background: #e6f0fa;
}

.chat-item:hover {
  background: #e6f0fa;
}

.chat-item h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.chat-item p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item small {
  font-size: 12px;
  color: #999;
}
</style>
