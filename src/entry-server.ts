import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter as _createRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { renderToString } from 'vue/server-renderer'
import axios from 'axios'
import App from './App.vue'
import { routes } from './router'

function getOptimizedImageUrl(url: string, width = 400, height = 400): string {
  if (!url || url.startsWith('/')) return url

  const bucketDomain = 'bucket.joaoplmoreno.com'

  if (url.includes(bucketDomain)) {
    return url.replace(
      `${bucketDomain}/`,
      `${bucketDomain}/cdn-cgi/image/width=${width},height=${height},fit=cover,format=auto/`
    )
  }

  return url
}
// -----------------------------

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

  /**
   * Constraints for WhatsApp Link Previews:
   * 
   * 1. <head> must appear within the first 300 KB of HTML.
   * 2. <og:title>, <og:description>, <og:url> must be in <head> and not empty.
   * 3. <og:title>: Content title WITHOUT brand indication. Max 2 lines.
   * 4. <og:description>: Content description. Max 2 lines, up to 80 characters.
   * 5. <og:url>: Canonical URL, absolute, no decorators/session params.
   * 6. <og:image>: Absolute URL, < 600 KB, >= 300px width, aspect ratio <= 4:1.
   */

  try {
    // Generate OG tags for profile pages
    if (currentRoute.name === 'Profile' && currentRoute.params.username) {
      const username = currentRoute.params.username as string
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || process.env.API_BASE || 'http://toiter-user-service:9990/api'
        const response = await axios.get(`${API_BASE}/users/${username}`)
        const user = response.data

        let profileImageUrl = user.profileImageUrl || '/default-profile.png'
        if (user.profileImageUrl) {
          profileImageUrl = getOptimizedImageUrl(user.profileImageUrl, 400, 400)
        }

        const serverUrl = import.meta.env.VITE_PUBLIC_HOST || process.env.SERVER_URL || 'http://localhost:5173'
        const displayName = user.displayName || username
        const description = (user.bio || `Perfil de ${displayName}`).substring(0, 80)

        head = `
    <title>${displayName} (@${username}) - Toiter</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${displayName} (@${username})" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${profileImageUrl}" />
    <meta property="og:image:width" content="400" />
    <meta property="og:image:height" content="400" />
    <meta property="og:url" content="${serverUrl}/profile/${username}" />
    <meta property="og:site_name" content="Toiter" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:type" content="profile" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${displayName} (@${username})" />
    <meta name="twitter:description" content="${description}" />
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

        let ogImageUrl = post.profileImageUrl || '/default-profile.png'
        let ogWidth = '400'
        let ogHeight = '400'

        if (post.mediaUrl) {
          ogImageUrl = getOptimizedImageUrl(post.mediaUrl, post.mediaWidth || 1200, post.mediaHeight || 1200)
          ogWidth = (post.mediaWidth || 1200).toString()
          ogHeight = (post.mediaHeight || 1200).toString()
        } else if (post.profileImageUrl) {
          ogImageUrl = getOptimizedImageUrl(post.profileImageUrl, 400, 400)
        }

        const serverUrl = import.meta.env.VITE_PUBLIC_HOST || process.env.SERVER_URL || 'http://localhost:5173'
        const description = post.content.substring(0, 80) + (post.content.length > 80 ? '...' : '')
        const title = `${post.displayName || post.username}`

        head = `
    <title>${title} on Toiter</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="${ogWidth}" />
    <meta property="og:image:height" content="${ogHeight}" />
    <meta property="og:url" content="${serverUrl}/thread/${postId}" />
    <meta property="og:site_name" content="Toiter" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
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