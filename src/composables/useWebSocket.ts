import { ref, onUnmounted } from 'vue'
import { chatService, type Message } from '../services/chatService'

const connected = ref(false)
const handlers = ref<((message: Message) => void)[]>([])

// WebSocket connection using HttpOnly cookies for authentication
export function useWebSocket() {
  const connect = () => {
    if (!connected.value) {
      const result = chatService.connectToWebSocket()
      if (result) {
        result
          .then(() => {
            connected.value = true
          })
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

  const sendMessage = async (chatId: number, message: string) => {
    if (!chatService.isConnected()) {
      console.log('WebSocket not connected, attempting to reconnect...')
      try {
        await new Promise<void>((resolve, reject) => {
          const result = chatService.connectToWebSocket()
          if (result) {
            result.then(() => {
              connected.value = true
              resolve()
            }).catch(reject)
          } else {
            connected.value = true
            resolve()
          }
        })
      } catch (err) {
        console.error('Failed to reconnect WebSocket:', err)
        throw new Error('WebSocket not connected and failed to reconnect')
      }
    }

    if (chatService.isConnected()) {
      chatService.sendMessage(chatId, message)
    } else {
      throw new Error('WebSocket not connected')
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
// Authentication via HttpOnly cookies - no token needed
export function initWebSocket() {
  // Only initialize if in browser context
  if (typeof window !== 'undefined') {
    const { connect } = useWebSocket()
    connect()
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
