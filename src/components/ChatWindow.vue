<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import type { Message } from '../services/chatService'
import { useAuthStore } from '../stores/auth'
import { getSafeImageUrl, onImgError } from '../utils/image'

interface Props {
  selectedChatId: number | null
  messages: Message[]
  receiverUsername?: string
  receiverImageUrl?: string | null
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
    .sort((a, b) => {
      const at = parseUtcDate(a.sentDate)?.getTime() ?? 0
      const bt = parseUtcDate(b.sentDate)?.getTime() ?? 0
      return at - bt
    })
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

// Robust UTC parser: appends 'Z' if missing, trims fractional seconds to 3 digits
const parseUtcDate = (input?: string): Date | null => {
  if (!input) return null
  let iso = input
  // Append Z only if no timezone info already present
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso)) iso += 'Z'
  // Trim fractional seconds to 3 digits if present
  iso = iso.replace(/(\.\d{3})\d+/, '$1')
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

const formatTime = (sentDate?: string): string => {
  const date = parseUtcDate(sentDate)
  if (!date) return ''
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const safeReceiverImageUrl = computed(() => getSafeImageUrl(props.receiverImageUrl || null))

const onHeaderAvatarError = (e: Event) => onImgError(e)
</script>

<template>
  <div class="chat-window">
    <div v-if="selectedChatId && receiverUsername" class="header">
      <button class="back-button" @click="emit('back')" aria-label="Voltar para lista de chats">
        ←
      </button>
      <div class="header-avatar">
        <img :src="safeReceiverImageUrl" alt="Profile" @error="onHeaderAvatarError" />
      </div>
      <h3 class="username">{{ receiverUsername }}</h3>
    </div>
    
    <template v-if="selectedChatId">
      <div class="message-list">
        <div
          v-for="(msg, index) in filteredMessages"
          :key="index"
          :class="['message-bubble', { mine: msg.sender === authStore.user?.username }]"
        >
          <div class="message-content">{{ msg.message }}</div>
          <div class="message-time">{{ formatTime(msg.sentDate) }}</div>
        </div>
        <div ref="messagesEndRef" />
      </div>
      <div class="input-area">
        <div class="input-wrapper">
          <input
            v-model="newMessage"
            class="message-input"
            placeholder="Digite uma mensagem..."
            @keypress="handleKeyPress"
          />
          <button class="send-button" type="button" @click="handleSendMessage">
            Enviar
          </button>
        </div>
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
  min-height: 0;
  background: var(--color-background-alt);
  color: var(--color-text);
  border-left: 1px solid var(--color-border);
}

.header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: var(--color-background-elevated);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  gap: 12px;
}

.back-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  width: 36px;
  height: 36px;
  font-size: 1rem;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  flex-shrink: 0;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--color-text);
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-background-alt);
  flex-shrink: 0;
}

.header-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: left;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}


.input-area {
  padding: 20px 24px;
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--color-background-alt);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 10px 14px;
  gap: 12px;
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 0.95rem;
  font-family: inherit;
}

.message-input::placeholder {
  color: var(--color-text-secondary);
}

.message-input:focus {
  outline: none;
}

.send-button {
  border: none;
  border-radius: 999px;
  padding: 8px 18px;
  background: var(--color-primary);
  color: var(--color-button-text);
  font-weight: 600;
  transition: background 0.2s ease;
}

.send-button:hover {
  background: var(--color-button-hover);
}

.placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.message-bubble {
  max-width: 65%;
  padding: 10px 14px;
  border-radius: 16px;
  background: var(--color-background-elevated);
  color: var(--color-text);
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-content {
  word-wrap: break-word;
  line-height: 1.4;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.6;
  align-self: flex-end;
  margin-top: 2px;
}

.message-bubble.mine {
  background: var(--color-primary);
  color: var(--color-button-text);
  align-self: flex-end;
}

.message-bubble.mine .message-time {
  opacity: 0.8;
}
</style>
