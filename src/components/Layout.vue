<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { getImageById } from '../services/imageService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const imageUrl = ref<string>('')
const imageLoading = ref(true)

const isAuthPage = computed(() => route.path.startsWith('/auth'))

const loadProfileImage = async () => {
  if (!authStore.user) return
  
  imageLoading.value = true
  if (authStore.user.profileImageId) {
    try {
      const url = await getImageById(authStore.user.profileImageId)
      imageUrl.value = url
    } catch (error) {
      console.error('Error loading profile image:', error)
      imageUrl.value = '/default-profile.png'
    }
  } else {
    imageUrl.value = '/default-profile.png'
  }
  imageLoading.value = false
}

const handleProfileClick = () => {
  if (authStore.user?.username) {
    router.push(`/profile/${authStore.user.username}`)
  }
}

const handleLogout = () => {
  authStore.logout()
}

const handleLogin = () => {
  router.push('/auth/login')
}

const handleHomeClick = () => {
  router.push('/')
}

const handleThemeToggle = () => {
  themeStore.toggleTheme()
}

watch(() => authStore.user, () => {
  if (authStore.user) {
    loadProfileImage()
  }
}, { immediate: true })

onMounted(() => {
  if (authStore.user) {
    loadProfileImage()
  }
})
</script>

<template>
  <div v-if="!isAuthPage">
    <header class="header">
      <div class="header-left">
        <button v-if="authStore.isAuthenticated" class="profile-button" @click="handleProfileClick">
          <div v-if="imageLoading" class="loading-profile-image" />
          <img 
            v-else
            :src="imageUrl"
            alt="Profile"
            class="profile-image"
            @error="imageUrl = '/default-profile.png'"
          />
        </button>
        <button 
          class="theme-toggle" 
          @click="handleThemeToggle"
          :aria-label="themeStore.theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
          :title="themeStore.theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
        >
          {{ themeStore.theme === 'dark' ? '☀️' : '🌙' }}
        </button>
      </div>
      <h1 class="app-name" @click="handleHomeClick">toiter</h1>
      <div class="header-right">
        <button v-if="authStore.isAuthenticated" class="logout-button" @click="handleLogout">
          Logout
        </button>
        <button v-else class="login-button" @click="handleLogin">
          Login
        </button>
      </div>
    </header>
  </div>
  
  <main class="main">
    <div v-if="authStore.isLoading && !authStore.isAuthenticated" class="loading-state">
      Carregando...
    </div>
    <slot v-else />
  </main>
</template>

<style scoped>
.header {
  background-color: var(--color-background-elevated);
  padding: 0 24px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.loading-state {
  color: var(--color-text);
  font-size: var(--font-size-regular);
  text-align: center;
  padding: 40px;
}

.app-name {
  color: var(--color-primary);
  font-size: var(--font-size-xlarge);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  padding-bottom: 2px;
  border-bottom: 2px solid transparent;
  margin: 16px 0;
}

.app-name:hover {
  opacity: 0.8;
  border-bottom: 2px solid var(--color-primary);
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary);
}

.profile-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.profile-button:hover {
  opacity: 0.8;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  background: none;
  border: 2px solid var(--color-border);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.logout-button,
.login-button {
  background-color: var(--color-primary);
  color: var(--color-text);
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-regular);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover,
.login-button:hover {
  background-color: var(--color-secondary);
  transform: translateY(-1px);
}

.loading-profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  background: var(--color-background-alt);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

.main {
  /* Add any main content styles if needed */
}
</style>
