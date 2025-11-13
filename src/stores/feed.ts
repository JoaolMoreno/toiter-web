import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PostData } from '../models/PostData'

export const useFeedStore = defineStore('feed', () => {
  const posts = ref<PostData[]>([])
  const page = ref(0)
  const hasMore = ref(true)
  const loading = ref(false)

  const setPosts = (newPosts: PostData[] | ((prev: PostData[]) => PostData[])) => {
    if (typeof newPosts === 'function') {
      posts.value = newPosts(posts.value)
    } else {
      posts.value = newPosts
    }
  }

  const setPage = (newPage: number | ((prev: number) => number)) => {
    if (typeof newPage === 'function') {
      page.value = newPage(page.value)
    } else {
      page.value = newPage
    }
  }

  const setHasMore = (value: boolean) => {
    hasMore.value = value
  }

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const resetFeed = () => {
    posts.value = []
    page.value = 0
    hasMore.value = true
    loading.value = false
  }

  return {
    posts,
    page,
    hasMore,
    loading,
    setPosts,
    setPage,
    setHasMore,
    setLoading,
    resetFeed
  }
})
