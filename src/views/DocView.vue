<template>
  <div class="page-shell doc-page">
    <header class="top-app-bar compact-bar">
      <RouterLink :to="{ name: 'home' }" class="brand-lockup brand-link">
        <div class="brand-mark">C</div>
        <div>
          <p class="brand-overline">Compose Docs</p>
          <h1 class="brand-title">Compose 小课堂</h1>
        </div>
      </RouterLink>
      <div class="top-app-meta">
        <span class="meta-pill">{{ progressText }}</span>
      </div>
    </header>

    <div class="workspace doc-workspace">
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
            v-for="doc in docs"
            :key="doc.slug"
            :to="{ name: 'doc', params: { slug: doc.slug } }"
            class="section-button"
            :class="{ active: currentDoc?.slug === doc.slug }"
          >
            <span class="section-order">{{ doc.order }}.</span>
            <span class="section-copy">
              <span class="section-button-label">{{ doc.title }}</span>
              <span class="section-summary">{{ doc.summary }}</span>
            </span>
          </RouterLink>
        </nav>
      </aside>

      <main class="reader-layout">
        <section v-if="state === 'ready' && currentDoc" class="reader-header">
          <div>
            <span class="panel-label">当前阅读</span>
            <h2>{{ currentDoc.title }}</h2>
            <p>{{ currentDoc.category }} · 第 {{ currentIndex + 1 }} / {{ docs.length }} 篇</p>
          </div>
          <div class="reader-note">
            <span class="reader-note-label">阅读提示</span>
            <strong>{{ currentDoc.category }}</strong>
            <p>{{ currentDoc.summary }}</p>
          </div>
          <div class="header-actions">
            <button class="tonal-button" :disabled="!previousDoc" @click="goToDoc(previousDoc)">上一篇</button>
            <button class="filled-button" :disabled="!nextDoc" @click="goToDoc(nextDoc)">下一篇</button>
          </div>
        </section>

        <div v-if="state === 'ready'" class="reading-progress-bar" aria-hidden="true">
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
              :class="{ nested: heading.level === 3, active: activeHeadingId === heading.id }"
              @click.prevent="jumpToHeading(heading.id)"
            >
              {{ heading.text }}
            </a>
          </nav>
        </section>

        <section v-if="state === 'loading'" class="reader-surface state-surface">
          <div class="loading-spinner"></div>
          <p>正在整理课程内容...</p>
        </section>

        <section v-else-if="state === 'notFound'" class="reader-surface state-surface">
          <h2>未找到这篇文档</h2>
          <p>当前地址没有对应的文档索引，请返回首页重新选择主题。</p>
          <RouterLink :to="{ name: 'home' }" class="filled-button link-button">返回首页</RouterLink>
        </section>

        <section v-else-if="state === 'loadError'" class="reader-surface state-surface">
          <h2>文档读取失败</h2>
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
          @click="scrollToTop"
        >
          回到顶部
        </button>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocContent } from '../composables/useDocContent'
import { useDocsIndex } from '../composables/useDocsIndex'
import { useReadingNavigation } from '../composables/useReadingNavigation'
import { useReaderNavigation } from '../composables/useReaderNavigation'
import { useSeo } from '../composables/useSeo'
import { parseMarkdown } from '../lib/markdown'

const route = useRoute()
const router = useRouter()
const { setSeo } = useSeo()
const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://example.com/compose-docs').replace(/\/$/, '')
const slug = computed(() => String(route.params.slug || ''))

const { docs, load: loadIndex } = useDocsIndex()
const { load: loadContent, getContent } = useDocContent()
const { currentIndex, currentDoc, previousDoc, nextDoc, progressText, progressPercent } = useReaderNavigation(docs, slug)

const viewState = ref('loading')
const errorMessage = ref('')
const content = computed(() => getContent(slug.value).value)
const state = computed(() => viewState.value)
const parsedContent = computed(() => parseMarkdown(content.value || '# 暂无内容'))
const renderedContent = computed(() => parsedContent.value.html)
const tocHeadings = computed(() => parsedContent.value.headings)
const articleRef = ref(null)
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

watchEffect(() => {
  const canonical = `${siteUrl}/docs/${slug.value}`

  if (currentDoc.value) {
    setSeo({
      title: `${currentDoc.value.title} | Compose 小课堂`,
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

function goToDoc(target) {
  if (target?.slug) {
    router.push({ name: 'doc', params: { slug: target.slug } })
  }
}

watch(slug, () => {
  hydrate()
}, { immediate: true })
</script>
