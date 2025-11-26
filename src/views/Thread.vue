<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getThread, createReply } from '../services/postService'
import type { PostData } from '../models/PostData'
import Post from '../components/Post.vue'
import Modal from '../components/Modal.vue'

import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const postId = computed(() => parseInt(route.params.postId as string))
const post = ref<PostData | null>(null)
const replies = ref<PostData[]>([])
const loading = ref(false)
const isModalOpen = ref(false)

const loadThread = async () => {
  if (loading.value) return
  loading.value = true

  try {
    const data = await getThread(postId.value, 0, 50)
    post.value = data.parentPost
    replies.value = data.childPosts
  } catch (error) {
    console.error('Erro ao carregar thread:', error)
  } finally {
    loading.value = false
  }
}

const handleReply = () => {
  isModalOpen.value = true
}

const handleSubmitReply = async (content: string) => {
  try {
    const newReply = await createReply(postId.value, content)
    replies.value = [newReply, ...replies.value]
    isModalOpen.value = false
  } catch (error) {
    console.error('Erro ao criar resposta:', error)
  }
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadThread()

  if (typeof document !== 'undefined') {
    document.title = post.value ? `${post.value.username} no Toiter` : 'Thread - Toiter'
  }
})
</script>

<template>
  <div class="container">
    <div class="thread-container">
      <div class="header">
        <button class="back-button" @click="handleBack">
          <span class="back-icon">←</span>
          <span class="back-text">Voltar</span>
        </button>
      </div>

      <div v-if="post" class="main-post-wrapper">
        <div class="main-post">
          <Post :post="post" @reply="handleReply" />
        </div>

        <!-- Connector line -->
        <div class="connector-line"></div>

        <!-- Reply input placeholder -->
        <div class="reply-input-area" @click="handleReply">
          <img :src="authStore.user?.profileImageUrl || '/default-profile.png'" class="user-avatar" />
          <div class="fake-input">Postar sua resposta</div>
          <button class="reply-submit-btn">Responder</button>
        </div>
      </div>

      <div class="replies-section">
        <h2 v-if="replies.length > 0" class="section-title">
          Respostas
        </h2>
        <Post v-for="reply in replies" :key="reply.id" :post="reply" />

        <p v-if="loading" class="loading-message">
          Carregando respostas...
        </p>
        <p v-if="!loading && replies.length === 0" class="no-replies-message">
          Nenhuma resposta ainda. Seja o primeiro a responder!
        </p>
      </div>
    </div>

    <Modal v-if="isModalOpen && post" :is-open="isModalOpen" @close="isModalOpen = false" @submit="handleSubmitReply"
      title="Responder" post-type="reply" :parent-post-content="post.content" :parent-username="post.username"
      :parent-display-name="post.displayName" :parent-profile-picture="post.profilePicture || undefined" />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-background);
  min-height: 100vh;
}

.thread-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

.header {
  display: flex;
  align-items: center;
  padding: 12px 0;
  margin-bottom: 16px;
}

.back-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-button:hover {
  color: var(--color-text);
  background-color: var(--color-background-elevated);
}

.back-icon {
  font-size: 1.125rem;
  line-height: 1;
}

.back-text {
  line-height: 1;
}

.main-post-wrapper {
  position: relative;
  margin-bottom: 0;
}

.main-post {
  position: relative;
  z-index: 2;
}

.connector-line {
  position: absolute;
  left: 32px;
  /* Adjust based on avatar position in Post component */
  top: 60px;
  /* Start below the avatar */
  bottom: -24px;
  /* Extend into the replies section */
  width: 2px;
  background-color: var(--color-border);
  z-index: 1;
  display: none;
  /* Hidden by default, can be enabled if we want a continuous line style */
}

.reply-input-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: text;
  transition: background-color 0.2s;
}

.reply-input-area:hover {
  background-color: var(--color-background-elevated);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.fake-input {
  flex: 1;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.reply-submit-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  opacity: 0.5;
  /* Disabled look until clicked */
}



.section-title {
  display: none;
  /* Hide "Respostas" title for cleaner look */
}

.loading-message,
.no-replies-message {
  text-align: center;
  color: var(--color-text-light);
  padding: 32px;
  border-bottom: 1px solid var(--color-border);
}
</style>
