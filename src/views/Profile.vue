<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserProfile, followUser, unfollowUser } from '../services/userService'
import { getPostsByUser } from '../services/postService'
import type { UserProfile } from '../models/UserProfile'
import type { PostData } from '../models/PostData'
import { useAuthStore } from '../stores/auth'
import Post from '../components/Post.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const username = computed(() => route.params.username as string)
const profile = ref<UserProfile | null>(null)
const posts = ref<PostData[]>([])
const page = ref(0)
const hasMore = ref(true)
const loading = ref(false)
const isFollowLoading = ref(false)

const isOwnProfile = computed(() => authStore.user?.username === username.value)

const loadProfile = async () => {
  if (!username.value) return
  try {
    const data = await getUserProfile(username.value)
    profile.value = data
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
  }
}

const loadPosts = async () => {
  if (!username.value || !hasMore.value || loading.value) return
  loading.value = true
  
  try {
    const data = await getPostsByUser(username.value, page.value, 10)
    
    // Prevent duplicates
    const existingIds = new Set(posts.value.map(post => post.id))
    const newPosts = data.content.filter((post: { id: number }) => !existingIds.has(post.id))
    posts.value = [...posts.value, ...newPosts]
    
    hasMore.value = page.value < data.totalPages - 1
  } catch (error) {
    console.error('Erro ao carregar posts:', error)
  } finally {
    loading.value = false
  }
}

const handleFollow = async () => {
  if (!profile.value || isFollowLoading.value) return
  isFollowLoading.value = true
  
  try {
    if (profile.value.isFollowing) {
      await unfollowUser(profile.value.username)
      profile.value.isFollowing = false
      profile.value.followersCount--
    } else {
      await followUser(profile.value.username)
      profile.value.isFollowing = true
      profile.value.followersCount++
    }
  } catch (error) {
    console.error('Erro ao seguir/desseguir:', error)
  } finally {
    isFollowLoading.value = false
  }
}

const handleBack = () => {
  router.push('/feed')
}

onMounted(() => {
  loadProfile()
  loadPosts()
  
  if (typeof document !== 'undefined') {
    document.title = `@${username.value} - Toiter`
  }
})
</script>

<template>
  <div class="container">
    <div class="profile-container">
      <button class="back-button" @click="handleBack">
        ← Voltar
      </button>
      
      <div v-if="profile" class="profile-header">
        <div class="profile-info">
          <h1 class="username">{{ profile.username }}</h1>
          <p v-if="profile.bio" class="bio">{{ profile.bio }}</p>
          
          <div class="stats">
            <span>{{ profile.followingCount }} Seguindo</span>
            <span>{{ profile.followersCount }} Seguidores</span>
          </div>
        </div>
        
        <div class="profile-actions">
          <button
            v-if="!isOwnProfile"
            class="follow-button"
            :class="{ following: profile.isFollowing }"
            @click="handleFollow"
            :disabled="isFollowLoading"
          >
            {{ profile.isFollowing ? 'Seguindo' : 'Seguir' }}
          </button>
          <button
            v-else
            class="edit-button"
            @click="() => {}"
          >
            Editar Perfil
          </button>
        </div>
      </div>
      
      <div class="posts-section">
        <h2 class="section-title">Posts</h2>
        <Post
          v-for="post in posts"
          :key="post.id"
          :post="post"
        />
        
        <p v-if="loading" class="loading-message">
          Carregando posts...
        </p>
        <p v-if="!hasMore && posts.length > 0" class="end-message">
          Todos os posts foram carregados
        </p>
        <p v-if="!hasMore && posts.length === 0" class="no-posts-message">
          Nenhum post encontrado
        </p>
      </div>
    </div>
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

.profile-container {
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

.profile-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 24px;
  margin-bottom: 24px;
}

.profile-info {
  margin-bottom: 16px;
}

.username {
  color: var(--color-text);
  font-size: var(--font-size-xlarge);
  margin-bottom: 8px;
}

.bio {
  color: var(--color-text-light);
  margin-bottom: 16px;
}

.stats {
  display: flex;
  gap: 24px;
  color: var(--color-text-light);
  font-size: var(--font-size-small);
}

.profile-actions {
  display: flex;
  gap: 12px;
}

.follow-button,
.edit-button {
  padding: 8px 24px;
  border: 1px solid var(--color-primary);
  border-radius: 24px;
  background-color: transparent;
  color: var(--color-primary);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-button:hover,
.edit-button:hover {
  background-color: var(--color-primary);
  color: white;
}

.follow-button.following {
  background-color: var(--color-primary);
  color: white;
}

.follow-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.posts-section {
  margin-top: 24px;
}

.section-title {
  color: var(--color-text);
  font-size: var(--font-size-large);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.loading-message,
.end-message,
.no-posts-message {
  text-align: center;
  color: var(--color-text-light);
  padding: 24px;
}

.end-message {
  font-weight: bold;
}
</style>

