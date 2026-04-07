# Compose Docs Foundation Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the docs site into a route-based, modular foundation that preserves the current Markdown authoring workflow while replacing runtime README parsing with a build-time structured docs index.

**Architecture:** Add a build-time script that converts `public/docs/README.md` category navigation into `public/docs-index.json`, then refactor the Vue app into `HomeView` and `DocView` routes backed by composables for index loading, Markdown fetching, and reader navigation. Keep Markdown content files and README maintenance unchanged, but move data parsing out of the browser and split the current monolithic `App.vue` into focused views, components, and utilities.

**Tech Stack:** Vue 3, Vite 5, Vue Router 4, Marked, marked-highlight, highlight.js, Node.js build script

---

### Task 1: Add build-time docs index generation

**Files:**
- Create: `scripts/generate-docs-index.mjs`
- Modify: `package.json`
- Create: `public/docs-index.json`
- Reference: `public/docs/README.md`

- [ ] **Step 1: Write the failing verification command**

```bash
node scripts/generate-docs-index.mjs
```

Expected: command fails because `scripts/generate-docs-index.mjs` does not exist.

- [ ] **Step 2: Create the generator script with README parsing and validation**

```js
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const docsDir = path.join(rootDir, 'public', 'docs')
const readmePath = path.join(docsDir, 'README.md')
const outputPath = path.join(rootDir, 'public', 'docs-index.json')

const normalizeDocPath = (input) => input.replace(/^\.\//, '').replace(/^\/+/, '')
const toSlug = (docPath) => normalizeDocPath(docPath).replace(/\.md$/i, '')

const extractUpdatedAt = (markdown) => {
  const match = markdown.match(/最后更新[：:]\s*(\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?)/)
  return match ? match[1] : null
}

const extractCatalogBlock = (markdown) => {
  const match = markdown.match(/##\s+分类导航\s*([\s\S]*?)(?:\n##\s+|$)/)

  if (!match) {
    throw new Error('README.md 中未找到“分类导航”区块')
  }

  return match[1]
}

const ensureDocExists = async (relativePath) => {
  const absolutePath = path.join(docsDir, normalizeDocPath(relativePath))
  await access(absolutePath)
}

const parseCatalog = async (markdown) => {
  const block = extractCatalogBlock(markdown)
  const lines = block.split(/\r?\n/)
  const categories = []
  const docs = []
  const seenSlugs = new Set()
  let currentCategory = null
  let order = 1

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      continue
    }

    const categoryMatch = line.match(/^###\s+(.+)$/)
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim()
      categories.push({ name: currentCategory, count: 0 })
      continue
    }

    const docMatch = line.match(/^- \[([^\]]+)\]\(([^)]+)\)\s*(?:-\s*(.+))?$/)
    if (!docMatch) {
      continue
    }

    if (!currentCategory) {
      throw new Error(`文档条目缺少分类：${line}`)
    }

    const [, title, rawPath, rawSummary = ''] = docMatch
    const normalizedPath = normalizeDocPath(rawPath)
    const slug = toSlug(normalizedPath)

    if (seenSlugs.has(slug)) {
      throw new Error(`检测到重复 slug：${slug}`)
    }

    await ensureDocExists(normalizedPath)
    seenSlugs.add(slug)

    const doc = {
      slug,
      title: title.trim(),
      path: `docs/${normalizedPath}`,
      summary: rawSummary.trim(),
      category: currentCategory,
      order,
    }

    docs.push(doc)
    categories[categories.length - 1].count += 1
    order += 1
  }

  return { categories, docs }
}

const main = async () => {
  const markdown = await readFile(readmePath, 'utf8')
  const { categories, docs } = await parseCatalog(markdown)

  const payload = {
    generatedAt: new Date().toISOString(),
    lastUpdated: extractUpdatedAt(markdown),
    totalDocs: docs.length,
    categories,
    docs,
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`Generated ${path.relative(rootDir, outputPath)} with ${docs.length} docs.`)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
```

- [ ] **Step 3: Add generator commands to package scripts**

```json
{
  "scripts": {
    "generate:docs-index": "node scripts/generate-docs-index.mjs",
    "dev": "npm run generate:docs-index && vite",
    "build": "npm run generate:docs-index && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 4: Run the generator and verify the JSON output exists**

Run: `npm run generate:docs-index`
Expected: PASS with output similar to `Generated public/docs-index.json with 49 docs.`

- [ ] **Step 5: Verify the generated payload shape**

Run: `sed -n '1,80p' public/docs-index.json`
Expected: JSON contains `generatedAt`, `lastUpdated`, `totalDocs`, `categories`, and `docs` fields.

- [ ] **Step 6: Commit**

```bash
git add package.json scripts/generate-docs-index.mjs public/docs-index.json
git commit -m "build: generate docs index from readme"
```

### Task 2: Add route-based application shell

**Files:**
- Create: `src/router/index.js`
- Create: `src/views/HomeView.vue`
- Create: `src/views/DocView.vue`
- Modify: `src/main.js`
- Modify: `src/App.vue`

- [ ] **Step 1: Write the failing route smoke test command**

Run: `npm run build`
Expected: FAIL later in this task while `vue-router` imports or route view files are still missing.

- [ ] **Step 2: Create the router definition**

```js
import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('../views/HomeView.vue')
const DocView = () => import('../views/DocView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/docs/:slug',
      name: 'doc',
      component: DocView,
      props: true,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
```

- [ ] **Step 3: Replace the app entry with router mounting**

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

createApp(App).use(router).mount('#app')
```

- [ ] **Step 4: Reduce `App.vue` to an application shell**

```vue
<template>
  <div class="app-shell">
    <router-view />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}
</style>
```

- [ ] **Step 5: Create placeholder route views that compile before full migration**

```vue
<template>
  <main class="page-shell">
    <h1>Compose Docs</h1>
    <p>Home view placeholder.</p>
  </main>
</template>
```

```vue
<template>
  <main class="page-shell">
    <h1>Compose Docs</h1>
    <p>Doc view placeholder: {{ slug }}</p>
  </main>
</template>

<script setup>
defineProps({
  slug: {
    type: String,
    required: true,
  },
})
</script>
```

- [ ] **Step 6: Run build to verify route splitting compiles**

Run: `npm run build`
Expected: PASS with separate route chunks generated for `HomeView` and `DocView`.

- [ ] **Step 7: Commit**

```bash
git add src/main.js src/App.vue src/router/index.js src/views/HomeView.vue src/views/DocView.vue
git commit -m "feat: add route-based app shell"
```

### Task 3: Implement docs index and content composables

**Files:**
- Create: `src/composables/useDocsIndex.js`
- Create: `src/composables/useDocContent.js`
- Create: `src/composables/useReaderNavigation.js`

- [ ] **Step 1: Create the docs index loader with request caching**

```js
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
```

- [ ] **Step 2: Create the Markdown content loader with per-slug caching**

```js
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
```

- [ ] **Step 3: Create reader navigation helpers based on slug order**

```js
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

  return {
    currentIndex,
    currentDoc,
    previousDoc,
    nextDoc,
    progressText,
  }
}
```

- [ ] **Step 4: Run build to verify composables do not introduce syntax errors**

Run: `npm run build`
Expected: PASS with no syntax or import resolution errors.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useDocsIndex.js src/composables/useDocContent.js src/composables/useReaderNavigation.js
git commit -m "feat: add docs data composables"
```

### Task 4: Isolate Markdown rendering into a reusable utility

**Files:**
- Create: `src/lib/markdown.js`
- Modify: `src/views/DocView.vue`

- [ ] **Step 1: Create the Markdown renderer utility**

```js
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  }),
)

export const renderMarkdown = (markdown) => marked.parse(markdown)
```

- [ ] **Step 2: Use the renderer utility in `DocView.vue` instead of inline Markdown setup**

```vue
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { renderMarkdown } from '../lib/markdown'
import { useDocContent } from '../composables/useDocContent'
import { useDocsIndex } from '../composables/useDocsIndex'
import { useReaderNavigation } from '../composables/useReaderNavigation'

const route = useRoute()
const router = useRouter()
const slug = computed(() => String(route.params.slug || ''))
const state = ref('loading')
const errorMessage = ref('')

const { docs, load: loadIndex } = useDocsIndex()
const { load: loadContent, getContent } = useDocContent()
const { currentDoc, previousDoc, nextDoc, progressText } = useReaderNavigation(docs, slug)

const renderedContent = computed(() => renderMarkdown(getContent(slug.value).value || '# 暂无内容'))

const hydrate = async () => {
  state.value = 'loading'
  errorMessage.value = ''

  try {
    await loadIndex()

    if (!currentDoc.value) {
      state.value = 'notFound'
      return
    }

    await loadContent(currentDoc.value)
    state.value = 'ready'
  } catch (error) {
    state.value = 'loadError'
    errorMessage.value = error.message
  }
}

const goToDoc = (target) => {
  if (target?.slug) {
    router.push({ name: 'doc', params: { slug: target.slug } })
  }
}

onMounted(hydrate)
watch(slug, hydrate)
</script>
```

- [ ] **Step 3: Run build and confirm Markdown/highlight imports stay in doc-related chunks**

Run: `npm run build`
Expected: PASS and the largest main entry chunk is reduced compared with the original single-file app.

- [ ] **Step 4: Commit**

```bash
git add src/lib/markdown.js src/views/DocView.vue
git commit -m "refactor: isolate markdown rendering"
```

### Task 5: Implement the real home page using the generated docs index

**Files:**
- Modify: `src/views/HomeView.vue`
- Optional Create: `src/components/TopAppBar.vue`
- Optional Create: `src/components/HeroSurface.vue`
- Optional Create: `src/components/DocSidebar.vue`

- [ ] **Step 1: Load docs index data in the home view**

```vue
<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useDocsIndex } from '../composables/useDocsIndex'

const { load, docs, categories, lastUpdated, totalDocs, error, loading } = useDocsIndex()

const docsByCategory = computed(() => categories.value.map((category) => ({
  ...category,
  docs: docs.value.filter((doc) => doc.category === category.name),
})))

onMounted(load)
</script>
```

- [ ] **Step 2: Render the home page sections from structured data**

```vue
<template>
  <div class="home-page">
    <header class="top-app-bar">
      <div>
        <p class="brand-overline">Compose Docs</p>
        <h1 class="brand-title">Compose 小课堂</h1>
      </div>
      <span class="meta-pill">{{ totalDocs }} 篇文档</span>
    </header>

    <section class="hero-surface">
      <div class="hero-copy">
        <span class="hero-kicker">Material Design 3 学习空间</span>
        <h2>用更清晰的结构，连续掌握 Jetpack Compose。</h2>
        <p>继续沿用现有文档维护方式，但把浏览体验升级为真正的文档站底座。</p>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <span class="stat-label">总文档数</span>
          <strong>{{ totalDocs }}</strong>
          <span>结构化索引驱动</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">最近更新</span>
          <strong>{{ lastUpdated }}</strong>
          <span>来自 README 索引元信息</span>
        </div>
      </div>
    </section>

    <section v-if="error" class="reader-surface">
      <h2>索引读取失败</h2>
      <p>{{ error.message }}</p>
    </section>

    <section v-else-if="loading" class="reader-surface">
      <p>正在加载文档索引...</p>
    </section>

    <section v-else class="workspace">
      <article v-for="category in docsByCategory" :key="category.name" class="navigation-panel">
        <div class="panel-head">
          <div>
            <span class="panel-label">课程目录</span>
            <h2>{{ category.name }}</h2>
          </div>
          <span class="panel-count">{{ category.count }} 篇</span>
        </div>

        <nav class="toc-tree">
          <RouterLink
            v-for="doc in category.docs"
            :key="doc.slug"
            :to="{ name: 'doc', params: { slug: doc.slug } }"
            class="section-button"
          >
            <span class="section-order">{{ doc.order }}.</span>
            <span class="section-button-label">{{ doc.title }}</span>
          </RouterLink>
        </nav>
      </article>
    </section>
  </div>
</template>
```

- [ ] **Step 3: Reuse the existing styles that are still relevant, then delete dead home-only logic from the old single-file implementation**

Run: manually move only the style blocks required by the home page into `HomeView.vue` or shared CSS.
Expected: home page looks substantially like the current landing page, but no longer depends on in-component README parsing.

- [ ] **Step 4: Run build to verify the home page compiles and renders from the JSON index**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/HomeView.vue src/components
git commit -m "feat: render home view from docs index"
```

### Task 6: Implement the real document reader view and navigation states

**Files:**
- Modify: `src/views/DocView.vue`
- Optional Create: `src/components/ReaderHeader.vue`
- Optional Create: `src/components/DocPager.vue`
- Optional Create: `src/components/DocContent.vue`

- [ ] **Step 1: Render doc reader states explicitly**

```vue
<template>
  <div class="doc-page">
    <header class="reader-header" v-if="state === 'ready' && currentDoc">
      <div>
        <span class="panel-label">当前阅读</span>
        <h1>{{ currentDoc.title }}</h1>
        <p>{{ currentDoc.category }} · 第 {{ currentIndex + 1 }} / {{ docs.length }} 篇</p>
      </div>
      <div class="header-actions">
        <button class="tonal-button" :disabled="!previousDoc" @click="goToDoc(previousDoc)">上一篇</button>
        <button class="filled-button" :disabled="!nextDoc" @click="goToDoc(nextDoc)">下一篇</button>
      </div>
    </header>

    <section v-if="state === 'loading'" class="reader-surface">
      <p>正在整理课程内容...</p>
    </section>

    <section v-else-if="state === 'notFound'" class="reader-surface">
      <h2>未找到这篇文档</h2>
      <p>请返回首页重新选择主题。</p>
    </section>

    <section v-else-if="state === 'loadError'" class="reader-surface">
      <h2>文档读取失败</h2>
      <p>{{ errorMessage }}</p>
    </section>

    <article v-else class="reader-surface markdown-content" v-html="renderedContent"></article>

    <nav v-if="state === 'ready' && currentDoc" class="pager-surface">
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
  </div>
</template>
```

- [ ] **Step 2: Expose current index from the navigation composable and wire it into the view**

```js
const { currentIndex, currentDoc, previousDoc, nextDoc, progressText } = useReaderNavigation(docs, slug)
```

- [ ] **Step 3: Ensure route changes rehydrate content without full page reloads**

Run: manually test with `npm run dev`, then navigate between at least three docs using the pager buttons.
Expected: URL changes from `/docs/composable` to adjacent docs, content updates, and browser back returns to the previous doc.

- [ ] **Step 4: Run build for final reader verification**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/DocView.vue src/components
git commit -m "feat: add document reader route"
```

### Task 7: Final cleanup and verification

**Files:**
- Modify: `src/App.vue`
- Modify: `src/assets/main.css`
- Review: `dist/` build output

- [ ] **Step 1: Remove dead README parsing logic and unused imports from the old implementation**

Run: search for removed concerns and delete dead code from the app shell and shared styles.
Expected: no remaining runtime README parsing in `src/`.

- [ ] **Step 2: Verify the old README-fetching code is gone**

Run: `rg -n "README\.md|extractCatalog|loadContent|currentSection" src`
Expected: no hits for the retired single-file reader implementation.

- [ ] **Step 3: Verify the docs index is the active data source**

Run: `rg -n "docs-index.json|generate:docs-index|createWebHistory|router-view" src package.json scripts`
Expected: hits in the new generator, scripts, router, and composables.

- [ ] **Step 4: Run full verification**

Run: `npm run build`
Expected: PASS.

Run: `du -sh dist && find dist/assets -maxdepth 1 -type f | sort`
Expected: build output exists and shows split assets rather than a single oversized application entry bundle.

- [ ] **Step 5: Commit**

```bash
git add src/App.vue src/assets/main.css
 git commit -m "refactor: finish docs foundation migration"
```
