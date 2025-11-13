<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import type { Message } from '../services/chatService'
import { useAuthStore } from '../stores/auth'

interface Props {
  selectedChatId: number | null
  messages: Message[]
  receiverUsername?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  sendMessage: [chatId: number, message: string]
  back: []
}>()

const authStore = useAuthStore()
const newMessage = ref('')
const messagesEndRef = ref<HTMLElement | null>(null)

const filteredMessages = computed(() => {
  if (!props.selectedChatId) return []
  return props.messages
    .filter(msg => msg.chatId === props.selectedChatId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
})

watch(() => props.messages, async () => {
  await nextTick()
  messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
})

const handleSendMessage = async () => {
  if (!props.selectedChatId || !newMessage.value.trim()) return

  try {
    emit('sendMessage', props.selectedChatId, newMessage.value)
    newMessage.value = ''
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSendMessage()
  }
}
</script>

<template>
  <div class="chat-window">
    <div v-if="selectedChatId && receiverUsername" class="header">
      <button class="back-button" @click="emit('back')">←</button>
      <h3 class="username">{{ receiverUsername }}</h3>
    </div>
    
    <template v-if="selectedChatId">
      <div class="message-list">
        <div
          v-for="(msg, index) in filteredMessages"
          :key="index"
          :class="['message-bubble', { mine: msg.sender === authStore.user?.username }]"
        >
          {{ msg.message }}
        </div>
        <div ref="messagesEndRef" />
      </div>
      <div class="input-area">
        <input
          v-model="newMessage"
          class="input"
          placeholder="Digite uma mensagem..."
          @keypress="handleKeyPress"
        />
        <button class="send-button" @click="handleSendMessage">
          Enviar
        </button>
      </div>
    </template>
    
    <div v-else class="placeholder">
      Selecione um chat para começar a conversar
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  height: 100%;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.back-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin-right: 10px;
}

.username {
  flex: 1;
  text-align: center;
  margin: 0;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.input-area {
  display: flex;
  padding: 16px;
  background: var(--color-background-elevated);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.input {
  flex: 1;
  padding: 8px;
  margin-bottom: 0 !important;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.send-button {
  margin-left: 10px;
  padding: 8px 16px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}

.message-bubble {
  max-width: 60%;
  padding: 6px 7px 8px 9px;
  background: #f1f1f1;
  color: #000;
  border-radius: 8px;
  align-self: flex-start;
}

.message-bubble.mine {
  background: #007bff;
  color: #fff;
  align-self: flex-end;
}
</style>
