<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UpdatedUser } from '../models/UserProfile'

interface Props {
  isOpen: boolean
  currentDisplayName: string
  currentBio: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  submit: [data: UpdatedUser]
}>()

const displayName = ref(props.currentDisplayName)
const bio = ref(props.currentBio)

watch(() => props.currentDisplayName, (newVal) => {
  displayName.value = newVal
})

watch(() => props.currentBio, (newVal) => {
  bio.value = newVal
})

const handleSubmit = async () => {
  try {
    emit('submit', { displayName: displayName.value, bio: bio.value })
    emit('close')
  } catch (error) {
    console.error('Error updating profile:', error)
  }
}
</script>

<template>
  <div v-if="isOpen" class="overlay" @click="emit('close')">
    <div class="modal-container" @click.stop>
      <div class="header">
        <h2 class="title">Editar Perfil</h2>
        <button class="close-button" @click="emit('close')">✕</button>
      </div>

      <form class="form" @submit.prevent="handleSubmit">
        <div class="input-group">
          <label class="label">Nome de Exibição</label>
          <input
            v-model="displayName"
            type="text"
            class="input"
            placeholder="Seu nome de exibição"
          />
        </div>
        <div class="input-group">
          <label class="label">Bio</label>
          <textarea
            v-model="bio"
            class="text-area"
            placeholder="Sua biografia"
          />
        </div>

        <div class="button-group">
          <button type="button" class="cancel-button" @click="emit('close')">
            Cancelar
          </button>
          <button type="submit" class="save-button">
            Salvar
          </button>
        </div>
      </form>
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

.form {
  padding-top: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.label {
  display: block;
  color: var(--color-text);
  font-size: var(--font-size-regular);
  margin-bottom: 8px;
  font-weight: 600;
}

.input,
.text-area {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: var(--font-size-regular);
  font-family: inherit;
}

.input:focus,
.text-area:focus {
  outline: none;
  border-color: var(--color-primary);
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.cancel-button:hover {
  background-color: var(--color-background-elevated);
}

.save-button {
  background-color: var(--color-primary);
  border: none;
  color: var(--color-button-text);
}

.save-button:hover {
  background-color: var(--color-button-hover);
}
</style>
