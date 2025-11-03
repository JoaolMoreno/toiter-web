<script setup lang="ts">
import LoginForm from '../../components/auth/LoginForm.vue'

// Set document title
if (typeof document !== 'undefined') {
  document.title = 'Login - Toiter'
}
</script>

<template>
  <div class="container">
    <h1 class="title">Toiter</h1>
    <p class="subtitle">Faça login na sua conta</p>
    <LoginForm />
    <p class="redirect">
      Não tem uma conta? <router-link to="/auth/register">Registre-se</router-link>
    </p>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-background);
  animation: fadeIn 0.5s;
}

.title {
  color: var(--color-primary);
  font-size: var(--font-size-large);
  margin-bottom: 16px;
}

.subtitle {
  margin-bottom: 20px;
  color: var(--color-text);
  font-size: var(--font-size-regular);
}

.redirect {
  margin-top: 20px;
  color: var(--color-text);
}

.redirect a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: bold;
}

.redirect a:hover {
  text-decoration: underline;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
