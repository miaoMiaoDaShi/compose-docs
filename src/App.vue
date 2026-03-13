<template>
  <div class="app-shell">
    <transition name="top-bar-fade">
      <header v-show="showTopAppBar" class="top-app-bar">
        <div class="brand-lockup">
          <div class="brand-mark">C</div>
          <div>
            <p class="brand-overline">Compose Docs</p>
            <h1 class="brand-title">Compose 小课堂</h1>
          </div>
        </div>
        <div class="top-app-meta">
          <span class="meta-pill">{{ totalSections }} 篇文档</span>
        </div>
      </header>
    </transition>

    <section class="hero-surface">
      <div class="hero-copy">
        <span class="hero-kicker">Material Design 3 学习空间</span>
        <h2>用更清晰的结构，连续掌握 Jetpack Compose。</h2>
        <p>
          以分类导航、阅读卡片和进度反馈组织内容，让你在浏览索引与单篇文档时，
          获得更接近产品级文档站的学习体验。
        </p>
        <div class="hero-tags">
          <span class="hero-tag">循序渐进</span>
          <span class="hero-tag">即时定位</span>
          <span class="hero-tag">专注阅读</span>
        </div>
        <div class="hero-guidance">
          <strong>本轮学习建议</strong>
          <p>{{ studyHint }}</p>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card emphasized">
          <span class="stat-label">当前章节</span>
          <strong>{{ currentChapterName }}</strong>
          <span>{{ currentSectionName }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">学习进度</span>
          <strong>{{ progressText }}</strong>
          <div class="progress-track">
            <div class="progress-value" :style="{ width: `${progressPercent}%` }"></div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-label">最近更新</span>
          <strong>{{ lastUpdate }}</strong>
          <span>时间来自文档索引页</span>
        </div>
        <div class="stat-card accent-card">
          <span class="stat-label">学习节奏</span>
          <strong>{{ studyFocus }}</strong>
          <span>建议先看标题摘要，再进入代码细节</span>
        </div>
      </div>
    </section>

    <section class="mobile-navigation">
      <div class="mobile-navigation-head">
        <div>
          <span class="panel-label">快速导航</span>
          <h3>主题导航</h3>
        </div>
        <span class="mobile-progress">{{ progressText }}</span>
      </div>
      <div class="mobile-section-list">
        <button
          v-for="section in allSections"
          :key="`mobile-${section.id}`"
          class="mobile-section-chip"
          :class="{ active: currentSection === section.id }"
          @click="selectSection(section.id)"
        >
          <span class="mobile-section-order">{{ section.order }}.</span>
          <span>{{ section.name }}</span>
        </button>
      </div>
    </section>

    <div class="workspace">
      <aside class="navigation-panel">
        <div class="panel-head">
          <div>
            <span class="panel-label">课程目录</span>
            <h3>按主题浏览</h3>
          </div>
          <span class="panel-count">{{ totalSections }} 篇</span>
        </div>

        <div class="toc-progress">
          <div class="toc-progress-bar">
            <div class="toc-progress-value" :style="{ width: `${progressPercent}%` }"></div>
          </div>
          <span>{{ progressText }}</span>
        </div>

        <nav class="toc-tree" aria-label="Compose 课程目录">
          <button
            v-for="section in allSections"
            :key="section.id"
            class="section-button"
            :class="{ active: currentSection === section.id }"
            @click="selectSection(section.id)"
          >
            <span class="section-order">{{ section.order }}.</span>
            <span class="section-button-label">{{ section.name }}</span>
          </button>
        </nav>
      </aside>

      <main class="reader-layout">
        <section class="reader-header">
          <div>
            <span class="panel-label">当前阅读</span>
            <h2>{{ currentSectionName }}</h2>
            <p>{{ currentChapterName }} · 第 {{ currentIndex + 1 }} / {{ totalSections }} 篇</p>
          </div>
          <div class="reader-note">
            <span class="reader-note-label">学习提示</span>
            <strong>{{ studyFocus }}</strong>
            <p>{{ studyHint }}</p>
          </div>
          <div class="header-actions">
            <button class="tonal-button" @click="prevSection" :disabled="!prevSectionId">
              上一篇
            </button>
            <button class="filled-button" @click="nextSection" :disabled="!nextSectionId">
              下一篇
            </button>
          </div>
        </section>

        <article class="reader-surface">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在整理课程内容...</p>
          </div>
          <div v-else v-html="renderedContent" class="markdown-content"></div>
        </article>

        <nav class="pager-surface" aria-label="上下篇导航">
          <button class="pager-button subtle" @click="prevSection" :disabled="!prevSectionId">
            <span class="pager-label">上一篇</span>
            <strong>{{ prevSectionName || '已经是第一篇' }}</strong>
          </button>
          <div class="pager-center">
            <span class="panel-label">进度</span>
            <strong>{{ progressText }}</strong>
            <span>继续保持阅读节奏</span>
          </div>
          <button class="pager-button primary" @click="nextSection" :disabled="!nextSectionId">
            <span class="pager-label">下一篇</span>
            <strong>{{ nextSectionName || '已经是最后一篇' }}</strong>
          </button>
        </nav>
      </main>
    </div>

    <footer class="app-footer">
      <p>Compose 小课堂 · 柔和亲和的 Material Design 3 学习界面</p>
      <span>最后更新：{{ lastUpdate }}</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
    }
  })
)

const chapters = ref([])
const currentSection = ref('')
const contentData = ref({})
const loading = ref(true)
const lastUpdate = ref('加载中...')
const showTopAppBar = ref(true)

const createSectionId = (name, path = '') =>
  `${name}-${path}`
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const normalizeDocPath = (path) => path.replace(/^\.\//, '').replace(/^\/+/, '')
const resolveDocUrl = (path) => `/compose-docs/docs/${normalizeDocPath(path)}`

const extractCatalog = (markdown) => {
  const catalogMatch = markdown.match(/##\s+分类导航\s*([\s\S]*?)(?:\n##\s+|$)/)

  if (!catalogMatch) {
    return []
  }

  const categories = []
  let currentCategory = null
  let order = 1

  catalogMatch[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line) {
        return
      }

      const categoryMatch = line.match(/^###\s+(.+)$/)
      if (categoryMatch) {
        currentCategory = {
          id: createSectionId(categoryMatch[1]),
          name: categoryMatch[1],
          sections: [],
        }
        categories.push(currentCategory)
        return
      }

      if (!currentCategory) {
        return
      }

      const docMatch = line.match(/^- \[([^\]]+)\]\(([^)]+)\)\s*(?:-\s*(.+))?$/)
      if (!docMatch) {
        return
      }

      const [, name, path, summary = ''] = docMatch
      currentCategory.sections.push({
        id: createSectionId(name, path),
        name,
        path: normalizeDocPath(path),
        summary: summary.trim(),
        order,
        category: currentCategory.name,
      })
      order += 1
    })

  return categories.filter((category) => category.sections.length > 0)
}

const loadDocContent = async (section) => {
  if (!section || contentData.value[section.id]) {
    return
  }

  const res = await fetch(resolveDocUrl(section.path))
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  contentData.value = {
    ...contentData.value,
    [section.id]: await res.text(),
  }
}

const loadContent = async () => {
  loading.value = true
  contentData.value = {}

  try {
    const res = await fetch('/compose-docs/docs/README.md')
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const fullMd = await res.text()
    const updateMatch = fullMd.match(/最后更新[：:]\s*(\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?)/)
    const parsedChapters = extractCatalog(fullMd)
    const firstSection = parsedChapters[0]?.sections[0] || null

    chapters.value = parsedChapters
    lastUpdate.value = updateMatch ? updateMatch[1] : '未知'

    if (firstSection) {
      currentSection.value = firstSection.id
      await loadDocContent(firstSection)
    }
  } catch (error) {
    console.error('加载失败:', error)
    lastUpdate.value = '读取失败'
  } finally {
    loading.value = false
  }
}

const allSections = computed(() => chapters.value.flatMap((chapter) => chapter.sections))
const currentIndex = computed(() => allSections.value.findIndex((section) => section.id === currentSection.value))
const totalSections = computed(() => allSections.value.length)
const currentSectionData = computed(
  () => allSections.value.find((section) => section.id === currentSection.value) || null
)
const currentSectionName = computed(() => currentSectionData.value?.name || '请选择一个主题')
const currentChapterName = computed(() => currentSectionData.value?.category || '文档索引')
const progressPercent = computed(() => {
  if (totalSections.value === 0 || currentIndex.value < 0) {
    return 0
  }

  return Math.round(((currentIndex.value + 1) / totalSections.value) * 100)
})
const progressText = computed(() => {
  if (totalSections.value === 0 || currentIndex.value < 0) {
    return '0 / 0'
  }

  return `${currentIndex.value + 1} / ${totalSections.value}`
})
const studyFocus = computed(() => {
  if (currentIndex.value < 0) {
    return '准备开始'
  }

  if (progressPercent.value < 30) {
    return '先建立整体心智模型'
  }

  if (progressPercent.value < 70) {
    return '开始进入核心知识区'
  }

  return '适合回顾与串联知识点'
})
const studyHint = computed(() => {
  if (currentIndex.value < 0) {
    return '先从索引页选择一个主题，按分类推进会比在大 README 里翻找更轻松。'
  }

  if (progressPercent.value < 30) {
    return '这一阶段适合先建立分类认知，知道每篇文档解决什么问题，再进入代码细节。'
  }

  if (progressPercent.value < 70) {
    return '这一阶段建议边读边对照代码示例，把组件职责、状态变化和布局思路串起来。'
  }

  return '你已经进入后半程，适合回看相关主题，把零散知识整合成可复用的 Compose 心智模型。'
})
const prevSectionId = computed(() =>
  currentIndex.value > 0 ? allSections.value[currentIndex.value - 1].id : null
)
const nextSectionId = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < totalSections.value - 1
    ? allSections.value[currentIndex.value + 1].id
    : null
)
const prevSectionName = computed(() =>
  prevSectionId.value ? allSections.value.find((section) => section.id === prevSectionId.value)?.name : ''
)
const nextSectionName = computed(() =>
  nextSectionId.value ? allSections.value.find((section) => section.id === nextSectionId.value)?.name : ''
)

const selectSection = async (id) => {
  const section = allSections.value.find((item) => item.id === id)

  if (!section) {
    return
  }

  loading.value = true
  currentSection.value = id

  try {
    await loadDocContent(section)
  } catch (error) {
    console.error('读取文档失败:', error)
    contentData.value = {
      ...contentData.value,
      [id]: '# 文档读取失败\n\n请检查索引中的路径是否正确。',
    }
  } finally {
    loading.value = false
  }
}

const prevSection = async () => {
  if (prevSectionId.value) {
    await selectSection(prevSectionId.value)
  }
}

const nextSection = async () => {
  if (nextSectionId.value) {
    await selectSection(nextSectionId.value)
  }
}

const renderedContent = computed(() => {
  const md = contentData.value[currentSection.value] || '# 暂无内容\n\n请选择一篇文档开始阅读。'
  return marked.parse(md)
})

const updateTopAppBarVisibility = () => {
  showTopAppBar.value = window.scrollY <= 16
}

onMounted(() => {
  updateTopAppBarVisibility()
  window.addEventListener('scroll', updateTopAppBarVisibility, { passive: true })
  loadContent()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateTopAppBarVisibility)
})
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: 24px;
  color: var(--md-sys-color-on-surface);
}

.top-app-bar,
.hero-surface,
.navigation-panel,
.reader-surface,
.pager-surface,
.app-footer,
.mobile-navigation {
  border: 1px solid rgba(205, 195, 211, 0.72);
  background: rgba(255, 255, 255, 0.76);
  backdrop-filter: blur(22px);
  box-shadow: var(--md-sys-elevation-2);
}

.top-app-bar {
  max-width: 1440px;
  margin: 0 auto 20px;
  padding: 16px 20px;
  border-radius: var(--md-sys-shape-corner-large);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 16px;
  z-index: 20;
}

.top-bar-fade-enter-active,
.top-bar-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.top-bar-fade-enter-from,
.top-bar-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--md-sys-color-primary-container), #f6edff);
  color: var(--md-sys-color-on-primary-container);
  font-size: 1.25rem;
  font-weight: 800;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.brand-overline,
.panel-label,
.stat-label,
.pager-label {
  display: inline-block;
  margin: 0 0 6px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--md-sys-color-primary);
}

.brand-title {
  margin: 0;
  font-size: clamp(1.2rem, 2vw, 1.45rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  font-size: 0.92rem;
  font-weight: 600;
}

.hero-surface {
  max-width: 1440px;
  margin: 0 auto 24px;
  padding: 28px;
  border-radius: var(--md-sys-shape-corner-extra-large);
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.95fr);
  gap: 20px;
}

.hero-copy h2 {
  margin: 0 0 14px;
  font-size: clamp(2rem, 4.4vw, 3.25rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.hero-copy p {
  margin: 0;
  max-width: 720px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 1rem;
  line-height: 1.8;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: var(--md-sys-shape-corner-full);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(205, 195, 211, 0.88);
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.9rem;
  font-weight: 600;
}

.hero-guidance {
  margin-top: 18px;
  max-width: 700px;
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(205, 195, 211, 0.72);
}

.hero-guidance strong {
  display: block;
  margin-bottom: 8px;
  font-size: 0.98rem;
}

.hero-guidance p {
  font-size: 0.94rem;
  line-height: 1.72;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  margin-bottom: 18px;
  border-radius: var(--md-sys-shape-corner-full);
  background: rgba(234, 223, 255, 0.8);
  color: var(--md-sys-color-on-primary-container);
  font-size: 0.88rem;
  font-weight: 700;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  padding: 18px 18px 20px;
  border-radius: var(--md-sys-shape-corner-large);
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid rgba(205, 195, 211, 0.72);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card.emphasized {
  background: linear-gradient(160deg, rgba(234, 223, 255, 0.95), rgba(255, 255, 255, 0.9));
}

.stat-card.accent-card {
  background: linear-gradient(160deg, rgba(255, 241, 231, 0.95), rgba(255, 255, 255, 0.92));
}

.stat-card strong {
  font-size: 1.05rem;
  line-height: 1.4;
}

.stat-card span:last-child {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.9rem;
}

.progress-track,
.toc-progress-bar {
  width: 100%;
  height: 8px;
  border-radius: var(--md-sys-shape-corner-full);
  background: rgba(205, 195, 211, 0.7);
  overflow: hidden;
}

.progress-value,
.toc-progress-value {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--md-sys-color-primary), #a48ad1);
}

.mobile-navigation {
  display: none;
  max-width: 1440px;
  margin: 0 auto 20px;
  padding: 18px;
  border-radius: var(--md-sys-shape-corner-large);
}

.mobile-navigation-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.mobile-navigation-head h3 {
  margin: 0;
  font-size: 1.15rem;
}

.mobile-progress {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.92rem;
  font-weight: 600;
}

.mobile-section-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.mobile-section-chip {
  flex: 0 0 auto;
  min-height: 38px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(205, 195, 211, 0.85);
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-surface-container-lowest);
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: 0.18s ease;
}

.mobile-section-order {
  font-weight: 700;
}

.mobile-section-chip:hover,
.mobile-section-chip.active {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border-color: transparent;
}

.workspace {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.navigation-panel {
  position: sticky;
  top: 104px;
  padding: 20px;
  border-radius: var(--md-sys-shape-corner-extra-large);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.panel-head h3,
.reader-header h2 {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.25;
}

.panel-count,
.reader-header p,
.toc-progress span,
.pager-center span,
.app-footer span,
.app-footer p {
  color: var(--md-sys-color-on-surface-variant);
}

.toc-progress {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.toc-tree {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-button {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 0 14px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  text-align: left;
  cursor: pointer;
  transition: 0.18s ease;
}

.section-button:hover {
  background: rgba(234, 223, 255, 0.5);
  color: var(--md-sys-color-on-surface);
}

.section-button.active {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.section-order {
  min-width: 28px;
  font-weight: 800;
  opacity: 0.82;
}

.section-button-label {
  line-height: 1.45;
}

.reader-layout {
  min-width: 0;
}

.reader-header {
  margin-bottom: 16px;
  padding: 8px 4px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}

.reader-header p {
  margin: 8px 0 0;
}

.reader-note {
  min-width: 240px;
  max-width: 320px;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(205, 195, 211, 0.72);
}

.reader-note-label {
  display: inline-block;
  margin-bottom: 6px;
  color: var(--md-sys-color-primary);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.reader-note strong {
  display: block;
  margin-bottom: 6px;
  font-size: 0.98rem;
}

.reader-note p {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.88rem;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tonal-button,
.filled-button {
  min-height: 44px;
  padding: 0 18px;
  border-radius: var(--md-sys-shape-corner-full);
  border: 0;
  font-weight: 700;
  cursor: pointer;
  transition: 0.18s ease;
}

.tonal-button {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.filled-button {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  box-shadow: var(--md-sys-elevation-1);
}

.tonal-button:hover:not(:disabled),
.filled-button:hover:not(:disabled),
.pager-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--md-sys-elevation-2);
}

.tonal-button:disabled,
.filled-button:disabled,
.pager-button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reader-surface {
  min-height: 700px;
  padding: clamp(22px, 4vw, 44px);
  border-radius: calc(var(--md-sys-shape-corner-extra-large) + 4px);
}

.loading-state {
  min-height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--md-sys-color-on-surface-variant);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 4px solid rgba(205, 195, 211, 0.7);
  border-top-color: var(--md-sys-color-primary);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.markdown-content {
  color: var(--md-sys-color-on-surface);
  line-height: 1.82;
  font-size: 1rem;
}

.markdown-content :deep(h1) {
  margin: 0 0 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(205, 195, 211, 0.9);
  font-size: clamp(1.9rem, 3vw, 2.55rem);
  line-height: 1.16;
  letter-spacing: -0.03em;
}

.markdown-content :deep(h2) {
  margin: 36px 0 14px;
  font-size: 1.6rem;
  line-height: 1.28;
}

.markdown-content :deep(h3) {
  margin: 28px 0 12px;
  font-size: 1.2rem;
  line-height: 1.34;
}

.markdown-content :deep(p),
.markdown-content :deep(ul),
.markdown-content :deep(ol),
.markdown-content :deep(blockquote),
.markdown-content :deep(pre),
.markdown-content :deep(table) {
  margin: 16px 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 24px;
}

.markdown-content :deep(li) {
  margin: 8px 0;
}

.markdown-content :deep(a) {
  color: var(--md-sys-color-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
}

.markdown-content :deep(a:hover) {
  border-color: currentColor;
}

.markdown-content :deep(strong) {
  font-weight: 700;
}

.markdown-content :deep(code) {
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(234, 223, 255, 0.7);
  color: var(--md-sys-color-on-primary-container);
  font-size: 0.92em;
  font-family: 'Consolas', 'SFMono-Regular', monospace;
}

.markdown-content :deep(pre) {
  padding: 20px 22px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(40, 31, 59, 0.98), rgba(31, 26, 45, 0.98));
  color: #f4edff;
  overflow-x: auto;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.markdown-content :deep(pre code) {
  padding: 0;
  background: transparent;
  color: inherit;
}

/* 语法高亮：保留代码块背景，使用 highlight.js 的 token 颜色 */
.markdown-content :deep(pre code.hljs) {
  background: transparent;
  padding: 0;
}
.markdown-content :deep(pre .hljs) {
  background: transparent;
}

.markdown-content :deep(blockquote) {
  padding: 16px 18px;
  border-left: 4px solid var(--md-sys-color-primary);
  border-radius: 0 18px 18px 0;
  background: rgba(234, 223, 255, 0.45);
  color: var(--md-sys-color-on-surface-variant);
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: 20px;
  background: var(--md-sys-color-surface-container-low);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 14px 16px;
  border: 1px solid rgba(205, 195, 211, 0.88);
  text-align: left;
  vertical-align: top;
}

.markdown-content :deep(th) {
  background: rgba(234, 223, 255, 0.55);
  font-weight: 700;
}

.pager-surface {
  margin-top: 18px;
  padding: 18px;
  border-radius: var(--md-sys-shape-corner-extra-large);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
}

.pager-button {
  width: 100%;
  padding: 16px 18px;
  border: 0;
  border-radius: 22px;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  transition: 0.18s ease;
}

.pager-button strong {
  font-size: 0.98rem;
  line-height: 1.5;
}

.pager-button.subtle {
  background: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
}

.pager-button.primary {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.pager-center {
  border-radius: 22px;
  background: var(--md-sys-color-surface-container-low);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  padding: 16px;
}

.pager-center strong {
  font-size: 1.3rem;
}

.app-footer {
  max-width: 1440px;
  margin: 24px auto 0;
  padding: 18px 20px;
  border-radius: var(--md-sys-shape-corner-large);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.92rem;
}

.app-footer p,
.app-footer span {
  margin: 0;
}

@media (max-width: 1180px) {
  .hero-surface {
    grid-template-columns: 1fr;
  }

  .workspace {
    grid-template-columns: 280px minmax(0, 1fr);
  }

  .pager-surface {
    grid-template-columns: 1fr;
  }

  .pager-center {
    order: -1;
  }
}

@media (max-width: 960px) {
  .app-shell {
    padding: 16px;
  }

  .top-app-bar {
    top: 12px;
    margin-bottom: 16px;
  }

  .mobile-navigation {
    display: block;
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .navigation-panel {
    display: none;
  }

  .reader-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .reader-note {
    max-width: none;
    width: 100%;
  }

  .reader-surface {
    min-height: 560px;
  }
}

@media (max-width: 640px) {
  .top-app-bar,
  .hero-surface,
  .mobile-navigation,
  .reader-surface,
  .pager-surface,
  .app-footer {
    border-radius: 24px;
  }

  .top-app-bar {
    padding: 14px 16px;
  }

  .brand-mark {
    width: 42px;
    height: 42px;
    border-radius: 15px;
  }

  .hero-surface,
  .mobile-navigation,
  .pager-surface {
    padding: 18px;
  }

  .header-actions {
    width: 100%;
  }

  .tonal-button,
  .filled-button {
    flex: 1;
  }
}
</style>
