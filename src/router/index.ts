import { createRouter, createWebHistory, createMemoryHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/feed'
  },
  {
    path: '/feed',
    name: 'Feed',
    component: () => import('../views/Feed.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue')
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue')
  },
  {
    path: '/profile/:username',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/thread/:postId',
    name: 'Thread',
    component: () => import('../views/Thread.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: typeof window !== 'undefined' ? createWebHistory() : createMemoryHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth to be initialized
  if (authStore.isAuthenticated === undefined && authStore.isLoading) {
    await authStore.verifySession()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthPage = to.path.startsWith('/auth')

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
  } else if (isAuthPage && authStore.isAuthenticated) {
    next('/feed')
  } else {
    next()
  }
})

export default router
