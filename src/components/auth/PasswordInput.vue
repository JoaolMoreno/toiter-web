<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="input-wrapper">
    <input
      :type="showPassword ? 'text' : 'password'"
      :value="modelValue"
      @input="handleInput"
      :placeholder="placeholder"
      class="styled-input"
    />
    <button
      type="button"
      class="eye-button"
      @click="showPassword = !showPassword"
    >
      {{ showPassword ? '👁️' : '👁️‍🗨️' }}
    </button>
  </div>
</template>

<style scoped>
.input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0;
}

.styled-input {
  width: 100%;
  padding: 12px;
  padding-right: 40px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background-alt);
  color: var(--color-text);
  font-size: var(--font-size-regular);
  margin: 0;
  height: 44px;
}

.eye-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  height: 20px;
  margin: 0;
}
</style>
