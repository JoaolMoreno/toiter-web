<script setup lang="ts">
interface Props {
  content: string
}

const props = defineProps<Props>()

const urlRegex = /(https?:\/\/[^\s]+)/g

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const renderContent = () => {
  const parts = props.content.split(urlRegex)
  return parts.map((part, index) => {
    if (urlRegex.test(part) && isValidUrl(part)) {
      return {
        type: 'link',
        content: part,
        key: index
      }
    }
    return {
      type: 'text',
      content: part,
      key: index
    }
  })
}
</script>

<template>
  <p class="text-wrapper">
    <template v-for="part in renderContent()" :key="part.key">
      <a
        v-if="part.type === 'link'"
        :href="part.content"
        target="_blank"
        rel="noopener noreferrer"
        class="styled-link"
      >
        {{ part.content }}
      </a>
      <span v-else>{{ part.content }}</span>
    </template>
  </p>
</template>

<style scoped>
.text-wrapper {
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.6;
  margin: 8px 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

.styled-link {
  color: var(--color-primary);
  text-decoration: underline;
}

.styled-link:hover {
  text-decoration: none;
}
</style>
