<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { PostData } from '../models/PostData'
import { useAuthStore } from '../stores/auth'
import { likePost, unlikePost, deletePost } from '../services/postService'

interface Props {
  post: PostData
}

const props = defineProps<Props>()
const router = useRouter()
const authStore = useAuthStore()

const isLiked = ref(props.post.isLiked)
const likesCount = ref(props.post.likesCount)
const repliesCount = ref(props.post.repliesCount)
const repostsCount = ref(props.post.repostsCount)
const isRemoved = ref(false)
const showToast = ref(false)

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
  try {
    if (isLiked.value) {
      await unlikePost(props.post.id)
      likesCount.value--
      isLiked.value = false
    } else {
      await likePost(props.post.id)
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
  router.push(`/thread/${props.post.id}`)
}

const handleProfileClick = (e: Event) => {
  e.stopPropagation()
  router.push(`/profile/${props.post.username}`)
}

const handleShare = (e: Event) => {
  e.stopPropagation()
  const shareUrl = `${window.location.origin}/thread/${props.post.id}`
  navigator.clipboard.writeText(shareUrl)
  showToast.value = true
  setTimeout(() => showToast.value = false, 2000)
}
</script>

<template>
  <div v-if="!isRemoved" class="post-card" @click="handlePostClick">
    <div class="post-header">
      <div class="user-info" @click="handleProfileClick">
        <strong>{{ post.username }}</strong>
        <span class="timestamp">· {{ formatTimestamp(post.createdAt) }}</span>
      </div>
      <button
        v-if="authStore.user?.username === post.username"
        class="delete-button"
        @click.stop="handleDelete"
      >
        🗑️
      </button>
    </div>
    
    <div class="post-content">
      {{ post.content }}
    </div>
    
    <div class="post-actions">
      <button class="action-button" @click.stop>
        💬 {{ repliesCount }}
      </button>
      <button class="action-button" @click.stop>
        🔄 {{ repostsCount }}
      </button>
      <button
        class="action-button"
        :class="{ liked: isLiked }"
        @click="handleLikeToggle"
      >
        {{ isLiked ? '❤️' : '🤍' }} {{ likesCount }}
      </button>
      <button class="action-button" @click="handleShare">
        📤
      </button>
    </div>
    
    <div v-if="showToast" class="toast">
      Link copiado!
    </div>
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
}

.post-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
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
  gap: 8px;
  color: var(--color-text);
  cursor: pointer;
}

.user-info strong {
  font-weight: bold;
}

.user-info strong:hover {
  color: var(--color-primary);
}

.timestamp {
  color: var(--color-text-light);
  font-size: var(--font-size-small);
}

.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.delete-button:hover {
  opacity: 1;
}

.post-content {
  color: var(--color-text);
  margin-bottom: 12px;
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
  transition: color 0.2s;
}

.action-button:hover {
  color: var(--color-primary);
}

.action-button.liked {
  color: #e74c3c;
}

.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-primary);
  color: white;
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
</style>
