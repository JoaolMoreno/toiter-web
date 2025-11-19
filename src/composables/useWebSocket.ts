import { ref, onUnmounted } from 'vue'
import { chatService, type Message } from '../services/chatService'

const connected = ref(false)
const handlers = ref<((message: Message) => void)[]>([])
const currentToken = ref<string | null>(null)

export function useWebSocket() {
  const connect = (token: string) => {
    if (token && !connected.value) {
      const result = chatService.connectToWebSocket(token)
      if (result) {
        result
          .then(() => {
            connected.value = true
            currentToken.value = token
          })
          .catch(err => console.error('Failed to connect WebSocket:', err))
      } else {
        connected.value = true
        currentToken.value = token
      }
    }
  }

  const disconnect = () => {
    if (connected.value) {
      chatService.disconnectWebSocket()
      connected.value = false
      handlers.value = []
      currentToken.value = null
    }
  }

  const sendMessage = async (chatId: number, message: string) => {
    if (!chatService.isConnected() && currentToken.value) {
      console.log('WebSocket not connected, attempting to reconnect...')
      try {
        await new Promise<void>((resolve, reject) => {
          const result = chatService.connectToWebSocket(currentToken.value!)
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
