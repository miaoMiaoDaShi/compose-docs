<template>
  <div class="page-shell doc-page">
    <a href="#doc-content" class="skip-link">跳到正文</a>
    <header
      class="top-app-bar compact-bar"
      :aria-hidden="isMobileTocOpen || isShortcutHelpOpen ? 'true' : undefined"
      :inert="isMobileTocOpen || isShortcutHelpOpen ? true : undefined"
    >
      <RouterLink :to="{ name: 'home' }" class="brand-lockup brand-link">
        <div class="brand-mark" aria-hidden="true">C</div>
        <div>
          <p class="brand-overline">Compose Docs</p>
          <h1 class="brand-title">Compose 小课堂</h1>
        </div>
      </RouterLink>
      <div class="top-app-meta">
        <div class="theme-toggle" role="radiogroup" aria-label="主题模式">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            :ref="(el) => setThemeOptionRef(option.value, el)"
            type="button"
            class="theme-toggle-option"
            :class="{ active: themeMode === option.value }"
            role="radio"
            :aria-checked="themeMode === option.value ? 'true' : 'false'"
            :tabindex="themeMode === option.value ? 0 : -1"
            @click="setTheme(option.value)"
            @keydown="handleThemeKeydown($event, option.value)"
          >
            {{ option.label }}
          </button>
        </div>
        <button
          ref="shortcutHelpTriggerRef"
          type="button"
          class="shortcut-help-trigger"
          :aria-expanded="isShortcutHelpOpen ? 'true' : 'false'"
          aria-controls="doc-shortcut-help-dialog"
          aria-keyshortcuts="?"
          @click="toggleShortcutHelp(true)"
        >
          快捷键
        </button>
        <span class="meta-pill" aria-live="polite" aria-atomic="true">{{ progressText }}</span>
      </div>
    </header>

    <div
      class="workspace doc-workspace"
      :aria-hidden="isMobileTocOpen || isShortcutHelpOpen ? 'true' : undefined"
      :inert="isMobileTocOpen || isShortcutHelpOpen ? true : undefined"
    >
      <aside class="navigation-panel doc-sidebar" v-if="docs.length">
        <div class="panel-head">
          <div>
            <span class="panel-label">课程目录</span>
            <h2>快速跳转</h2>
          </div>
          <span class="panel-count">{{ docs.length }} 篇</span>
        </div>

        <div class="toc-progress">
          <div class="toc-progress-bar">
            <div class="toc-progress-value" :style="{ width: `${progressPercent}%` }"></div>
          </div>
          <span>{{ progressText }}</span>
        </div>

        <nav class="toc-tree" aria-label="Compose 课程目录">
          <RouterLink
            v-for="(doc, index) in docs"
            :key="doc.slug"
            :ref="(el) => setDocLinkRef(doc.slug, el)"
            :to="{
              name: 'doc',
              params: { slug: doc.slug },
              query: incomingSearchQuery ? { q: incomingSearchQuery } : undefined,
            }"
            class="section-button"
            :aria-current="currentDoc?.slug === doc.slug ? 'page' : undefined"
            :class="{
              active: currentDoc?.slug === doc.slug,
              'is-nearby': Math.abs(index - currentIndex) === 1,
              'is-nearby-secondary': Math.abs(index - currentIndex) === 2,
            }"
          >
            <span class="section-order">{{ doc.order }}.</span>
            <span class="section-copy">
              <span class="section-button-label" v-html="highlightSearchText(doc.title)"></span>
              <span class="section-summary" v-html="highlightSearchText(doc.summary)"></span>
            </span>
          </RouterLink>
        </nav>
      </aside>

      <main id="doc-content" class="reader-layout">
        <section v-if="state === 'ready' && currentDoc" class="reader-header">
          <div class="reader-heading">
            <span class="panel-label">当前阅读</span>
            <h2 ref="pageHeadingRef" tabindex="-1" v-html="highlightSearchText(currentDoc.title)"></h2>
            <p>{{ currentDoc.category }} · 第 {{ currentIndex + 1 }} / {{ docs.length }} 篇</p>
          </div>
          <div class="reader-note">
            <span class="reader-note-label">阅读提示</span>
            <strong>{{ currentDoc.category }}</strong>
            <p>{{ currentDoc.summary }}</p>
            <p class="reader-shortcut-hint">快捷键：<kbd>[</kbd> 上一篇 · <kbd>]</kbd> 下一篇 · <kbd>T</kbd> 回顶部</p>
          </div>
          <div class="header-actions">
            <button class="tonal-button" :disabled="!previousDoc" aria-keyshortcuts="[" @click="goToDoc(previousDoc)">上一篇</button>
            <button class="filled-button" :disabled="!nextDoc" aria-keyshortcuts="]" @click="goToDoc(nextDoc)">下一篇</button>
          </div>
        </section>

        <section
          v-if="state === 'ready' && incomingSearchQuery"
          class="search-context-bar"
          aria-label="当前搜索高亮"
        >
          <span class="sr-only" aria-live="polite" aria-atomic="true">
            当前位于第 {{ activeSearchMatchIndex + 1 }} 处，共 {{ searchMatchCount }} 处命中
          </span>
          <span class="search-context-label">当前高亮</span>
          <strong>{{ incomingSearchQuery }}</strong>
          <span class="search-context-count">{{ searchMatchCount }} 处命中</span>
          <span v-if="searchMatchCount" class="search-context-count">第 {{ activeSearchMatchIndex + 1 }} 处</span>
          <button
            type="button"
            class="search-context-link subtle"
            :disabled="searchMatchCount <= 1"
            aria-keyshortcuts="P"
            @click="jumpToSearchMatch(-1)"
          >
            上一处
          </button>
          <button
            type="button"
            class="search-context-link subtle"
            :disabled="searchMatchCount <= 1"
            aria-keyshortcuts="N"
            @click="jumpToSearchMatch(1)"
          >
            下一处
          </button>
          <RouterLink :to="{ name: 'home', query: { q: incomingSearchQuery } }" class="search-context-link">
            返回搜索结果
          </RouterLink>
          <RouterLink
            :to="{ name: 'doc', params: { slug } }"
            class="search-context-link subtle"
            aria-keyshortcuts="Escape"
          >
            清除高亮
          </RouterLink>
        </section>

        <div
          v-if="state === 'ready'"
          class="reading-progress-bar"
          role="progressbar"
          aria-label="当前文章阅读进度"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(readingProgress)"
        >
          <div class="reading-progress-value" :style="{ width: `${readingProgress}%` }"></div>
        </div>

        <section v-if="state === 'ready' && tocHeadings.length" class="inline-toc">
          <div class="panel-head">
            <div>
              <span class="panel-label">文内目录</span>
              <h2>快速跳到当前章节</h2>
            </div>
            <span class="panel-count">{{ tocHeadings.length }} 节</span>
          </div>

          <nav class="inline-toc-list" aria-label="文内目录">
            <a
              v-for="heading in tocHeadings"
            :key="heading.id"
            :href="`#${heading.id}`"
            class="inline-toc-link"
            :aria-current="activeHeadingId === heading.id ? 'location' : undefined"
            :class="{ nested: heading.level === 3, active: activeHeadingId === heading.id }"
            @click.prevent="jumpToHeading(heading.id)"
            v-html="highlightSearchText(heading.text)"
          ></a>
          </nav>
        </section>

        <section v-if="state === 'loading'" class="reader-surface state-surface" aria-live="polite" aria-busy="true">
          <div class="loading-spinner" aria-hidden="true"></div>
          <p>正在整理课程内容...</p>
        </section>

        <section v-else-if="state === 'notFound'" class="reader-surface state-surface" role="alert">
          <h2 ref="pageHeadingRef" tabindex="-1">未找到这篇文档</h2>
          <p>当前地址没有对应的文档索引，请返回首页重新选择主题。</p>
          <RouterLink :to="{ name: 'home' }" class="filled-button link-button">返回首页</RouterLink>
        </section>

        <section v-else-if="state === 'loadError'" class="reader-surface state-surface" role="alert">
          <h2 ref="pageHeadingRef" tabindex="-1">文档读取失败</h2>
          <p>{{ errorMessage }}</p>
          <RouterLink :to="{ name: 'home' }" class="filled-button link-button">返回首页</RouterLink>
        </section>

        <article
          v-else
          ref="articleRef"
          class="reader-surface markdown-content"
          v-html="renderedContent"
        ></article>

        <nav v-if="state === 'ready' && currentDoc" class="pager-surface" aria-label="上下篇导航">
          <button class="pager-button subtle" :disabled="!previousDoc" @click="goToDoc(previousDoc)">
            <span class="pager-label">上一篇</span>
            <strong>{{ previousDoc?.title || '已经是第一篇' }}</strong>
          </button>
          <div class="pager-center">
            <span class="panel-label">进度</span>
            <strong>{{ progressText }}</strong>
            <span>继续保持阅读节奏</span>
          </div>
          <button class="pager-button primary" :disabled="!nextDoc" @click="goToDoc(nextDoc)">
            <span class="pager-label">下一篇</span>
            <strong>{{ nextDoc?.title || '已经是最后一篇' }}</strong>
          </button>
        </nav>

        <button
          v-if="showBackToTop"
          type="button"
          class="back-to-top"
          aria-keyshortcuts="T"
          @click="scrollToTop"
        >
          回到顶部
        </button>

        <button
          v-if="state === 'ready' && tocHeadings.length"
          ref="mobileTocTriggerRef"
          type="button"
          class="mobile-toc-trigger"
          :aria-expanded="isMobileTocOpen ? 'true' : 'false'"
          aria-controls="mobile-toc-drawer"
          @click="toggleMobileToc(true)"
        >
          目录
        </button>
      </main>

      <aside
        v-if="state === 'ready' && tocHeadings.length"
        class="navigation-panel article-toc-sidebar"
        aria-label="当前文章目录"
      >
        <div class="panel-head">
          <div>
            <span class="panel-label">文内目录</span>
            <h2>当前章节</h2>
          </div>
          <span class="panel-count">{{ tocHeadings.length }} 节</span>
        </div>

        <nav class="article-toc-list" aria-label="桌面端文内目录">
          <a
            v-for="heading in tocHeadings"
            :key="heading.id"
            :ref="(el) => setArticleTocLinkRef(heading.id, el)"
            :href="`#${heading.id}`"
            class="article-toc-link"
            :aria-current="activeHeadingId === heading.id ? 'location' : undefined"
            :class="{ nested: heading.level === 3, active: activeHeadingId === heading.id }"
            @click.prevent="jumpToHeading(heading.id)"
            v-html="highlightSearchText(heading.text)"
          ></a>
        </nav>
      </aside>
    </div>

    <div
      v-if="isMobileTocOpen"
      class="mobile-toc-overlay"
      @click="toggleMobileToc(false)"
    ></div>

    <aside
      v-if="state === 'ready' && tocHeadings.length"
      id="mobile-toc-drawer"
      class="mobile-toc-drawer"
      :class="{ open: isMobileTocOpen }"
      :role="isMobileTocOpen ? 'dialog' : undefined"
      :aria-modal="isMobileTocOpen ? 'true' : undefined"
      aria-labelledby="mobile-toc-title"
      aria-label="移动端文内目录"
      @keydown.esc="toggleMobileToc(false)"
      @keydown="handleMobileTocKeydown"
    >
      <div class="mobile-toc-header">
        <div>
          <span class="panel-label">文内目录</span>
          <h2 id="mobile-toc-title">快速跳到当前章节</h2>
        </div>
        <button
          ref="mobileTocCloseRef"
          type="button"
          class="mobile-toc-close"
          aria-controls="mobile-toc-drawer"
          @click="toggleMobileToc(false)"
        >
          关闭
        </button>
      </div>

      <nav class="mobile-toc-list">
          <a
            v-for="heading in tocHeadings"
            :key="heading.id"
            :ref="(el) => setMobileTocLinkRef(heading.id, el)"
            :href="`#${heading.id}`"
            class="mobile-toc-link"
            :aria-current="activeHeadingId === heading.id ? 'location' : undefined"
            :class="{ nested: heading.level === 3, active: activeHeadingId === heading.id }"
            @click.prevent="handleMobileTocJump(heading.id)"
            v-html="highlightSearchText(heading.text)"
          ></a>
      </nav>
    </aside>

    <div
      v-if="isShortcutHelpOpen"
      class="shortcut-help-overlay"
      @click="toggleShortcutHelp(false)"
    ></div>

    <aside
      v-if="isShortcutHelpOpen"
      id="doc-shortcut-help-dialog"
      class="shortcut-help-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-shortcut-help-title"
      @keydown.esc="toggleShortcutHelp(false)"
      @keydown="handleShortcutHelpKeydown"
    >
      <div class="shortcut-help-header">
        <h2 id="doc-shortcut-help-title">快捷键</h2>
        <button
          ref="shortcutHelpCloseRef"
          type="button"
          class="shortcut-help-close"
          @click="toggleShortcutHelp(false)"
        >
          关闭
        </button>
      </div>
      <div class="shortcut-help-list">
        <p><kbd>[</kbd><span>跳到上一篇</span></p>
        <p><kbd>]</kbd><span>跳到下一篇</span></p>
        <p><kbd>P</kbd><span>跳到上一处搜索命中</span></p>
        <p><kbd>N</kbd><span>跳到下一处搜索命中</span></p>
        <p><kbd>Esc</kbd><span>清除搜索高亮</span></p>
        <p><kbd>T</kbd><span>回到顶部</span></p>
        <p><kbd>?</kbd><span>打开或关闭快捷键帮助</span></p>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocContent } from '../composables/useDocContent'
import { useDocsIndex } from '../composables/useDocsIndex'
import { useReadingNavigation } from '../composables/useReadingNavigation'
import { useReaderNavigation } from '../composables/useReaderNavigation'
import { useSeo } from '../composables/useSeo'
import { useTheme } from '../composables/useTheme'
import { highlightHtml, parseMarkdown } from '../lib/markdown'

const route = useRoute()
const router = useRouter()
const { setSeo } = useSeo()
const { themeMode, setTheme } = useTheme()
const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://example.com/compose-docs').replace(/\/$/, '')
const slug = computed(() => String(route.params.slug || ''))
const incomingSearchQuery = computed(() => String(route.query.q || '').trim())
const themeOptionRefs = new Map()
const themeOptions = [
  { value: 'system', label: '跟随系统' },
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '夜间' },
]

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function highlightSearchText(value) {
  const text = String(value || '')
  const query = incomingSearchQuery.value.trim()

  if (!query) {
    return escapeHtml(text)
  }

  const pattern = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return escapeHtml(text).replace(pattern, '<mark class="search-highlight">$1</mark>')
}

function setThemeOptionRef(value, element) {
  if (element) {
    themeOptionRefs.set(value, element)
    return
  }

  themeOptionRefs.delete(value)
}

function handleThemeKeydown(event, currentValue) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    return
  }

  event.preventDefault()

  const currentIndex = themeOptions.findIndex((option) => option.value === currentValue)
  const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1
  const nextIndex = (currentIndex + direction + themeOptions.length) % themeOptions.length

  const nextValue = themeOptions[nextIndex].value
  setTheme(nextValue)
  themeOptionRefs.get(nextValue)?.focus()
}

const { docs, load: loadIndex } = useDocsIndex()
const { load: loadContent, getContent } = useDocContent()
const { currentIndex, currentDoc, previousDoc, nextDoc, progressText, progressPercent } = useReaderNavigation(docs, slug)

const viewState = ref('loading')
const errorMessage = ref('')
const content = computed(() => getContent(slug.value).value)
const state = computed(() => viewState.value)
const parsedContent = computed(() => parseMarkdown(content.value || '# 暂无内容'))
const renderedContent = computed(() => highlightHtml(parsedContent.value.html, incomingSearchQuery.value))
const searchMatchCount = computed(() => (renderedContent.value.match(/class="search-highlight"/g) ?? []).length)
const tocHeadings = computed(() => parsedContent.value.headings)
const articleRef = ref(null)
const isMobileTocOpen = ref(false)
const isShortcutHelpOpen = ref(false)
const pageHeadingRef = ref(null)
const shortcutHelpTriggerRef = ref(null)
const shortcutHelpCloseRef = ref(null)
const mobileTocTriggerRef = ref(null)
const mobileTocCloseRef = ref(null)
const docLinkRefs = new Map()
const articleTocLinkRefs = new Map()
const mobileTocLinkRefs = new Map()
const lastScrolledSearchQuery = ref('')
const activeSearchMatchIndex = ref(0)
const {
  activeHeadingId,
  readingProgress,
  showBackToTop,
  jumpToHeading,
  scrollToTop,
} = useReadingNavigation({
  articleRef,
  headings: tocHeadings,
  state,
  slug,
})

function setDocLinkRef(docSlug, element) {
  if (element) {
    docLinkRefs.set(docSlug, element)
    return
  }

  docLinkRefs.delete(docSlug)
}

function setArticleTocLinkRef(headingId, element) {
  if (element) {
    articleTocLinkRefs.set(headingId, element)
    return
  }

  articleTocLinkRefs.delete(headingId)
}

function setMobileTocLinkRef(headingId, element) {
  if (element) {
    mobileTocLinkRefs.set(headingId, element)
    return
  }

  mobileTocLinkRefs.delete(headingId)
}

function getSearchMatches() {
  return Array.from(articleRef.value?.querySelectorAll('.search-highlight') ?? [])
}

function syncActiveSearchMatch() {
  const matches = getSearchMatches()

  matches.forEach((match, index) => {
    match.classList.toggle('active-search-highlight', index === activeSearchMatchIndex.value)

    if (!match.hasAttribute('tabindex')) {
      match.setAttribute('tabindex', '-1')
    }
  })

  return matches
}

function jumpToSearchMatch(direction) {
  const matches = getSearchMatches()

  if (!matches.length) {
    return
  }

  activeSearchMatchIndex.value = (
    activeSearchMatchIndex.value + direction + matches.length
  ) % matches.length

  const target = matches[activeSearchMatchIndex.value]
  const top = window.scrollY + target.getBoundingClientRect().top - 140
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
  syncActiveSearchMatch()
  target.focus({ preventScroll: true })
}

async function scrollActiveDocLinkIntoView() {
  await nextTick()

  const activeLink = currentDoc.value ? docLinkRefs.get(currentDoc.value.slug) : null

  if (!activeLink) {
    return
  }

  activeLink.scrollIntoView({
    block: 'center',
    inline: 'nearest',
  })
}

async function scrollActiveHeadingIntoView() {
  await nextTick()

  if (!activeHeadingId.value) {
    return
  }

  const activeLink = articleTocLinkRefs.get(activeHeadingId.value)

  if (!activeLink) {
    return
  }

  activeLink.scrollIntoView({
    block: 'center',
    inline: 'nearest',
  })
}

watchEffect(() => {
  const canonical = `${siteUrl}/docs/${slug.value}`
  const searchSuffix = incomingSearchQuery.value ? ` · 搜索：${incomingSearchQuery.value}` : ''

  if (currentDoc.value) {
    setSeo({
      title: `${currentDoc.value.title} | Compose 小课堂${searchSuffix}`,
      description: currentDoc.value.summary || `${currentDoc.value.title} 的 Jetpack Compose 学习笔记。`,
      canonical,
    })
    return
  }

  setSeo({
    title: 'Compose 小课堂 | Jetpack Compose 学习手册',
    description: 'Compose 小课堂：用分类索引、单篇阅读和渐进式学习路径整理 Jetpack Compose 知识点。',
    canonical,
  })
})

watch(
  () => [state.value, currentDoc.value?.slug, docs.value.length],
  ([nextState, nextSlug]) => {
    if (nextState !== 'ready' || !nextSlug) {
      return
    }

    scrollActiveDocLinkIntoView()
    nextTick(() => pageHeadingRef.value?.focus())
  },
  { immediate: true },
)

watch(
  () => state.value,
  (nextState) => {
    if (nextState === 'notFound' || nextState === 'loadError') {
      nextTick(() => pageHeadingRef.value?.focus())
    }
  },
)

watch(
  () => [state.value, activeHeadingId.value],
  ([nextState, nextHeadingId]) => {
    if (nextState !== 'ready' || !nextHeadingId) {
      return
    }

    scrollActiveHeadingIntoView()

    const encodedHash = `#${encodeURIComponent(nextHeadingId)}`
    if (window.location.hash !== encodedHash) {
      history.replaceState(null, '', encodedHash)
    }
  },
  { immediate: true },
)

watch(
  () => [state.value, incomingSearchQuery.value, renderedContent.value],
  async ([nextState, nextQuery]) => {
    if (nextState !== 'ready' || !nextQuery || nextQuery === lastScrolledSearchQuery.value) {
      return
    }

    await nextTick()

    const firstHighlight = articleRef.value?.querySelector('.search-highlight')
    if (!firstHighlight) {
      return
    }

    const top = window.scrollY + firstHighlight.getBoundingClientRect().top - 140
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
    activeSearchMatchIndex.value = 0
    syncActiveSearchMatch()
    firstHighlight.focus({ preventScroll: true })
    lastScrolledSearchQuery.value = nextQuery
  },
  { immediate: true },
)

watch(activeSearchMatchIndex, () => {
  syncActiveSearchMatch()
})

async function hydrate() {
  viewState.value = 'loading'
  errorMessage.value = ''

  try {
    await loadIndex()

    if (!currentDoc.value) {
      viewState.value = 'notFound'
      return
    }

    await loadContent(currentDoc.value)
    viewState.value = 'ready'
  } catch (error) {
    viewState.value = 'loadError'
    errorMessage.value = error instanceof Error ? error.message : '未知错误'
  }
}

function toggleMobileToc(open) {
  isMobileTocOpen.value = open
  document.body.classList.toggle('mobile-toc-open', open)

  nextTick(() => {
    if (open) {
      mobileTocCloseRef.value?.focus()
      return
    }

    mobileTocTriggerRef.value?.focus()
  })
}

function handleMobileTocKeydown(event) {
  if (event.key !== 'Tab' || !isMobileTocOpen.value) {
    return
  }

  const focusableItems = [
    mobileTocCloseRef.value,
    ...tocHeadings.value
      .map((heading) => mobileTocLinkRefs.get(heading.id))
      .filter(Boolean),
  ]

  if (focusableItems.length === 0) {
    return
  }

  const currentIndex = focusableItems.indexOf(document.activeElement)

  if (event.shiftKey) {
    if (currentIndex <= 0) {
      event.preventDefault()
      focusableItems[focusableItems.length - 1]?.focus()
    }
    return
  }

  if (currentIndex === -1 || currentIndex === focusableItems.length - 1) {
    event.preventDefault()
    focusableItems[0]?.focus()
  }
}

function handleMobileTocJump(id) {
  jumpToHeading(id)
  toggleMobileToc(false)
}

function goToDoc(target) {
  if (target?.slug) {
    router.push({
      name: 'doc',
      params: { slug: target.slug },
      query: incomingSearchQuery.value ? { q: incomingSearchQuery.value } : undefined,
    })
  }
}

function clearSearchHighlight() {
  if (!incomingSearchQuery.value) {
    return
  }

  router.replace({
    name: 'doc',
    params: { slug: slug.value },
    hash: route.hash || undefined,
  })
}

function handleReadingShortcut(event) {
  if (isShortcutHelpOpen.value && event.key === 'Escape') {
    event.preventDefault()
    toggleShortcutHelp(false)
    return
  }

  if (isMobileTocOpen.value && event.key === 'Escape') {
    event.preventDefault()
    toggleMobileToc(false)
    return
  }

  if (incomingSearchQuery.value && event.key === 'Escape') {
    event.preventDefault()
    clearSearchHighlight()
    return
  }

  if (event.defaultPrevented) {
    return
  }

  const target = event.target
  const isEditable = target instanceof HTMLElement && (
    target.tagName === 'INPUT'
    || target.tagName === 'TEXTAREA'
    || target.isContentEditable
  )

  if (isEditable) {
    return
  }

  if (event.key === '?') {
    event.preventDefault()
    toggleShortcutHelp(!isShortcutHelpOpen.value)
    return
  }

  if (isShortcutHelpOpen.value || isMobileTocOpen.value) {
    return
  }

  if (event.key === '[' && previousDoc.value) {
    event.preventDefault()
    goToDoc(previousDoc.value)
    return
  }

  if (event.key === ']' && nextDoc.value) {
    event.preventDefault()
    goToDoc(nextDoc.value)
    return
  }

  if ((event.key === 't' || event.key === 'T') && showBackToTop.value) {
    event.preventDefault()
    scrollToTop()
    return
  }

  if ((event.key === 'p' || event.key === 'P') && searchMatchCount.value > 1) {
    event.preventDefault()
    jumpToSearchMatch(-1)
    return
  }

  if ((event.key === 'n' || event.key === 'N') && searchMatchCount.value > 1) {
    event.preventDefault()
    jumpToSearchMatch(1)
  }
}

function toggleShortcutHelp(open) {
  isShortcutHelpOpen.value = open
  document.body.classList.toggle('modal-open', open)

  requestAnimationFrame(() => {
    if (open) {
      shortcutHelpCloseRef.value?.focus()
      return
    }

    shortcutHelpTriggerRef.value?.focus()
  })
}

function handleShortcutHelpKeydown(event) {
  if (event.key !== 'Tab' || !isShortcutHelpOpen.value) {
    return
  }

  const focusableItems = [shortcutHelpCloseRef.value].filter(Boolean)

  if (focusableItems.length === 0) {
    return
  }

  const currentIndex = focusableItems.indexOf(document.activeElement)

  if (event.shiftKey) {
    if (currentIndex <= 0) {
      event.preventDefault()
      focusableItems[focusableItems.length - 1]?.focus()
    }
    return
  }

  if (currentIndex === -1 || currentIndex === focusableItems.length - 1) {
    event.preventDefault()
    focusableItems[0]?.focus()
  }
}

watch(slug, () => {
  toggleMobileToc(false)
  lastScrolledSearchQuery.value = ''
  activeSearchMatchIndex.value = 0
  hydrate()
}, { immediate: true })

watchEffect((onCleanup) => {
  if (typeof window === 'undefined') {
    return
  }

  window.addEventListener('keydown', handleReadingShortcut)
  onCleanup(() => window.removeEventListener('keydown', handleReadingShortcut))
})

onBeforeUnmount(() => {
  document.body.classList.remove('mobile-toc-open')
  document.body.classList.remove('modal-open')
})
</script>
