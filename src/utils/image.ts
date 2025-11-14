export const getSafeImageUrl = (url: string | null | undefined, fallback: string = '/default-profile.png'): string => {
  if (!url) return fallback
  return import.meta.env.DEV ? url.replace('https://', 'http://') : url
}

export const onImgError = (e: Event, fallback: string = '/default-profile.png') => {
  const img = e.target as HTMLImageElement
  if (!img) return
  // Avoid infinite loop if the fallback is missing
  if (!img.src.endsWith(fallback)) {
    img.src = fallback
  }
}

