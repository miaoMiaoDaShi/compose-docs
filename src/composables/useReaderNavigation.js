import { computed } from 'vue'

export function useReaderNavigation(docs, currentSlug) {
  const currentIndex = computed(() => docs.value.findIndex((doc) => doc.slug === currentSlug.value))
  const currentDoc = computed(() => docs.value[currentIndex.value] ?? null)
  const previousDoc = computed(() => (currentIndex.value > 0 ? docs.value[currentIndex.value - 1] : null))
  const nextDoc = computed(() => (
    currentIndex.value >= 0 && currentIndex.value < docs.value.length - 1
      ? docs.value[currentIndex.value + 1]
      : null
  ))
  const progressText = computed(() => {
    if (currentIndex.value < 0 || docs.value.length === 0) {
      return '0 / 0'
    }

    return `${currentIndex.value + 1} / ${docs.value.length}`
  })
  const progressPercent = computed(() => {
    if (currentIndex.value < 0 || docs.value.length === 0) {
      return 0
    }

    return Math.round(((currentIndex.value + 1) / docs.value.length) * 100)
  })

  return {
    currentIndex,
    currentDoc,
    previousDoc,
    nextDoc,
    progressText,
    progressPercent,
  }
}
