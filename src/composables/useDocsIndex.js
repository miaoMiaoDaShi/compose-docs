import { computed, ref } from 'vue'

const indexState = ref(null)
const indexError = ref(null)
const indexLoading = ref(false)
let indexPromise = null

export function useDocsIndex() {
  const load = async () => {
    if (indexState.value) {
      return indexState.value
    }

    if (!indexPromise) {
      indexLoading.value = true
      indexPromise = fetch(`${import.meta.env.BASE_URL}docs-index.json`)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const payload = await response.json()
          indexState.value = payload
          indexError.value = null
          return payload
        })
        .catch((error) => {
          indexError.value = error
          indexPromise = null
          throw error
        })
        .finally(() => {
          indexLoading.value = false
        })
    }

    return indexPromise
  }

  const docs = computed(() => indexState.value?.docs ?? [])
  const categories = computed(() => indexState.value?.categories ?? [])
  const lastUpdated = computed(() => indexState.value?.lastUpdated ?? '未知')
  const totalDocs = computed(() => indexState.value?.totalDocs ?? 0)

  return {
    load,
    docs,
    categories,
    lastUpdated,
    totalDocs,
    index: computed(() => indexState.value),
    loading: computed(() => indexLoading.value),
    error: computed(() => indexError.value),
  }
}
