<template>
  <div class="page-shell home-page">
    <a href="#main-content" class="skip-link">跳到主内容</a>
    <header
      class="top-app-bar"
      :aria-hidden="isShortcutHelpOpen ? 'true' : undefined"
      :inert="isShortcutHelpOpen ? true : undefined"
    >
      <div class="brand-lockup">
        <div class="brand-mark" aria-hidden="true">C</div>
        <div>
          <p class="brand-overline">Compose Docs</p>
          <h1 class="brand-title">Compose 小课堂</h1>
        </div>
      </div>
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
          aria-controls="home-shortcut-help-dialog"
          aria-keyshortcuts="?"
          @click="toggleShortcutHelp(true)"
        >
          快捷键
        </button>
        <span class="meta-pill">{{ totalDocs }} 篇文档</span>
      </div>
    </header>

    <main
      id="main-content"
      :aria-hidden="isShortcutHelpOpen ? 'true' : undefined"
      :inert="isShortcutHelpOpen ? true : undefined"
    >
    <section class="hero-surface">
      <div class="hero-copy">
        <span class="hero-kicker">Material Design 3 学习空间</span>
        <h2 ref="pageHeadingRef" tabindex="-1">用更清晰的结构，连续掌握 Jetpack Compose。</h2>
        <p>
          延续你现在按 Markdown 写作和维护 README 索引的方式，同时把浏览体验升级为
          更稳、更可扩展的文档站底座。
        </p>
        <div class="hero-tags">
          <span class="hero-tag">构建期索引</span>
          <span class="hero-tag">独立文档路由</span>
          <span class="hero-tag">可持续扩展</span>
        </div>
        <div class="hero-guidance">
          <strong>本轮改造重点</strong>
          <p>
            先稳住路由、数据层和页面边界，后面再叠搜索、目录、SEO 和推荐阅读，会轻松很多。
          </p>
        </div>
      </div>

      <div class="hero-stats">
        <div class="stat-card emphasized">
          <span class="stat-label">当前状态</span>
          <strong>长期底座优先</strong>
          <span>保留现有作者工作流，不强行引入 frontmatter。</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">总文档数</span>
          <strong>{{ totalDocs }}</strong>
          <span>由 `docs-index.json` 统一驱动。</span>
        </div>
        <div class="stat-card accent-card">
          <span class="stat-label">最近更新</span>
          <strong>{{ lastUpdated }}</strong>
          <span>时间来自 README 中的索引元信息。</span>
        </div>
      </div>
    </section>

    <section v-if="error" class="reader-surface state-surface" role="alert">
      <h2>索引读取失败</h2>
      <p>{{ error.message }}</p>
    </section>

    <section v-else-if="loading" class="reader-surface state-surface" aria-live="polite" aria-busy="true">
      <div class="loading-spinner" aria-hidden="true"></div>
      <p>正在加载文档索引...</p>
    </section>

    <template v-else>
      <section class="search-surface">
        <div class="search-copy">
          <span class="panel-label">快速查找</span>
          <h2>按标题、摘要或分类定位主题</h2>
          <p>想直接进入某个知识点时，从这里搜会比沿着分类逐层翻找更快。</p>
          <p class="search-shortcut-hint">快捷键：按 <kbd>/</kbd> 直接聚焦搜索框</p>
        </div>
        <div class="search-box">
          <input
            ref="searchInputRef"
            v-model.trim="searchQuery"
            type="search"
            class="search-input"
            placeholder="比如：Navigation、动画、性能、TextField"
            aria-label="搜索文档"
            aria-keyshortcuts="/,Escape"
            @keydown.esc="handleSearchEscape"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="search-clear"
            @click="searchQuery = ''"
          >
            清空
          </button>
        </div>
      </section>

      <section v-if="hasSearchQuery" class="search-results" aria-live="polite">
        <div class="panel-head search-head">
          <div>
            <span class="panel-label">搜索结果</span>
            <h2>{{ searchHeadline }}</h2>
          </div>
          <span class="panel-count" aria-atomic="true">{{ filteredDocs.length }} 条</span>
        </div>

        <div v-if="filteredDocs.length" class="search-result-list">
          <RouterLink
            v-for="doc in filteredDocs"
            :key="doc.slug"
            :to="{ name: 'doc', params: { slug: doc.slug }, query: { q: searchQuery.trim() } }"
            class="search-result-card"
            :aria-label="`打开文档：${doc.title}`"
          >
            <div class="search-result-meta">
              <span class="search-category">{{ doc.category }}</span>
              <span class="search-order">第 {{ doc.order }} 篇</span>
            </div>
            <h3>{{ doc.title }}</h3>
            <p>{{ doc.summary }}</p>
          </RouterLink>
        </div>

        <div v-else class="reader-surface state-surface compact-state">
          <h2>未找到相关主题</h2>
          <p>可以试试更短的关键词，或者直接搜索分类名，比如“动画”或“性能优化”。</p>
        </div>
      </section>

      <section v-else class="workspace home-workspace">
        <article v-for="category in docsByCategory" :key="category.name" class="navigation-panel category-card">
          <div class="panel-head">
            <div>
              <span class="panel-label">课程目录</span>
              <h2>{{ category.name }}</h2>
            </div>
            <span class="panel-count">{{ category.count }} 篇</span>
          </div>

          <nav class="toc-tree" :aria-label="`${category.name} 分类文档`">
            <RouterLink
              v-for="doc in category.docs"
              :key="doc.slug"
              :to="{ name: 'doc', params: { slug: doc.slug } }"
              class="section-button"
              :aria-label="`打开文档：${doc.title}`"
            >
              <span class="section-order">{{ doc.order }}.</span>
              <span class="section-copy">
                <span class="section-button-label">{{ doc.title }}</span>
                <span class="section-summary">{{ doc.summary }}</span>
              </span>
            </RouterLink>
          </nav>
        </article>
      </section>
    </template>

    <footer class="app-footer">
      <p>Compose 小课堂 · 用结构化索引驱动的学习型文档站</p>
      <span>最后更新：{{ lastUpdated }}</span>
    </footer>
    </main>

    <div
      v-if="isShortcutHelpOpen"
      class="shortcut-help-overlay"
      @click="toggleShortcutHelp(false)"
    ></div>

    <aside
      v-if="isShortcutHelpOpen"
      id="home-shortcut-help-dialog"
      class="shortcut-help-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-shortcut-help-title"
      @keydown.esc="toggleShortcutHelp(false)"
      @keydown="handleShortcutHelpKeydown"
    >
      <div class="shortcut-help-header">
        <h2 id="home-shortcut-help-title">快捷键</h2>
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
        <p><kbd>/</kbd><span>聚焦搜索框</span></p>
        <p><kbd>Esc</kbd><span>清空搜索或退出搜索框</span></p>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocsIndex } from '../composables/useDocsIndex'
import { useSeo } from '../composables/useSeo'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const router = useRouter()
const { load, docs, categories, lastUpdated, totalDocs, error, loading } = useDocsIndex()
const { setSeo } = useSeo()
const { themeMode, setTheme } = useTheme()
const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://example.com/compose-docs').replace(/\/$/, '')
const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')
const searchInputRef = ref(null)
const isShortcutHelpOpen = ref(false)
const pageHeadingRef = ref(null)
const shortcutHelpTriggerRef = ref(null)
const shortcutHelpCloseRef = ref(null)
const themeOptionRefs = new Map()
const themeOptions = [
  { value: 'system', label: '跟随系统' },
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '夜间' },
]

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

function focusSearchInput() {
  searchInputRef.value?.focus()
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

function handleSearchEscape() {
  if (searchQuery.value) {
    searchQuery.value = ''
    return
  }

  searchInputRef.value?.blur()
}

function handleGlobalSearchShortcut(event) {
  if (isShortcutHelpOpen.value && event.key === 'Escape') {
    event.preventDefault()
    toggleShortcutHelp(false)
    return
  }

  if (event.key === '?') {
    event.preventDefault()
    toggleShortcutHelp(!isShortcutHelpOpen.value)
    return
  }

  if (isShortcutHelpOpen.value) {
    return
  }

  if (event.defaultPrevented || event.key !== '/') {
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

  event.preventDefault()
  focusSearchInput()
}

watch(
  () => route.query.q,
  (nextQuery) => {
    const normalizedQuery = typeof nextQuery === 'string' ? nextQuery : ''

    if (normalizedQuery !== searchQuery.value) {
      searchQuery.value = normalizedQuery
    }
  },
)

watch(searchQuery, (nextQuery) => {
  const trimmedQuery = nextQuery.trim()
  const currentQuery = typeof route.query.q === 'string' ? route.query.q : ''

  if (trimmedQuery === currentQuery) {
    return
  }

  const nextRouteQuery = { ...route.query }

  if (trimmedQuery) {
    nextRouteQuery.q = trimmedQuery
  } else {
    delete nextRouteQuery.q
  }

  router.replace({ query: nextRouteQuery })
})
const hasSearchQuery = computed(() => searchQuery.value.length > 0)
const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

const docsByCategory = computed(() => categories.value.map((category) => ({
  ...category,
  docs: docs.value.filter((doc) => doc.category === category.name),
})))

const filteredDocs = computed(() => {
  if (!normalizedQuery.value) {
    return []
  }

  const query = normalizedQuery.value

  const rank = (doc) => {
    const title = doc.title.toLowerCase()
    const category = doc.category.toLowerCase()
    const summary = doc.summary.toLowerCase()

    if (title.includes(query)) {
      return 0
    }

    if (category.includes(query)) {
      return 1
    }

    if (summary.includes(query)) {
      return 2
    }

    return 99
  }

  return docs.value
    .filter((doc) => rank(doc) !== 99)
    .slice()
    .sort((left, right) => {
      const rankDiff = rank(left) - rank(right)
      if (rankDiff !== 0) {
        return rankDiff
      }

      return left.order - right.order
    })
})

const searchHeadline = computed(() => `“${searchQuery.value}” 的搜索结果`)

watchEffect(() => {
  const canonical = `${siteUrl}/`
  const searchSuffix = hasSearchQuery.value ? ` · 搜索：${searchQuery.value}` : ''

  setSeo({
    title: `Compose 小课堂 | Jetpack Compose 学习手册${searchSuffix}`,
    description: `Compose 小课堂收录 ${totalDocs.value} 篇 Jetpack Compose 主题文档，支持按分类浏览与标题摘要搜索。`,
    canonical,
  })
})

onMounted(() => {
  load()
  window.addEventListener('keydown', handleGlobalSearchShortcut)
  requestAnimationFrame(() => pageHeadingRef.value?.focus())
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalSearchShortcut)
  document.body.classList.remove('modal-open')
})
</script>
