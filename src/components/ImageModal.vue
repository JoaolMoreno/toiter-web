<script setup lang="ts">
interface Props {
  isOpen: boolean
  imageUrl: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const handleOverlayClick = () => {
  emit('close')
}

const handleImageClick = (e: Event) => {
  e.stopPropagation()
}
</script>

<template>
  <div v-if="isOpen" class="image-modal-overlay" @click="handleOverlayClick">
    <div class="image-modal-content">
      <button class="close-button" @click="emit('close')" title="Fechar">
        ✕
      </button>
      <img :src="imageUrl" alt="Imagem em tela cheia" class="full-image" @click="handleImageClick" />
    </div>
  </div>
</template>

<style scoped>
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button {
  position: absolute;
  top: -40px;
  right: 0;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 2001;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.full-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .image-modal-overlay {
    padding: 0;
  }
  
  .image-modal-content {
    max-width: 100vw;
    max-height: 100vh;
  }
  
  .full-image {
    max-height: 100vh;
    border-radius: 0;
  }
  
  .close-button {
    top: 10px;
    right: 10px;
  }
}
</style>
