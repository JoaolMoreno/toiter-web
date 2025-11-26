<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

interface Props {
  isOpen: boolean
  title: string
  postType: 'post' | 'reply' | 'repostWithComment'
  parentPostContent?: string
  parentUsername?: string
  parentDisplayName?: string
  parentProfilePicture?: string
  initialContent?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  submit: [content: string]
}>()

const authStore = useAuthStore()
const content = ref(props.initialContent || '')
const isSubmitting = ref(false)

watch(() => props.initialContent, (newVal) => {
  content.value = newVal || ''
})

const handleSubmit = async () => {
  try {
    if (!content.value || isSubmitting.value) return
    isSubmitting.value = true
    emit('submit', content.value)
    content.value = ''
  } catch (error) {
    console.error('Erro ao postar:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  if (!isSubmitting.value) {
    emit('close')
  }
}
</script>

<template>
  <div v-if="isOpen" class="overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="header">
        <button class="close-button" @click="handleClose" :disabled="isSubmitting">
          ✕
        </button>
        <button class="post-button" @click="handleSubmit" :disabled="isSubmitting || !content.trim()">
          {{ isSubmitting ? 'Postando...' : 'Responder' }}
        </button>
      </div>

      <div class="body">
        <!-- Parent Post Preview (for replies) -->
        <div v-if="postType === 'reply' && parentPostContent" class="reply-context">
          <div class="avatar-column">
            <img :src="parentProfilePicture || '/default-profile.png'" class="avatar" />
            <div class="connector-line"></div>
          </div>
          <div class="content-column">
            <div class="user-meta">
              <span class="display-name">{{ parentDisplayName || parentUsername }}</span>
              <span class="username">@{{ parentUsername }}</span>
              <span class="dot">·</span>
              <span class="time">1h</span>
            </div>
            <div class="post-text">{{ parentPostContent }}</div>
            <div class="replying-to">
              Respondendo a <span class="highlight">@{{ parentUsername }}</span>
            </div>
          </div>
        </div>

        <!-- Current User Reply Area -->
        <div class="reply-input-area">
          <div class="avatar-column">
            <img :src="authStore.user?.profileImageUrl || '/default-profile.png'" class="avatar" />
          </div>
          <div class="content-column">
            <textarea v-model="content"
              :placeholder="postType === 'post' ? 'No que você está pensando?' : 'Postar sua resposta'"
              class="text-area" ref="textarea" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(91, 112, 131, 0.4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 5%;
  z-index: 1000;
}

.modal-container {
  background-color: var(--color-background);
  border-radius: 16px;
  width: 600px;
  max-width: 90vw;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: var(--color-background-elevated);
}

.post-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.post-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reply-context,
.reply-input-area {
  display: flex;
  gap: 12px;
}

.avatar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48px;
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.connector-line {
  width: 2px;
  background-color: var(--color-border);
  flex-grow: 1;
  margin-top: 4px;
  margin-bottom: 4px;
  min-height: 20px;
}

.content-column {
  flex-grow: 1;
  padding-top: 4px;
}

.user-meta {
  display: flex;
  gap: 4px;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.display-name {
  font-weight: 700;
  color: var(--color-text);
}

.username,
.time,
.dot {
  color: var(--color-text-secondary);
}

.post-text {
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 12px;
}

.replying-to {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin-bottom: 16px;
}

.highlight {
  color: var(--color-primary);
}

.text-area {
  width: 100%;
  min-height: 120px;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 1.25rem;
  font-family: inherit;
  resize: none;
  outline: none;
  padding: 0;
  margin-top: 8px;
}

.text-area::placeholder {
  color: var(--color-text-secondary);
}
</style>
