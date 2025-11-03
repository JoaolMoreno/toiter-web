import { ref, onUnmounted } from 'vue'
import { chatService, type Message } from '../services/chatService'

const connected = ref(false)
const handlers = ref<((message: Message) => void)[]>([])

export function useWebSocket() {
  const connect = (token: string) => {
    if (token && !connected.value) {
      const result = chatService.connectToWebSocket(token)
      if (result) {
        result
          .then(() => (connected.value = true))
          .catch(err => console.error('Failed to connect WebSocket:', err))
      } else {
        connected.value = true
      }
    }
  }

  const disconnect = () => {
    if (connected.value) {
      chatService.disconnectWebSocket()
      connected.value = false
      handlers.value = []
    }
  }

  const sendMessage = (chatId: number, message: string) => {
    if (connected.value) {
      chatService.sendMessage(chatId, message)
    }
  }

  const subscribeToMessages = (handler: (message: Message) => void) => {
    handlers.value = [...handlers.value, handler]
    return () => {
      handlers.value = handlers.value.filter(h => h !== handler)
    }
  }

  return {
    connected,
    connect,
    disconnect,
    sendMessage,
    subscribeToMessages
  }
}

// Initialize WebSocket connection on app mount
export function initWebSocket() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  if (token) {
    const { connect } = useWebSocket()
    connect(token)
  }

  // Configure WebSocket message subscription
  const unsubscribe = chatService.onMessage((message: Message) => {
    handlers.value.forEach(handler => handler(message))
  })

  onUnmounted(() => {
    const { disconnect } = useWebSocket()
    disconnect()
    unsubscribe()
  })
}
