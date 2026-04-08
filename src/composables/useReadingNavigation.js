import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const TOP_OFFSET = 112

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export function useReadingNavigation({ articleRef, headings, state, slug }) {
  const activeHeadingId = ref('')
  const readingProgress = ref(0)
  const showBackToTop = ref(false)
  let headingObserver = null

  const articleHeadings = computed(() =>
    Array.from(articleRef.value?.querySelectorAll('h2[id], h3[id]') ?? []),
  )

  const updateProgress = () => {
    const article = articleRef.value

    if (!article) {
      readingProgress.value = 0
      showBackToTop.value = false
      return
    }

    const rect = article.getBoundingClientRect()
    const total = Math.max(article.offsetHeight - window.innerHeight + TOP_OFFSET, 1)
    const progressed = clamp(TOP_OFFSET - rect.top, 0, total)

    readingProgress.value = Math.round((progressed / total) * 100)
    showBackToTop.value = progressed > 320
  }

  const disconnectObserver = () => {
    if (headingObserver) {
      headingObserver.disconnect()
      headingObserver = null
    }
  }

  const applyActiveHeading = (headingsInDom) => {
    const passedHeadings = headingsInDom.filter((heading) => heading.getBoundingClientRect().top <= 140)

    if (passedHeadings.length) {
      activeHeadingId.value = passedHeadings[passedHeadings.length - 1].id
      return
    }

    activeHeadingId.value = headingsInDom[0]?.id ?? ''
  }

  const observeHeadings = async () => {
    disconnectObserver()

    if (state.value !== 'ready' || !articleRef.value || !headings.value.length) {
      activeHeadingId.value = ''
      readingProgress.value = 0
      showBackToTop.value = false
      return
    }

    await nextTick()

    const headingsInDom = articleHeadings.value
    if (!headingsInDom.length) {
      activeHeadingId.value = ''
      return
    }

    applyActiveHeading(headingsInDom)
    updateProgress()

    headingObserver = new IntersectionObserver(
      (entries) => {
        const visibleHeadings = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)

        if (visibleHeadings.length) {
          activeHeadingId.value = visibleHeadings[0].target.id
        } else {
          applyActiveHeading(headingsInDom)
        }

        updateProgress()
      },
      {
        rootMargin: '-96px 0px -55% 0px',
        threshold: [0, 1],
      },
    )

    headingsInDom.forEach((heading) => headingObserver.observe(heading))
  }

  const scrollToHeading = (id, behavior = 'smooth') => {
    const target = articleRef.value?.querySelector(`#${CSS.escape(id)}`)
    if (!target) {
      return false
    }

    const top = window.scrollY + target.getBoundingClientRect().top - TOP_OFFSET
    window.scrollTo({ top: Math.max(top, 0), behavior })
    activeHeadingId.value = id
    history.replaceState(null, '', `#${id}`)

    // Make deep-linked headings announceable to keyboard and assistive tech users.
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1')
    }
    target.focus({ preventScroll: true })
    return true
  }

  const jumpToHeading = (id) => {
    if (!id) {
      return
    }

    scrollToHeading(id, 'smooth')
  }

  const syncFromHash = () => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) {
      updateProgress()
      return
    }

    const found = scrollToHeading(decodeURIComponent(hash), 'auto')
    if (!found) {
      updateProgress()
    }
  }

  const scrollToTop = () => {
    const articleTop = articleRef.value
      ? window.scrollY + articleRef.value.getBoundingClientRect().top - TOP_OFFSET
      : 0

    window.scrollTo({
      top: Math.max(articleTop, 0),
      behavior: 'smooth',
    })
  }

  const onScroll = () => {
    updateProgress()

    if (!headingObserver && articleHeadings.value.length) {
      applyActiveHeading(articleHeadings.value)
    }
  }

  watch([state, headings, slug], async () => {
    await observeHeadings()
    syncFromHash()
  })

  watch(articleRef, () => {
    observeHeadings()
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', onScroll, { passive: true })
  }

  onBeforeUnmount(() => {
    disconnectObserver()
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', onScroll)
    }
  })

  return {
    activeHeadingId: computed(() => activeHeadingId.value),
    readingProgress: computed(() => readingProgress.value),
    showBackToTop: computed(() => showBackToTop.value),
    jumpToHeading,
    scrollToTop,
    syncFromHash,
  }
}
