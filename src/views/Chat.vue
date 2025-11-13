<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { chatService, type ChatPreview, type Message } from '../services/chatService'
import { useWebSocket } from '../composables/useWebSocket'
import { useAuthStore } from '../stores/auth'
import ChatList from '../components/ChatList.vue'
import ChatWindow from '../components/ChatWindow.vue'

const router = useRouter()
const authStore = useAuthStore()
const { connect, disconnect, sendMessage: wsSendMessage, subscribeToMessages } = useWebSocket()

const chats = ref<ChatPreview[]>([])
const messages = ref<Message[]>([])
const selectedChatId = ref<number | null>(null)
const receiverUsername = ref<string>('')

const handleBack = () => {
  router.push('/feed')
}

const loadChats = async () => {
  try {
    const response = await chatService.getMyChats()
    chats.value = response.content
  } catch (error) {
    console.error('Failed to load chats:', error)
  }
}

const selectChat = async (chatId: number) => {
  selectedChatId.value = chatId
  const chat = chats.value.find(c => c.chatId === chatId)
  if (chat) {
    receiverUsername.value = chat.receiverUsername
    await loadMessages(chatId)
  }
}

const loadMessages = async (chatId: number) => {
  try {
    const msgs = await chatService.syncChatMessages(chatId)
    // Filter messages for this chat and sort by timestamp
    messages.value = msgs
      .filter(msg => msg.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  } catch (error) {
    console.error('Failed to load messages:', error)
  }
}

const sendMessage = async (chatId: number, message: string) => {
  try {
    wsSendMessage(chatId, message)
    // Optimistically add the message
    const newMsg: Message = {
      id: Date.now(), // Temporary ID
      chatId,
      message,
      sender: authStore.user?.username || '',
      timestamp: new Date().toISOString()
    }
    messages.value.push(newMsg)
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const startChat = async (username: string) => {
  try {
    const chatId = await chatService.startChat(username)
    await loadChats() // Reload chats to include the new one
    selectChat(chatId)
  } catch (error) {
    console.error('Failed to start chat:', error)
  }
}

const updateChats = (newChats: ChatPreview[]) => {
  chats.value = newChats
}

const backToList = () => {
  selectedChatId.value = null
  receiverUsername.value = ''
}

onMounted(async () => {
  if (typeof document !== 'undefined') {
    document.title = 'Chat - Toiter'
  }

  await loadChats()

  if (authStore.user) {
    const token = localStorage.getItem('accessToken')
    if (token) {
      connect(token)
      subscribeToMessages((message: Message) => {
        messages.value.push(message)
        // Update last message in chats
        const chatIndex = chats.value.findIndex(c => c.chatId === message.chatId)
        if (chatIndex !== -1) {
          chats.value[chatIndex].lastMessageContent = message.message
          chats.value[chatIndex].lastMessageSentDate = message.timestamp
          chats.value[chatIndex].lastMessageSender = message.sender
        }
      })
    }
  }
})

onUnmounted(() => {
  disconnect()
})
</script>

<template>
  <div class="container">
    <div class="chat-layout">
      <ChatList
        :selectedChatId="selectedChatId"
        :chats="chats"
        @selectChat="selectChat"
        @startChat="startChat"
        @updateChats="updateChats"
      />
      <ChatWindow
        :selectedChatId="selectedChatId"
        :messages="messages"
        :receiverUsername="receiverUsername"
        @sendMessage="sendMessage"
        @back="backToList"
      />
    </div>
    <button class="back-button" @click="handleBack">
      ← Voltar para Feed
    </button>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  min-height: 100vh;
}

.chat-layout {
  display: flex;
  flex: 1;
  height: calc(100vh - 60px); /* Adjust for back button */
}

.back-button {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-regular);
  padding: 16px;
  align-self: flex-start;
}

.back-button:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .chat-layout {
    flex-direction: column;
  }
}
</style>
