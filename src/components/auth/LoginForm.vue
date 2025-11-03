<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import PasswordInput from './PasswordInput.vue'

const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  isLoading.value = true
  try {
    await authStore.login(email.value, password.value)
  } catch (error) {
    console.error('Erro ao fazer login:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form @submit="handleSubmit" class="form">
    <input
      type="text"
      placeholder="Email ou Username"
      v-model="email"
      class="input"
    />
    <PasswordInput
      v-model="password"
      placeholder="Senha"
    />
    <button
      type="submit"
      :disabled="isLoading"
      :class="['button', { 'is-loading': isLoading }]"
    >
      {{ isLoading ? 'Entrando...' : 'Entrar' }}
    </button>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 300px;
}

.input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background-alt);
  color: var(--color-text);
  font-size: var(--font-size-regular);
  margin: 0;
  height: 44px;
}

.button {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background-color: var(--color-primary);
  color: white;
  font-size: var(--font-size-regular);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.button:hover {
  background-color: var(--color-secondary);
  transform: scale(1.05);
}

.button:active {
  transform: scale(0.95);
}

.button.is-loading {
  background-color: var(--color-secondary);
  animation: pulse 0.4s infinite ease-in-out;
  cursor: not-allowed;
}

.button:disabled {
  cursor: not-allowed;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}
</style>
