<script setup lang="ts">
import { ref, onMounted, computed, onServerPrefetch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPostById, getReplies, createReply } from '../services/postService'
import type { PostData } from '../models/PostData'
import Post from '../components/Post.vue'
import Modal from '../components/Modal.vue'

const route = useRoute()
const router = useRouter()

const postId = computed(() => parseInt(route.params.postId as string))
const post = ref<PostData | null>(null)
const replies = ref<PostData[]>([])
const loading = ref(false)
const isModalOpen = ref(false)

const loadPost = async () => {
  try {
    const data = await getPostById(postId.value)
    post.value = data
  } catch (error) {
    console.error('Erro ao carregar post:', error)
  }
}

const loadReplies = async () => {
  if (loading.value) return
  loading.value = true
  
  try {
    const data = await getReplies(postId.value, 0, 50)
    replies.value = data.content
  } catch (error) {
    console.error('Erro ao carregar respostas:', error)
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
  loadPost()
  loadReplies()
  
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

      <div v-if="post" class="main-post">
        <Post :post="post" />
        <button class="reply-button" @click="handleReply">
          Responder
        </button>
      </div>
      
      <div class="replies-section">
        <h2 v-if="replies.length > 0" class="section-title">
          Respostas
        </h2>
        <Post
          v-for="reply in replies"
          :key="reply.id"
          :post="reply"
        />
        
        <p v-if="loading" class="loading-message">
          Carregando respostas...
        </p>
        <p v-if="!loading && replies.length === 0" class="no-replies-message">
          Nenhuma resposta ainda. Seja o primeiro a responder!
        </p>
      </div>
    </div>
    
    <Modal
      v-if="isModalOpen && post"
      :is-open="isModalOpen"
      @close="isModalOpen = false"
      @submit="handleSubmitReply"
      title="Responder"
      post-type="reply"
      :parent-post-content="post.content"
      :parent-username="post.username"
    />
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

.main-post {
  margin-bottom: 24px;
}

.reply-button {
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  background-color: transparent;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reply-button:hover {
  background-color: var(--color-primary);
  color: var(--color-button-text);
}

.replies-section {
  border-top: 1px solid var(--color-border);
  padding-top: 24px;
}

.section-title {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.loading-message,
.no-replies-message {
  text-align: center;
  color: var(--color-text-light);
  padding: 24px;
}
</style>
