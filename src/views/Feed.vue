<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getFeed, createPost } from '../services/postService'
import { useAuthStore } from '../stores/auth'
import { useFeedStore } from '../stores/feed'
import Post from '../components/Post.vue'
import Modal from '../components/Modal.vue'
import pkg from 'lodash'
const { debounce } = pkg

const authStore = useAuthStore()
const feedStore = useFeedStore()

const inputContent = ref('')
const isModalOpen = ref(false)

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

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  if (authStore.isAuthenticated) {
    loadPosts()
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  handleScroll.cancel()
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
      
      <button class="floating-button" @click="handleCreateNewPost">
        +
      </button>
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

.floating-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--color-primary);
  color: var(--color-text);
  font-size: 24px;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  transition: all 0.2s ease;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-button:hover {
  background-color: var(--color-button-hover);
  transform: scale(1.05);
}
</style>
