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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.menu-container {
  background-color: #1c1c1e;
  border-radius: 10px;
  width: 300px;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.menu-item {
  background: none;
  border: none;
  color: white;
  padding: 10px;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
}

.menu-item:hover {
  background-color: #2c2c2e;
}
</style>
