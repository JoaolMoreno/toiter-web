<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: File | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [file: File | null]
}>()

const imagePreview = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const errorMessage = ref<string>('')

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    imagePreview.value = null
    errorMessage.value = ''
  }
})

const validateFile = (file: File): boolean => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    errorMessage.value = 'Tipo de arquivo inválido. Use JPEG, PNG, GIF ou WebP.'
    return false
  }
  
  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = 'Arquivo muito grande. Máximo 10MB.'
    return false
  }
  
  errorMessage.value = ''
  return true
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!validateFile(file)) {
    emit('update:modelValue', null)
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }
  
  emit('update:modelValue', file)
  
  const reader = new FileReader()
  reader.onload = () => {
    imagePreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

const handleRemove = () => {
  imagePreview.value = null
  errorMessage.value = ''
  emit('update:modelValue', null)
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const triggerFileSelect = () => {
  fileInputRef.value?.click()
}
</script>

<template>
  <div class="image-upload">
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/gif,image/webp"
      style="display: none"
      @change="handleFileSelect"
    />
    
    <button
      v-if="!imagePreview"
      type="button"
      class="upload-button"
      @click="triggerFileSelect"
      title="Adicionar imagem"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <div v-if="imagePreview" class="preview-container">
      <img :src="imagePreview" alt="Preview" class="preview-image" />
      <button type="button" class="remove-button" @click="handleRemove" title="Remover imagem">
        ✕
      </button>
    </div>
    
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.image-upload {
  margin-top: 8px;
}

.upload-button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-primary);
  transition: all 0.2s;
}

.upload-button:hover {
  background-color: var(--color-primary-bg);
  border-color: var(--color-primary);
}

.preview-container {
  position: relative;
  max-width: 300px;
  margin-top: 12px;
  border-radius: 16px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 16px;
}

.remove-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-button:hover {
  background-color: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.error-message {
  color: var(--color-error);
  font-size: 0.875rem;
  margin-top: 8px;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .preview-container {
    max-width: 100%;
  }
}
</style>
