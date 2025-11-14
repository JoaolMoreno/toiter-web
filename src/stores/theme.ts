import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('dark')
  const isInitialized = ref(false)

  // Initialize theme from localStorage or system preference
  const initializeTheme = () => {
    if (isInitialized.value) return

    const storedTheme = localStorage.getItem('theme') as Theme | null
    
    if (storedTheme) {
      theme.value = storedTheme
    } else {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }

    applyTheme(theme.value)
    isInitialized.value = true
  }

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // Toggle between light and dark themes
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  // Set a specific theme
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  // Watch for theme changes and persist to localStorage
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  })

  return {
    theme,
    isInitialized,
    initializeTheme,
    toggleTheme,
    setTheme
  }
})
