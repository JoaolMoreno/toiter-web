<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import PasswordInput from './PasswordInput.vue'
import api from '../../services/api'

const router = useRouter()
const toast = useToast()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

const passwordsMatch = computed(() => {
  if (!confirmPassword.value) return true
  return password.value === confirmPassword.value
})

const isFormValid = computed(() => {
  return username.value && email.value && password.value && confirmPassword.value && passwordsMatch.value
})

const handleSubmit = async (e: Event) => {
  e.preventDefault()

  if (!passwordsMatch.value) {
    toast.error('As senhas não coincidem')
    return
  }

  if (!isFormValid.value) {
    toast.error('Preencha todos os campos corretamente')
    return
  }

  try {
    isLoading.value = true
    await api.post('/auth/register', {
      username: username.value,
      email: email.value,
      password: password.value
    })
    toast.success('Cadastro bem-sucedido!')
    router.push('/auth/login')
  } catch (error: any) {
    console.error('Register error:', error)
    if (error.response) {
      if (error.response.status === 400) {
        toast.error(error.response.data || 'Erro ao fazer cadastro')
      } else if (error.response.status >= 500 && error.response.status < 600) {
        toast.error('Servidor Indisponível, por favor tente mais tarde')
      } else {
        toast.error('Erro ao fazer cadastro')
      }
    } else {
      toast.error('Erro ao fazer cadastro')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form @submit="handleSubmit" class="form">
    <input
      type="text"
      placeholder="Nome"
      v-model="username"
      class="input"
      required
    />
    <input
      type="email"
      placeholder="Email"
      v-model="email"
      class="input"
      required
    />
    <PasswordInput
      v-model="password"
      placeholder="Senha"
    />
    <div class="password-confirm-wrapper">
      <PasswordInput
        v-model="confirmPassword"
        placeholder="Confirme a senha"
      />
      <p v-if="confirmPassword && !passwordsMatch" class="error-message">
        As senhas não coincidem
      </p>
    </div>
    <button
      type="submit"
      :disabled="isLoading || !isFormValid"
      :class="['button', { 'is-loading': isLoading }]"
    >
      {{ isLoading ? 'Registrando...' : 'Registrar' }}
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

.password-confirm-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.error-message {
  color: var(--color-error);
  font-size: 0.875rem;
  margin: 0;
  padding: 0 4px;
  animation: shake 0.3s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
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

.button:hover:not(:disabled) {
  background-color: var(--color-secondary);
  transform: scale(1.05);
}

.button:active:not(:disabled) {
  transform: scale(0.95);
}

.button.is-loading {
  background-color: var(--color-secondary);
  animation: pulse 0.4s infinite ease-in-out;
  cursor: not-allowed;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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
