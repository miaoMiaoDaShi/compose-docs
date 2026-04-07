<template>
  <div class="page-shell home-page">
    <header class="top-app-bar">
      <div class="brand-lockup">
        <div class="brand-mark">C</div>
        <div>
          <p class="brand-overline">Compose Docs</p>
          <h1 class="brand-title">Compose 小课堂</h1>
        </div>
      </div>
      <span class="meta-pill">{{ totalDocs }} 篇文档</span>
    </header>

    <section class="hero-surface">
      <div class="hero-copy">
        <span class="hero-kicker">Material Design 3 学习空间</span>
        <h2>用更清晰的结构，连续掌握 Jetpack Compose。</h2>
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

    <section v-if="error" class="reader-surface state-surface">
      <h2>索引读取失败</h2>
      <p>{{ error.message }}</p>
    </section>

    <section v-else-if="loading" class="reader-surface state-surface">
      <div class="loading-spinner"></div>
      <p>正在加载文档索引...</p>
    </section>

    <template v-else>
      <section class="search-surface">
        <div class="search-copy">
          <span class="panel-label">快速查找</span>
          <h2>按标题、摘要或分类定位主题</h2>
          <p>想直接进入某个知识点时，从这里搜会比沿着分类逐层翻找更快。</p>
        </div>
        <div class="search-box">
          <input
            v-model.trim="searchQuery"
            type="search"
            class="search-input"
            placeholder="比如：Navigation、动画、性能、TextField"
            aria-label="搜索文档"
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

      <section v-if="hasSearchQuery" class="search-results">
        <div class="panel-head search-head">
          <div>
            <span class="panel-label">搜索结果</span>
            <h2>{{ searchHeadline }}</h2>
          </div>
          <span class="panel-count">{{ filteredDocs.length }} 条</span>
        </div>

        <div v-if="filteredDocs.length" class="search-result-list">
          <RouterLink
            v-for="doc in filteredDocs"
            :key="doc.slug"
            :to="{ name: 'doc', params: { slug: doc.slug } }"
            class="search-result-card"
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useDocsIndex } from '../composables/useDocsIndex'
import { useSeo } from '../composables/useSeo'

const { load, docs, categories, lastUpdated, totalDocs, error, loading } = useDocsIndex()
const { setSeo } = useSeo()
const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://example.com/compose-docs').replace(/\/$/, '')
const searchQuery = ref('')
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
})
</script>
