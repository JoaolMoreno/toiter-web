<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Layout from './components/Layout.vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initializeTheme()
})
</script>

<template>
  <Layout>
    <RouterView />
  </Layout>
</template>

<style>
@import './globals.css';
</style>
