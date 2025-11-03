<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  isOpen: boolean
  type: 'profile' | 'header'
  currentImage?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  submit: [file: File]
}>()

const imagePreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const isSubmitting = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    imagePreview.value = null
    selectedFile.value = null
  }
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  selectedFile.value = file
  
  const reader = new FileReader()
  reader.onload = () => {
    imagePreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  
  if (!file || !file.type.startsWith('image/')) return
  
  selectedFile.value = file
  
  const reader = new FileReader()
  reader.onload = () => {
    imagePreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

const handleSubmit = async () => {
  if (!selectedFile.value || isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    emit('submit', selectedFile.value)
    emit('close')
  } catch (error) {
    console.error('Error uploading image:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="overlay" @click="emit('close')">
    <div class="modal-container" @click.stop>
      <div class="header">
        <h2 class="title">
          {{ type === 'profile' ? 'Editar Foto de Perfil' : 'Editar Foto de Capa' }}
        </h2>
        <button class="close-button" @click="emit('close')">✕</button>
      </div>

      <div class="content">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileSelect"
        />
        
        <div
          v-if="!imagePreview"
          class="dropzone"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @click="triggerFileSelect"
        >
          <p>Arraste uma imagem aqui ou clique para selecionar</p>
        </div>
        
        <div v-else class="preview-container">
          <img
            :src="imagePreview"
            alt="Preview"
            :class="['preview-image', type === 'profile' ? 'profile' : 'header']"
          />
          <button class="change-button" @click="triggerFileSelect">
            Trocar Imagem
          </button>
        </div>

        <div class="button-group">
          <button class="cancel-button" @click="emit('close')" :disabled="isSubmitting">
            Cancelar
          </button>
          <button
            class="save-button"
            :disabled="!selectedFile || isSubmitting"
            @click="handleSubmit"
          >
            {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
          </button>
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: var(--color-background-alt);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  width: 600px;
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
  margin-bottom: 20px;
}

.title {
  color: var(--color-text);
  font-size: var(--font-size-large);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  opacity: 0.7;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dropzone {
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-light);
}

.dropzone:hover {
  border-color: var(--color-primary);
  background-color: var(--color-background-elevated);
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.preview-image {
  max-width: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.preview-image.profile {
  width: 200px;
  height: 200px;
  border-radius: 50%;
}

.preview-image.header {
  width: 100%;
  max-height: 200px;
}

.change-button {
  padding: 8px 16px;
  background-color: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
}

.change-button:hover {
  background-color: var(--color-background);
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.cancel-button,
.save-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: var(--font-size-regular);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.cancel-button:hover:not(:disabled) {
  background-color: var(--color-background-elevated);
}

.save-button {
  background-color: var(--color-primary);
  border: none;
  color: white;
}

.save-button:hover:not(:disabled) {
  background-color: var(--color-button-hover);
}

.save-button:disabled,
.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
