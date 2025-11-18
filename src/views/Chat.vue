<script setup lang="ts">
import {onMounted, onUnmounted, ref, computed} from 'vue'
import {type ChatPreview, chatService, type Message} from '../services/chatService'
import {useWebSocket} from '../composables/useWebSocket'
import {useAuthStore} from '../stores/auth'
import ChatList from '../components/ChatList.vue'
import ChatWindow from '../components/ChatWindow.vue'

const authStore = useAuthStore()
const { connect, disconnect, sendMessage: wsSendMessage, subscribeToMessages } = useWebSocket()

const chats = ref<ChatPreview[]>([])
const messages = ref<Message[]>([])
const selectedChatId = ref<number | null>(null)
const receiverUsername = ref<string>('')

const syncedChats = ref<Record<number, number>>({})
const isMobile = ref(false)

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
    const now = Date.now()
    const lastSynced = syncedChats.value[chatId] || 0
    const needsSync = now - lastSynced > 5 * 60 * 1000 // 5 minutes

    if (needsSync) {
      console.log(`Syncing messages for chat ${chatId} (last synced ${lastSynced ? new Date(lastSynced).toLocaleTimeString() : 'never'})`)
      messages.value = await chatService.syncChatMessages(chatId)
      syncedChats.value[chatId] = now
    } else {
      console.log(`Using cached messages for chat ${chatId}`)
      const storedMessagesStr = localStorage.getItem(`chat_${chatId}_messages`)
      if (storedMessagesStr) {
        messages.value = JSON.parse(storedMessagesStr)
      }
    }
  } catch (error) {
    console.error('Failed to sync messages:', error)
  }
}

const sendMessage = async (chatId: number, message: string) => {
  try {
    wsSendMessage(chatId, message)
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

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

const receiverImageUrl = computed(() => {
  const chat = chats.value.find(c => c.chatId === selectedChatId.value)
  return chat?.receiverProfileImageUrl ?? null
})

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
        if (message.chatId === selectedChatId.value) {
          messages.value.push(message)
          console.log('Mensagem adicionada ao array:', JSON.stringify(messages.value))
          localStorage.setItem(`chat_${selectedChatId.value}_messages`, JSON.stringify(messages.value))
        }
        // Update last message in chats
        const chat = chats.value.find(c => c.chatId === message.chatId)
        if (chat) {
          chat.lastMessageContent = message.message
          chat.lastMessageSentDate = message.sentDate
          chat.lastMessageSender = message.sender
        }
      })
    }
  }

  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  disconnect()
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="container">
    <div class="chat-layout">
      <template v-if="isMobile">
        <ChatWindow
          v-if="selectedChatId"
          :selectedChatId="selectedChatId"
          :messages="messages"
          :receiverUsername="receiverUsername"
          :receiverImageUrl="receiverImageUrl"
          @sendMessage="sendMessage"
          @back="backToList"
        />
        <ChatList
          v-else
          :selectedChatId="selectedChatId"
          :chats="chats"
          @selectChat="selectChat"
          @startChat="startChat"
          @updateChats="updateChats"
        />
      </template>
      <template v-else>
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
          :receiverImageUrl="receiverImageUrl"
          @sendMessage="sendMessage"
          @back="backToList"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  height: calc(100vh - 80px);
  overflow: hidden;
}

.chat-layout {
  display: flex;
  flex: 1;
  background: var(--color-background-elevated);
  overflow: hidden;
}
</style>
