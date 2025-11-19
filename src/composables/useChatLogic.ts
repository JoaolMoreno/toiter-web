import { ref, computed } from 'vue'
import { chatService, type ChatPreview, type Message } from '../services/chatService'
import { useWebSocket, initWebSocket } from '../composables/useWebSocket'
import { useAuthStore } from '../stores/auth'

export function useChatLogic() {
  const authStore = useAuthStore()
  const { sendMessage: wsSendMessage, subscribeToMessages } = useWebSocket()

  const chats = ref<ChatPreview[]>([])
  const messages = ref<Message[]>([])
  const selectedChatId = ref<number | null>(null)
  const receiverUsername = ref<string>('')
  const syncedChats = ref<Record<number, number>>({})

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('syncedChats')
    if (stored) {
      syncedChats.value = JSON.parse(stored)
    }
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
      const now = Date.now()
      const lastSynced = syncedChats.value[chatId] || 0
      const needsSync = now - lastSynced > 5 * 60 * 1000 // 5 minutes

      if (needsSync) {
        console.log(`Syncing messages for chat ${chatId} (last synced ${lastSynced ? new Date(lastSynced).toLocaleTimeString() : 'never'})`)
        messages.value = await chatService.syncChatMessages(chatId)
        syncedChats.value[chatId] = now
        if (typeof window !== 'undefined') {
          localStorage.setItem('syncedChats', JSON.stringify(syncedChats.value))
        }
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
      await wsSendMessage(chatId, message)
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

  const receiverImageUrl = computed(() => {
    const chat = chats.value.find(c => c.chatId === selectedChatId.value)
    return chat?.receiverProfileImageUrl ?? null
  })

  // Initialize chat with WebSocket (using HttpOnly cookies for auth)
  const initChat = () => {
    if (authStore.user) {
      initWebSocket()
      subscribeToMessages((message: Message) => {
        if (message.chatId === selectedChatId.value) {
          messages.value.push(message)
          localStorage.setItem(`chat_${selectedChatId.value}_messages`, JSON.stringify(messages.value))
        }
        const chat = chats.value.find(c => c.chatId === message.chatId)
        if (chat) {
          chat.lastMessageContent = message.message
          chat.lastMessageSentDate = message.sentDate
          chat.lastMessageSender = message.sender
        }
      })
    }
  }

  return {
    chats,
    messages,
    selectedChatId,
    receiverUsername,
    syncedChats,
    loadChats,
    selectChat,
    loadMessages,
    sendMessage,
    startChat,
    updateChats,
    backToList,
    receiverImageUrl,
    initChat
  }
}
