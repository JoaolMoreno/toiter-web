<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import {useChatLogic} from '../composables/useChatLogic'
import ChatList from '../components/ChatList.vue'
import ChatWindow from '../components/ChatWindow.vue'

const {
  chats,
  messages,
  selectedChatId,
  receiverUsername,
  loadChats,
  selectChat,
  sendMessage,
  startChat,
  updateChats,
  backToList,
  receiverImageUrl,
  initChat
} = useChatLogic()

const isMobile = ref(false)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(async () => {
  if (typeof document !== 'undefined') {
    document.title = 'Chat - Toiter'
  }

  await loadChats()
  initChat()

  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
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
