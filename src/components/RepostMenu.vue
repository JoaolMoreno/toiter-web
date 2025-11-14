<script setup lang="ts">
interface Props {
  isOpen: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
  repost: []
  quoteRepost: []
}>()

const handleRepost = () => {
  emit('repost')
  emit('close')
}

const handleQuoteRepost = () => {
  emit('quoteRepost')
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="menu-overlay" @click="emit('close')">
    <div class="menu-container" @click.stop>
      <button class="menu-item" @click="handleRepost">
        Repostar
      </button>
      <button class="menu-item" @click="handleQuoteRepost">
        Repostar com comentário
      </button>
    </div>
  </div>
</template>

<style scoped>
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.menu-container {
  background-color: var(--color-menu-background);
  border-radius: 10px;
  width: 300px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
}

.menu-item {
  background: none;
  border: none;
  color: var(--color-text);
  padding: 10px;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
}

.menu-item:hover {
  background-color: var(--color-menu-hover);
}
</style>
