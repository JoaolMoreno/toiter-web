<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  isOpen: boolean
  title: string
  postType: 'post' | 'reply' | 'repostWithComment'
  parentPostContent?: string
  parentUsername?: string
  initialContent?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  submit: [content: string]
}>()

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
        <button
          class="close-button"
          @click="handleClose"
          :disabled="isSubmitting"
        >
          Cancelar
        </button>
        <h2 class="title">{{ title }}</h2>
        <button
          class="post-button"
          @click="handleSubmit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Postando...' : 'Postar' }}
        </button>
      </div>
      <div class="body">
        <h3 v-if="(postType === 'reply' || postType === 'repostWithComment') && parentUsername" class="username">
          {{ parentUsername }}
        </h3>
        <div v-if="(postType === 'reply' || postType === 'repostWithComment') && parentPostContent" class="post-preview">
          {{ parentPostContent }}
        </div>
        <textarea
          v-model="content"
          :placeholder="postType === 'post' ? 'No que você está pensando?' : postType === 'reply' ? 'Digite sua resposta...' : 'Adicione um comentário...'"
          class="text-area"
        />
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
  background-color: var(--color-overlay-hover);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: var(--color-background-alt);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  width: 500px;
  max-width: 90vw;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.close-button {
  background: none;
  color: var(--color-text);
  border: none;
  font-size: var(--font-size-regular);
  font-weight: 600;
  cursor: pointer;
}

.close-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.close-button:hover:not(:disabled) {
  color: var(--color-primary);
}

.title {
  color: var(--color-text);
  font-size: var(--font-size-large);
  margin: 0;
}

.post-button {
  background-color: var(--color-primary);
  color: var(--color-button-text);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: var(--font-size-regular);
  font-weight: 600;
  cursor: pointer;
}

.post-button:disabled {
  background-color: var(--color-secondary);
  cursor: not-allowed;
  opacity: 0.7;
}

.post-button:hover:not(:disabled) {
  background-color: var(--color-button-hover);
}

.body {
  margin-top: 16px;
}

.username {
  font-size: var(--font-size-regular);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}

.post-preview {
  background-color: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  color: var(--color-text);
}

.text-area {
  width: 100%;
  min-height: 120px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  background-color: var(--color-background-elevated);
  color: var(--color-text);
  font-size: var(--font-size-regular);
  resize: vertical;
  font-family: inherit;
}

.text-area:focus {
  outline: none;
  border-color: var(--color-primary);
}
</style>
