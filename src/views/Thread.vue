<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
    document.title = 'Thread - Toiter'
  }
})
</script>

<template>
  <div class="container">
    <div class="thread-container">
      <button class="back-button" @click="handleBack">
        ← Voltar
      </button>
      
      <div v-if="post" class="main-post">
        <Post :post="post" />
        <button class="reply-button" @click="handleReply">
          Responder
        </button>
      </div>
      
      <div class="replies-section">
        <h2 v-if="replies.length > 0" class="section-title">
          Respostas ({{ replies.length }})
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

.back-button {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-regular);
  padding: 16px 0;
}

.back-button:hover {
  text-decoration: underline;
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
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.reply-button:hover {
  background-color: var(--color-primary);
  color: white;
}

.replies-section {
  border-top: 1px solid var(--color-border);
  padding-top: 24px;
}

.section-title {
  color: var(--color-text);
  font-size: var(--font-size-large);
  margin-bottom: 16px;
}

.loading-message,
.no-replies-message {
  text-align: center;
  color: var(--color-text-light);
  padding: 24px;
}
</style>

