import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login as loginService, logout as logoutService, checkSession } from '../services/auth'
import api from '../services/api'
import { User } from '../models/UserProfile'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref<boolean | undefined>(undefined)
  const user = ref<User | null>(null)
  const isLoading = ref(true)
  const router = useRouter()
  const toast = useToast()

  const clearUserData = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('username')
    delete api.defaults.headers.common['Authorization']
    user.value = null
    isAuthenticated.value = false
  }

  const verifySession = async () => {
    isLoading.value = true
    try {
      const token = localStorage.getItem('accessToken')

      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const sessionValid = await checkSession()

        if (sessionValid) {
          const { data } = await api.get('/users/me')
          user.value = {
            username: data.username,
            profileImageId: data.profileImageId as number
          }
          isAuthenticated.value = true
        } else {
          clearUserData()
        }
      } else {
        clearUserData()
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error)
      clearUserData()
    } finally {
      isLoading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      await loginService(email, password)

      // Fetch user profile data immediately after login
      const { data } = await api.get('/users/me')
      user.value = {
        username: data.username,
        profileImageId: data.profileImageId as number
      }
      isAuthenticated.value = true

      await router.push('/feed')
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data || 'Erro ao fazer login')
        } else if (error.response.status >= 500 && error.response.status < 600) {
          toast.error('Servidor Indisponível, por favor tente mais tarde')
        } else {
          toast.error('Erro ao fazer login')
        }
      } else {
        toast.error('Erro ao fazer login')
      }
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await logoutService()
      localStorage.removeItem('accessToken')
      localStorage.removeItem('username')
      delete api.defaults.headers.common['Authorization']
      user.value = null
      isAuthenticated.value = false
      await router.push('/auth/login')
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    verifySession
  }
})
