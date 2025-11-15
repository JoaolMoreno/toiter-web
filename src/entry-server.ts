import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter as _createRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { renderToString } from 'vue/server-renderer'
import axios from 'axios'
import App from './App.vue'
import { routes } from './router'

function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  
  const router = _createRouter({
    history: createMemoryHistory(),
    routes: routes as RouteRecordRaw[]
  })

  app.use(pinia)
  app.use(router)

  return { app, router, pinia }
}

export async function render(url: string, _manifest?: string) {
  const { app, router } = createApp()

  // Set the router to the desired URL before rendering
  await router.push(url)
  await router.isReady()

  // Get the current route to determine if we need special meta tags
  const currentRoute = router.currentRoute.value
  let head = ''

  try {
    // Generate OG tags for profile pages
    if (currentRoute.name === 'Profile' && currentRoute.params.username) {
      const username = currentRoute.params.username as string
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || process.env.API_BASE || 'http://toiter-user-service:9990/api'
        const response = await axios.get(`${API_BASE}/users/${username}`)
        const user = response.data
        
        const profileImageUrl = user.profileImageUrl || '/default-profile.png'

        const serverUrl = import.meta.env.VITE_PUBLIC_HOST || process.env.SERVER_URL || 'http://localhost:5173'

        head = `
    <title>@${username} - Toiter</title>
    <meta name="description" content="${user.bio || `Perfil de ${username} no Toiter`}" />
    <meta property="og:title" content="@${username} no Toiter" />
    <meta property="og:description" content="${user.bio || `Perfil de ${username} no Toiter`}" />
    <meta property="og:image" content="${profileImageUrl}" />
    <meta property="og:image:width" content="400" />
    <meta property="og:image:height" content="400" />
    <meta property="og:url" content="${serverUrl}/profile/${username}" />
    <meta property="og:site_name" content="Toiter" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:type" content="profile" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${username} no Toiter" />
    <meta name="twitter:description" content="${user.bio || `Perfil de ${username} no Toiter`}" />
    <meta name="twitter:image" content="${profileImageUrl}" />
        `
      } catch (error) {
        console.error('Error fetching profile data for SSR:', error)
      }
    }
    
    // Generate OG tags for thread pages
    if (currentRoute.name === 'Thread' && currentRoute.params.postId) {
      const postId = currentRoute.params.postId as string
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || process.env.API_BASE || 'http://localhost:9991/api'
        const response = await axios.get(`${API_BASE}/posts/${postId}`)
        const post = response.data
        
        const profileImageUrl = post.profileImageUrl || '/default-profile.png'

        const serverUrl = import.meta.env.VITE_PUBLIC_HOST || process.env.SERVER_URL || 'http://localhost:5173'
        const description = post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '')
        
        head = `
    <title>${post.username} no Toiter</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${post.username} no Toiter" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${profileImageUrl}" />
    <meta property="og:image:width" content="400" />
    <meta property="og:image:height" content="400" />
    <meta property="og:url" content="${serverUrl}/thread/${postId}" />
    <meta property="og:site_name" content="Toiter" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${post.username} no Toiter" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${profileImageUrl}" />
        `
      } catch (error) {
        console.error('Error fetching thread data for SSR:', error)
      }
    }
  } catch (error) {
    console.error('Error generating meta tags:', error)
  }

  // Render the app to string
  const html = await renderToString(app)

  return { html, head }
}
