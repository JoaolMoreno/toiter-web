<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleBack = () => {
  router.push('/feed')
}

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.title = 'Chat - Toiter'
  }
})
</script>

<template>
  <div class="container">
    <div class="chat-container">
      <button class="back-button" @click="handleBack">
        ← Voltar para Feed
      </button>
      
      <div class="content">
        <h1 class="title">Chat</h1>
        <p class="message">
          Funcionalidade de chat em desenvolvimento.
        </p>
        <p class="submessage">
          Em breve você poderá conversar com outros usuários aqui!
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-background);
  min-height: 100vh;
}

.chat-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

.back-button {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-regular);
  padding: 16px 0;
}

.back-button:hover {
  text-decoration: underline;
}

.content {
  text-align: center;
  padding: 48px 24px;
}

.title {
  color: var(--color-text);
  font-size: var(--font-size-xlarge);
  margin-bottom: 24px;
}

.message {
  color: var(--color-text);
  font-size: var(--font-size-large);
  margin-bottom: 16px;
}

.submessage {
  color: var(--color-text-light);
  font-size: var(--font-size-regular);
}
</style>

