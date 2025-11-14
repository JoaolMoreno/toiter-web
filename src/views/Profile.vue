<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserProfile, followUser, unfollowUser, updateUserProfile, updateProfileImage, updateHeaderImage } from '../services/userService'
import { getPostsByUser } from '../services/postService'
import type { UserProfile } from '../models/UserProfile'
import type { PostData } from '../models/PostData'
import { useAuthStore } from '../stores/auth'
import Post from '../components/Post.vue'
import EditProfileModal from '../components/EditProfileModal.vue'
import EditImageModal from '../components/EditImageModal.vue'

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
const isProfileModalOpen = ref(false)
const isImageModalOpen = ref(false)
const imageEditType = ref<'profile' | 'header'>('profile')

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

const handleEditProfile = () => {
  isProfileModalOpen.value = true
}

const handleEditProfileImage = () => {
  imageEditType.value = 'profile'
  isImageModalOpen.value = true
}

const handleEditHeaderImage = () => {
  imageEditType.value = 'header'
  isImageModalOpen.value = true
}

const handleUpdateProfile = async (data: { displayName: string; bio: string }) => {
  try {
    await updateUserProfile(data)
    if (profile.value) {
      profile.value.displayName = data.displayName
      profile.value.bio = data.bio
    }
    isProfileModalOpen.value = false
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
  }
}

const handleUpdateImage = async (file: File) => {
  try {
    if (imageEditType.value === 'profile') {
      await updateProfileImage(file)
    } else {
      await updateHeaderImage(file)
    }
    await loadProfile()
    isImageModalOpen.value = false
  } catch (error) {
    console.error('Erro ao atualizar imagem:', error)
  }
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
      <div v-if="profile" class="profile-header" :style="{ backgroundImage: `url(${profile.headerImageUrl})` }">
        <button class="back-button" @click="handleBack">
          ← Voltar
        </button>
        <button v-if="isOwnProfile" class="edit-header-button" @click="handleEditHeaderImage">
          ✏️ Editar Imagem
        </button>
      </div>

      <div v-if="profile" class="profile-info">
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
          @click="handleEditProfile"
        >
          Editar Perfil
        </button>

        <div class="profile-image-wrapper">
          <div class="profile-image-container" @click="isOwnProfile ? handleEditProfileImage() : null">
            <img :src="profile.profileImageUrl" alt="Profile" class="profile-image" />
          </div>
        </div>

        <div class="user-info">
          <h1 class="display-name">{{ profile.displayName }}</h1>
          <p class="username">
            @{{ profile.username }}
            <span v-if="profile.isFollowingMe" class="follows-you-badge">Segue você</span>
          </p>
          <p v-if="profile.bio" class="bio">{{ profile.bio }}</p>

          <div class="stats">
            <span class="stat-item"><strong>{{ profile.postsCount }}</strong> Posts</span>
            <span class="stat-item"><strong>{{ profile.followersCount }}</strong> Seguidores</span>
            <span class="stat-item"><strong>{{ profile.followingCount }}</strong> Seguindo</span>
          </div>
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

      <EditProfileModal
        :is-open="isProfileModalOpen"
        @close="isProfileModalOpen = false"
        @submit="handleUpdateProfile"
        :current-display-name="profile?.displayName || ''"
        :current-bio="profile?.bio || ''"
      />

      <EditImageModal
        :is-open="isImageModalOpen"
        @close="isImageModalOpen = false"
        @submit="handleUpdateImage"
        :type="imageEditType"
        :current-image="imageEditType === 'profile' ? profile?.profileImageUrl : profile?.headerImageUrl"
      />
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

.profile-header {
  position: relative;
  background-size: cover;
  background-position: center;
  width: 100%;
  padding-bottom: 25%;
  max-height: 280px;
  border-radius: 12px 12px 0 0;
  border: 1px solid var(--color-border);
  z-index: 1;
  margin-top: 25px;
}

.back-button {
  position: absolute;
  top: 24px;
  left: 12px;
  background-color: var(--color-overlay);
  color: var(--color-button-text);
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

.back-button:hover {
  background-color: var(--color-overlay-hover);
}

.edit-header-button {
  position: absolute;
  top: 24px;
  right: 12px;
  background-color: var(--color-overlay);
  color: var(--color-button-text);
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;
  opacity: 0;
}

.profile-header:hover .edit-header-button {
  opacity: 1;
}

.edit-header-button:hover {
  background-color: var(--color-overlay-hover);
}

.profile-info {
  position: relative;
  background-color: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0 0 12px 12px;
  padding: 40px 24px 24px;
  margin-top: -12px;
}

.follow-button,
.edit-button {
  position: absolute;
  top: 30px;
  right: 20px;
  background-color: var(--color-primary);
  color: var(--color-button-text);
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.follow-button.following {
  background-color: var(--color-following-button);
}

.follow-button:hover {
  background-color: var(--color-button-hover);
}

.follow-button.following:hover {
  background-color: var(--color-following-button-hover);
}

.follow-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.edit-button {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.edit-button:hover {
  background-color: var(--color-primary);
  color: var(--color-button-text);
}

.profile-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: -80px auto 16px;
  width: 100px;
  height: 100px;
  border: 3px solid var(--color-background);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.profile-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 3;
}

.profile-image-container:hover::after {
  content: '✏️';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 4;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  text-align: center;
  margin-top: 16px;
}

.display-name {
  font-size: 18px;
  margin-bottom: 4px;
}

.username {
  font-size: 14px;
  color: var(--color-text-light);
}

.follows-you-badge {
  background-color: var(--color-background-alt);
  color: var(--color-text-light);
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.bio {
  margin: 8px 0;
  font-size: 13px;
  text-align: center;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}

.stat-item {
  font-size: 13px;
}

.stat-item strong {
  font-size: 14px;
}

.posts-section {
  margin-top: 16px;
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
