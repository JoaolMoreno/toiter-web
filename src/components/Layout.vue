<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const imageUrl = ref<string>('')
const imageLoading = ref(true)
const dropdownVisible = ref(false)

const isAuthPage = computed(() => route.path.startsWith('/auth'))

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

const loadProfileImage = async () => {
  if (!authStore.user) return

  imageLoading.value = true
  imageUrl.value = authStore.user.profileImageUrl || '/default-profile.png'
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
    <header class="header" @click="dropdownVisible = false">
      <div class="header-col header-left">
        <button v-if="authStore.isAuthenticated" class="profile-button" @click.stop="toggleDropdown">
          <div v-if="imageLoading" class="loading-profile-image" />
          <img v-else :src="imageUrl" alt="Profile" class="profile-image" @error="imageUrl = '/default-profile.png'" />
        </button>
        <div v-if="dropdownVisible" class="dropdown-menu" @click.stop>
          <button @click="handleProfileClick(); dropdownVisible = false">Meu Perfil</button>
          <button @click="handleThemeToggle(); dropdownVisible = false">Trocar tema</button>
          <button @click="handleLogout(); dropdownVisible = false" class="logout-option">Logout</button>
        </div>
      </div>
      <div class="header-col header-center">
        <h1 class="app-name" @click="handleHomeClick">toiter</h1>
      </div>
      <div class="header-col header-right">
        <button v-if="!authStore.isAuthenticated" class="login-button" @click="handleLogin">
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
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-col {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  min-width: 0;
}

.header-center {
  justify-content: center;
}

.header-left {
  justify-content: flex-start;
}

.header-right {
  justify-content: flex-end;
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
  text-align: center;
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

.login-button:hover {
  background-color: var(--color-secondary);
  transform: translateY(-1px);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 12px;
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 20;
  min-width: 170px;
  padding: 8px 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dropdown-menu button {
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: var(--font-size-regular);
  transition: background 0.2s, color 0.2s;
}

.dropdown-menu button:not(.logout-option):hover {
  background: var(--color-background-alt);
}

.dropdown-menu button.logout-option {
  background: #e74c3c !important;
  color: #fff !important;
  font-weight: 600;
}

.dropdown-menu button.logout-option:hover {
  background: #c0392b !important;
  color: #fff !important;
}

.main {
  /* Add any main content styles if needed */
}
</style>
