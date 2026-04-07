import { computed, ref } from 'vue'

const contentCache = ref({})
const contentErrors = ref({})
const loadingMap = ref({})

export function useDocContent() {
  const load = async (doc) => {
    if (!doc) {
      throw new Error('Doc metadata is required')
    }

    if (contentCache.value[doc.slug]) {
      return contentCache.value[doc.slug]
    }

    loadingMap.value = { ...loadingMap.value, [doc.slug]: true }

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}${doc.path}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const markdown = await response.text()
      contentCache.value = { ...contentCache.value, [doc.slug]: markdown }
      contentErrors.value = { ...contentErrors.value, [doc.slug]: null }
      return markdown
    } catch (error) {
      contentErrors.value = { ...contentErrors.value, [doc.slug]: error }
      throw error
    } finally {
      loadingMap.value = { ...loadingMap.value, [doc.slug]: false }
    }
  }

  return {
    load,
    getContent: (slug) => computed(() => contentCache.value[slug] ?? ''),
    getError: (slug) => computed(() => contentErrors.value[slug] ?? null),
    isLoading: (slug) => computed(() => Boolean(loadingMap.value[slug])),
  }
}
