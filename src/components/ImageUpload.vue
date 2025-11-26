<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: File | null
  showPreview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPreview: true
})

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
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } else if (props.showPreview) {
    // Generate preview if not already set (e.g. passed from parent)
    // But here we rely on the file being selected via this component mostly.
    const reader = new FileReader()
    reader.onload = () => {
      imagePreview.value = reader.result as string
    }
    reader.readAsDataURL(newVal)
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

  if (props.showPreview) {
    const reader = new FileReader()
    reader.onload = () => {
      imagePreview.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
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
    <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/gif,image/webp" style="display: none"
      @change="handleFileSelect" />

    <button v-if="!imagePreview || !showPreview" type="button" class="upload-button" @click="triggerFileSelect"
      title="Adicionar imagem">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
        <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </button>

    <div v-if="showPreview && imagePreview" class="preview-container">
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
  display: inline-flex;
  align-items: center;
}

.upload-button {
  background: none;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-primary);
  transition: all 0.2s;
}

.upload-button:hover {
  background-color: var(--color-primary-bg, rgba(29, 155, 240, 0.1));
}

.preview-container {
  position: relative;
  max-width: 100%;
  margin-top: 12px;
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 16px;
  max-height: 300px;
  object-fit: cover;
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
  width: 100%;
}

@media (max-width: 768px) {
  .preview-container {
    max-width: 100%;
  }
}
</style>
