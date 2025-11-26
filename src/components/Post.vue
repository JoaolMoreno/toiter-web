<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { PostData } from '../models/PostData'
import { useAuthStore } from '../stores/auth'
import { likePost, unlikePost, deletePost, createRepost, repostWithComment } from '../services/postService'
import ImageModal from './ImageModal.vue'

interface Props {
  post: PostData
}

const props = defineProps<Props>()
const emit = defineEmits(['reply'])
const router = useRouter()
const authStore = useAuthStore()

const isSimpleRepost = computed(() => {
  return props.post.repostPostData && (!props.post.content || props.post.content.trim() === '')
})

const displayPost = computed(() => {
  return isSimpleRepost.value ? props.post.repostPostData : props.post
})

const originalPost = computed(() => {
  return isSimpleRepost.value ? null : props.post.repostPostData
})

const isLiked = ref(displayPost.value?.isLiked ?? false)
const likesCount = ref(displayPost.value?.likesCount ?? 0)
const repliesCount = ref(displayPost.value?.repliesCount ?? 0)
const repostsCount = ref(displayPost.value?.repostsCount ?? 0)
const isRemoved = ref(false)
const showToast = ref(false)
const isActionHovered = ref(false)
const repostMode = ref<'menu' | 'comment' | null>(null)
const commentContent = ref('')
const isImageModalOpen = ref(false)
const selectedImageUrl = ref('')

const profilePicture = computed(() => {
  const picture = displayPost.value?.profilePicture || props.post.profilePicture
  if (!picture) {
    return '/default-profile.png'
  }
  return import.meta.env.DEV ? picture.replace('https://', 'http://') : picture
})

const mediaUrl = computed(() => {
  const url = displayPost.value?.mediaUrl || props.post.mediaUrl
  if (!url) return null
  return import.meta.env.DEV ? url.replace('https://', 'http://') : url
})

const formatTimestamp = (dateString: string): string => {
  const date = new Date(`${dateString}Z`)
  const now = new Date()

  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMins < 0) {
    return 'Agora mesmo'
  } else if (diffMins < 60) {
    return `${diffMins}m`
  } else if (diffHours < 24) {
    return `${diffHours}h`
  } else {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
}

const handleLikeToggle = async (e: Event) => {
  e.stopPropagation()
  const postId = displayPost.value?.id ?? props.post.id
  try {
    if (isLiked.value) {
      await unlikePost(postId)
      likesCount.value--
      isLiked.value = false
    } else {
      await likePost(postId)
      likesCount.value++
      isLiked.value = true
    }
  } catch (error) {
    console.error('Erro ao curtir/descurtir:', error)
  }
}

const handleDelete = async () => {
  try {
    await deletePost(props.post.id)
    isRemoved.value = true
  } catch (error) {
    console.error('Erro ao deletar post:', error)
  }
}

const handlePostClick = () => {
  const postId = displayPost.value?.id ?? props.post.id
  router.push(`/thread/${postId}`)
}

const handleProfileClick = (e: Event) => {
  e.stopPropagation()
  const username = displayPost.value?.username ?? props.post.username
  router.push(`/profile/${username}`)
}

const handleShare = (e: Event) => {
  e.stopPropagation()
  const shareUrl = `${window.location.origin}/thread/${displayPost.value?.id ?? props.post.id}`
  navigator.clipboard.writeText(shareUrl)
  showToast.value = true
  setTimeout(() => showToast.value = false, 2000)
}

const handleOriginalPostClick = (e: Event) => {
  e.stopPropagation()
  if (originalPost.value) {
    router.push(`/thread/${originalPost.value.id}`)
  }
}

const handleRepost = async () => {
  const postId = displayPost.value?.id ?? props.post.id
  try {
    await createRepost(postId)
    repostsCount.value++
    repostMode.value = null
  } catch (error) {
    console.error('Erro ao repostar:', error)
  }
}

const handleRepostWithCommentClick = () => {
  repostMode.value = 'comment'
}

const handleRepostWithCommentSubmit = async () => {
  if (!commentContent.value.trim()) return
  const postId = displayPost.value?.id ?? props.post.id
  try {
    await repostWithComment(postId, commentContent.value)
    repostsCount.value++
    commentContent.value = ''
    repostMode.value = null
  } catch (error) {
    console.error('Erro ao repostar com comentário:', error)
  }
}

const handleImageClick = (e: Event) => {
  e.stopPropagation()
  if (mediaUrl.value) {
    selectedImageUrl.value = mediaUrl.value
    isImageModalOpen.value = true
  }
}
</script>

<template>
  <div v-if="!isRemoved" class="post-card" :class="{ 'no-hover': isActionHovered }"
    @click="repostMode ? repostMode = null : handlePostClick()">
    <!-- Repost header if this is a simple repost -->
    <div v-if="isSimpleRepost && repostMode !== 'comment'" class="repost-header">
      <span class="repost-icon">🔄</span>
      <span class="repost-text">{{ post.displayName }} repostou</span>
    </div>

    <div v-if="repostMode !== 'comment'" class="post-header">
      <div class="user-info" @click="handleProfileClick">
        <img :src="profilePicture" alt="Profile picture" class="profile-pic" />
        <strong>{{ displayPost?.displayName }}</strong>
        <span class="username">@{{ displayPost?.username }}</span>
        <span class="timestamp">· {{ displayPost?.createdAt ? formatTimestamp(displayPost.createdAt) : '' }}</span>
      </div>
      <button v-if="authStore.user?.username === displayPost?.username" class="delete-button"
        @mouseenter="isActionHovered = true" @mouseleave="isActionHovered = false" @click.stop="handleDelete">
        🗑️
      </button>
    </div>

    <div v-if="repostMode !== 'comment'" class="post-content">
      {{ displayPost?.content }}
    </div>

    <!-- Post Media -->
    <div v-if="mediaUrl && repostMode !== 'comment'" class="post-media" @click="handleImageClick">
      <img :src="mediaUrl" alt="Post image" class="post-image" loading="lazy"
        :width="displayPost?.mediaWidth || undefined" :height="displayPost?.mediaHeight || undefined"
        :style="displayPost?.mediaWidth && displayPost?.mediaHeight ? { aspectRatio: `${displayPost.mediaWidth}/${displayPost.mediaHeight}` } : {}" />
    </div>

    <!-- Original post for reposts with comments -->
    <div v-if="originalPost && repostMode !== 'comment'" class="original-post" @click="handleOriginalPostClick">
      <div class="original-post-header">
        <div class="user-info">
          <img :src="originalPost.profilePicture || '/default-profile.png'" alt="Profile picture" class="profile-pic" />
          <strong>{{ originalPost.displayName }}</strong>
          <span class="username">@{{ originalPost.username }}</span>
          <span class="timestamp">· {{ formatTimestamp(originalPost.createdAt) }}</span>
        </div>
      </div>
      <div class="original-post-content">
        {{ originalPost.content }}
      </div>
      <div v-if="originalPost.mediaUrl" class="post-media">
        <img :src="originalPost.mediaUrl" alt="Post image" class="post-image" loading="lazy"
          :width="originalPost.mediaWidth || undefined" :height="originalPost.mediaHeight || undefined"
          :style="originalPost.mediaWidth && originalPost.mediaHeight ? { aspectRatio: `${originalPost.mediaWidth}/${originalPost.mediaHeight}` } : {}" />
      </div>
    </div>

    <!-- Comment input for repost with comment -->
    <div v-if="repostMode === 'comment'" class="comment-preview" @click.stop>
      <div class="post-header">
        <div class="user-info">
          <img :src="authStore.user?.profileImageUrl || '/default-profile.png'" alt="Profile picture"
            class="profile-pic" />
          <strong>{{ authStore.user?.displayName }}</strong>
          <span class="username">@{{ authStore.user?.username }}</span>
        </div>
      </div>
      <textarea v-model="commentContent" placeholder="Adicione um comentário..." class="comment-textarea"></textarea>
      <!-- Original post preview -->
      <div class="original-post">
        <div class="original-post-header">
          <div class="user-info">
            <img :src="displayPost?.profilePicture || '/default-profile.png'" alt="Profile picture"
              class="profile-pic" />
            <strong>{{ displayPost?.displayName }}</strong>
            <span class="username">@{{ displayPost?.username }}</span>
            <span class="timestamp">· {{ displayPost?.createdAt ? formatTimestamp(displayPost.createdAt) : '' }}</span>
          </div>
        </div>
        <div class="original-post-content">
          {{ displayPost?.content }}
        </div>
        <div v-if="mediaUrl" class="post-media">
          <img :src="mediaUrl" alt="Post image" class="post-image" loading="lazy"
            :width="displayPost?.mediaWidth || undefined" :height="displayPost?.mediaHeight || undefined"
            :style="displayPost?.mediaWidth && displayPost?.mediaHeight ? { aspectRatio: `${displayPost.mediaWidth}/${displayPost.mediaHeight}` } : {}" />
        </div>
      </div>
      <div class="preview-actions">
        <button class="action-button cancel" @click="repostMode = null">
          Cancelar
        </button>
        <button class="action-button publish" @click="handleRepostWithCommentSubmit">
          Publicar
        </button>
      </div>
    </div>

    <div v-if="repostMode !== 'comment'" class="post-actions">
      <button class="action-button reply" @mouseenter="isActionHovered = true" @mouseleave="isActionHovered = false"
        @click.stop="$emit('reply', displayPost?.id ?? props.post.id)">
        💬 {{ repliesCount }}
      </button>
      <div class="repost-container">
        <button class="action-button repost" @mouseenter="isActionHovered = true" @mouseleave="isActionHovered = false"
          @click.stop="repostMode = repostMode ? null : 'menu'">
          🔄 {{ repostsCount }}
        </button>
        <!-- Repost menu (shown when repost button is clicked) -->
        <div v-if="repostMode === 'menu'" class="repost-menu" @click.stop>
          <button class="repost-option" @click="handleRepost">
            Repostar
          </button>
          <button class="repost-option" @click="handleRepostWithCommentClick">
            Repostar com comentário
          </button>
          <button class="repost-option cancel" @click="repostMode = null">
            Cancelar
          </button>
        </div>
      </div>
      <button class="action-button like" :class="{ liked: isLiked }" @mouseenter="isActionHovered = true"
        @mouseleave="isActionHovered = false" @click="handleLikeToggle">
        {{ isLiked ? '❤️' : '🤍' }} {{ likesCount }}
      </button>
      <button class="action-button share" @mouseenter="isActionHovered = true" @mouseleave="isActionHovered = false"
        @click="handleShare">
        📤
      </button>
    </div>

    <div v-if="showToast" class="toast">
      Link copiado!
    </div>

    <ImageModal :isOpen="isImageModalOpen" :imageUrl="selectedImageUrl" @close="isImageModalOpen = false" />
  </div>
</template>

<style scoped>
.post-card {
  background-color: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.post-card:hover:not(.no-hover) {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.repost-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.repost-icon {
  font-size: 14px;
  color: var(--color-accent);
}

.repost-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px 8px;
  color: var(--color-text);
  cursor: pointer;
  min-width: 0;
}

.user-info strong {
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
}

.user-info strong:hover {
  color: var(--color-primary);
}

.username {
  color: var(--color-text-secondary);
  font-size: 1rem;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.timestamp {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  flex-shrink: 0;
  white-space: nowrap;
}

.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: var(--color-text-light);
  padding: 6px;
  border-radius: 9999px;
  transition: color 0.2s, background-color 0.2s, opacity 0.2s;
}

.delete-button:hover,
.delete-button:focus-visible {
  color: var(--color-error);
  background-color: var(--color-error-bg);
  outline: none;
}

.post-content {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.original-post {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.original-post:hover {
  border-color: var(--color-primary);
}

.original-post-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.original-post-content {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.post-actions {
  display: flex;
  gap: 16px;
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
}

.action-button {
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-small);
  padding: 6px 8px;
  border-radius: 9999px;
  line-height: 1;
  transition: color 0.2s, background-color 0.2s;
}

/* Per-action emphasis on hover/focus */
.action-button.reply:hover,
.action-button.reply:focus-visible {
  color: var(--color-primary);
  background-color: var(--color-primary-bg);
  outline: none;
}

.action-button.repost:hover,
.action-button.repost:focus-visible {
  color: var(--color-accent);
  background-color: var(--color-accent-bg);
  outline: none;
}

.action-button.like:hover,
.action-button.like:focus-visible {
  color: var(--color-like);
  background-color: var(--color-like-bg);
  outline: none;
}

.action-button.share:hover,
.action-button.share:focus-visible {
  color: var(--color-primary);
  background-color: var(--color-primary-bg-light);
  outline: none;
}

/* Keep liked state emphasized even when not hovering */
.action-button.liked,
.action-button.liked:hover,
.action-button.liked:focus-visible {
  color: var(--color-like);
}

.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-primary);
  color: var(--color-button-text);
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.profile-pic {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.repost-menu {
  background-color: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.repost-option {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  display: block;
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: left;
  transition: background-color 0.2s, color 0.2s;
}

.repost-option:hover {
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}

.comment-preview {
  background-color: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.comment-textarea {
  width: 100%;
  height: 60px;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
  line-height: 1.4;
  resize: none;
}

.preview-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
}

.action-button.cancel {
  color: var(--color-error);
}

.action-button.cancel:hover,
.action-button.cancel:focus-visible {
  color: var(--color-button-text);
  background-color: var(--color-error);
  outline: none;
}

.action-button.publish {
  color: var(--color-primary);
}

.action-button.publish:hover,
.action-button.publish:focus-visible {
  color: var(--color-button-text);
  background-color: var(--color-primary);
  outline: none;
}

.repost-container {
  position: relative;
}

.post-media {
  margin-top: 12px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
}

.post-image {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: cover;
  display: block;
  transition: opacity 0.2s;
}

.post-image:hover {
  opacity: 0.95;
}

@media (max-width: 768px) {
  .post-image {
    max-height: 300px;
  }
}
</style>
