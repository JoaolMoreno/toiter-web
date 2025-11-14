<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getFeed, createPost } from '../services/postService'
import { useAuthStore } from '../stores/auth'
import { useFeedStore } from '../stores/feed'
import Post from '../components/Post.vue'
import Modal from '../components/Modal.vue'
import ChatList from '../components/ChatList.vue'
import ChatWindow from '../components/ChatWindow.vue'
import { chatService, type ChatPreview, type Message } from '../services/chatService'
import { useWebSocket } from '../composables/useWebSocket'
import pkg from 'lodash'
const { debounce } = pkg

const authStore = useAuthStore()
const feedStore = useFeedStore()
const { connect, disconnect, sendMessage: wsSendMessage, subscribeToMessages } = useWebSocket()

const inputContent = ref('')
const isModalOpen = ref(false)
const isChatOpen = ref(false)
const chats = ref<ChatPreview[]>([])
const messages = ref<Message[]>([])
const selectedChatId = ref<number | null>(null)
const receiverUsername = ref<string>('')
const syncedChats = ref<Record<number, number>>({})

// Set document title
if (typeof document !== 'undefined') {
  document.title = 'Feed - Toiter'
}

const loadPosts = async () => {
  if (!feedStore.hasMore || feedStore.loading) return
  feedStore.setLoading(true)
  
  try {
    const data = await getFeed(feedStore.page, 10)
    
    // Prevent duplicates
    feedStore.setPosts((prev) => {
      const existingIds = new Set(prev.map(post => post.id))
      const newPosts = data.content.filter((post: { id: number }) => !existingIds.has(post.id))
      return [...prev, ...newPosts]
    })
    
    const totalPages = Math.ceil(data.totalElements / 10)
    feedStore.setHasMore(feedStore.page + 1 < totalPages)
  } catch (error) {
    console.error('Erro ao carregar posts:', error)
  } finally {
    feedStore.setLoading(false)
  }
}

const handleScroll = debounce(() => {
  if (!feedStore.hasMore || feedStore.loading) return
  
  const scrollPosition = window.innerHeight + document.documentElement.scrollTop
  const scrollThreshold = document.documentElement.offsetHeight - 100
  
  if (scrollPosition >= scrollThreshold) {
    feedStore.setPage(prev => prev + 1)
  }
}, 250)

const handleCreateNewPost = () => {
  isModalOpen.value = true
}

const handleModalClose = () => {
  isModalOpen.value = false
  inputContent.value = ''
}

const handleSubmitPost = async (content: string) => {
  try {
    const newPost = await createPost(content)
    feedStore.setPosts(prevPosts => [newPost, ...prevPosts])
    isModalOpen.value = false
  } catch (error) {
    console.error('Erro ao criar novo post:', error)
  }
}

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value && chats.value.length === 0) {
    loadChats()
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
      messages.value = await chatService.syncChatMessages(chatId)
      syncedChats.value[chatId] = now
    } else {
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
    const newMsg: Message = {
      id: Date.now(),
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
    await loadChats()
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

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  if (authStore.isAuthenticated) {
    loadPosts()
    
    // Setup WebSocket for chat
    const token = localStorage.getItem('accessToken')
    if (token) {
      connect(token)
      subscribeToMessages((message: Message) => {
        if (message.chatId === selectedChatId.value) {
          messages.value.push(message)
          localStorage.setItem(`chat_${selectedChatId.value}_messages`, JSON.stringify(messages.value))
        }
        // Update last message in chats
        const chat = chats.value.find(c => c.chatId === message.chatId)
        if (chat) {
          chat.lastMessageContent = message.message
          chat.lastMessageSentDate = message.timestamp
          chat.lastMessageSender = message.sender
        }
      })
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  handleScroll.cancel()
  disconnect()
})

watch(() => authStore.isAuthenticated, (newValue) => {
  if (newValue) {
    console.log('Loading posts for page:', feedStore.page)
    loadPosts()
  }
})

watch(() => feedStore.page, () => {
  if (authStore.isAuthenticated) {
    console.log('Loading posts for page:', feedStore.page)
    loadPosts()
  }
})
</script>

<template>
  <div class="container">
    <div class="feed-container">
      <h1 class="feed-title">Seu Feed</h1>
      
      <div class="create-post-container">
        <textarea
          class="create-post-input"
          placeholder="No que você está pensando?"
          v-model="inputContent"
        />
        <button class="create-post-button" @click="handleCreateNewPost">
          Postar
        </button>
      </div>
      
      <Post
        v-for="post in feedStore.posts"
        :key="post.id"
        :post="post"
      />
      
      <p v-if="feedStore.loading" class="loading-message">
        Carregando mais posts...
      </p>
      <p v-if="!feedStore.hasMore" class="end-message">
        Você chegou ao final do feed!
      </p>
      
      <!-- Floating action button -->
      <div class="floating-buttons">
        <button class="floating-button" @click="handleCreateNewPost" title="Criar novo post">
          +
        </button>
      </div>
    </div>

    <!-- Chat toggle button and panel -->
    <button
      v-if="!isChatOpen"
      class="chat-toggle-button"
      @click="toggleChat"
      title="Abrir mensagens"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.5 2 2 6.14 2 11.25C2 14.02 3.32 16.5 5.44 18.21V22L8.88 20.06C9.84 20.35 10.88 20.5 12 20.5C17.5 20.5 22 16.36 22 11.25C22 6.14 17.5 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="chat-toggle-text">Mensagens</span>
    </button>

    <!-- Chat panel -->
    <div :class="['chat-panel', { open: isChatOpen }]">
      <div class="chat-panel-header">
        <h2>Mensagens</h2>
        <button class="close-chat-button" @click="toggleChat">✕</button>
      </div>
      <div class="chat-panel-content">
        <template v-if="selectedChatId">
          <ChatWindow
            :selectedChatId="selectedChatId"
            :messages="messages"
            :receiverUsername="receiverUsername"
            @sendMessage="sendMessage"
            @back="backToList"
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
        </template>
      </div>
    </div>
    
    <Modal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      @close="handleModalClose"
      @submit="handleSubmitPost"
      title="Criar Novo Post"
      post-type="post"
      :initial-content="inputContent"
    />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
  background-color: var(--color-background);
  min-height: 100vh;
  position: relative;
}

.feed-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

.feed-title {
  color: var(--color-text);
  font-size: 1.75rem;
  font-weight: 700;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
}

.create-post-container {
  width: 100%;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-background-elevated);
  border-radius: 8px;
  margin-bottom: 16px;
}

.create-post-input {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: transparent;
  color: var(--color-text);
  font-size: 16px;
  resize: none;
  font-family: inherit;
}

.create-post-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.create-post-button {
  padding: 12px 24px;
  border: none;
  border-radius: 24px;
  background-color: var(--color-primary);
  color: var(--color-text);
  font-weight: 600;
  cursor: pointer;
  align-self: flex-end;
  transition: background-color 0.2s;
  margin-top: 12px;
}

.create-post-button:hover {
  background-color: var(--color-button-hover);
}

.loading-message {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.end-message {
  text-align: center;
  color: var(--color-primary);
  font-weight: 700;
  font-size: 16px;
  margin-top: 20px;
}

/* Floating action button - create post */
.floating-buttons {
  position: fixed;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.floating-button {
  background-color: var(--color-primary);
  color: var(--color-text);
  font-size: 24px;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-button:hover {
  background-color: var(--color-button-hover);
  transform: scale(1.05);
}

/* Chat toggle button - Instagram style pill */
.chat-toggle-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  height: 48px;
  padding: 0 20px;
  border-radius: 24px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background-elevated);
  color: var(--color-text);
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
}

.chat-toggle-button:hover {
  background-color: var(--color-background-alt);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

.chat-toggle-text {
  white-space: nowrap;
}

/* Chat panel - expands from the button */
.chat-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 0;
  height: 0;
  background-color: var(--color-background-elevated);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;
  display: flex;
  flex-direction: column;
  opacity: 0;
  overflow: hidden;
}

.chat-panel.open {
  width: 360px;
  height: 500px;
  opacity: 1;
}

.chat-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  border-radius: 16px 16px 0 0;
  flex-shrink: 0;
}

.chat-panel-header h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 700;
}

.close-chat-button {
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  transition: opacity 0.2s;
  line-height: 1;
  border-radius: 4px;
}

.close-chat-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.chat-panel-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .chat-toggle-button {
    bottom: 16px;
    right: 16px;
  }

  .chat-panel {
    bottom: 0;
    right: 0;
    left: 0;
    border-radius: 16px 16px 0 0;
  }

  .chat-panel.open {
    width: 100%;
    height: 85vh;
  }
  
  .floating-buttons {
    left: 16px;
    bottom: 16px;
  }
}
</style>
