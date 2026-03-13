<template>
  <div class="app-shell">
    <header class="top-app-bar">
      <div class="brand-lockup">
        <div class="brand-mark">C</div>
        <div>
          <p class="brand-overline">Compose Docs</p>
          <h1 class="brand-title">Compose 小课堂</h1>
        </div>
      </div>
      <div class="top-app-meta">
        <span class="meta-pill">{{ totalSections }} 个知识点</span>
      </div>
    </header>

    <section class="hero-surface">
      <div class="hero-copy">
        <span class="hero-kicker">Material Design 3 学习空间</span>
        <h2>用更清晰的结构，连续掌握 Jetpack Compose。</h2>
        <p>
          以章节导航、阅读卡片和进度反馈组织内容，让你在浏览 README 的同时，
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
          <span>内容来自项目 README</span>
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
          <h3>{{ currentChapterName }}</h3>
        </div>
        <span class="mobile-progress">{{ progressText }}</span>
      </div>
      <div
        v-for="(chapter, chapterIndex) in chapters"
        :key="`mobile-${chapter.id}`"
        class="mobile-chapter"
      >
        <div class="mobile-chapter-title">
          <span class="chapter-badge">{{ chapterBadge(chapterIndex) }}</span>
          <span>{{ chapter.name }}</span>
        </div>
        <div class="mobile-section-list">
          <button
            v-for="section in chapter.sections"
            :key="section.id"
            class="mobile-section-chip"
            :class="{ active: currentSection === section.id }"
            @click="selectSection(section.id)"
          >
            {{ section.name }}
          </button>
        </div>
      </div>
    </section>

    <div class="workspace">
      <aside class="navigation-panel">
        <div class="panel-head">
          <div>
            <span class="panel-label">课程目录</span>
            <h3>按章节浏览</h3>
          </div>
          <span class="panel-count">{{ totalSections }} 节</span>
        </div>

        <div class="toc-progress">
          <div class="toc-progress-bar">
            <div class="toc-progress-value" :style="{ width: `${progressPercent}%` }"></div>
          </div>
          <span>{{ progressText }}</span>
        </div>

        <nav class="toc-tree" aria-label="Compose 课程目录">
          <section
            v-for="(chapter, chapterIndex) in chapters"
            :key="chapter.id"
            class="chapter-group"
          >
            <button class="chapter-toggle" @click="toggleChapter(chapter.id)">
              <span class="chapter-badge">{{ chapterBadge(chapterIndex) }}</span>
              <span class="chapter-title-block">
                <span class="chapter-title">{{ chapter.name }}</span>
                <span class="chapter-summary">{{ chapter.sections.length }} 个主题</span>
              </span>
              <span class="toggle-icon" :class="{ expanded: expandedChapters.includes(chapter.id) }">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9.29 6.71a1 1 0 0 1 1.42 0l4.59 4.59a1 1 0 0 1 0 1.41l-4.59 4.59a1 1 0 1 1-1.42-1.41L13.17 12 9.29 8.12a1 1 0 0 1 0-1.41Z" />
                </svg>
              </span>
            </button>

            <div v-show="expandedChapters.includes(chapter.id)" class="chapter-sections">
              <button
                v-for="section in chapter.sections"
                :key="section.id"
                class="section-button"
                :class="{ active: currentSection === section.id }"
                @click="selectSection(section.id)"
              >
                <span class="section-dot"></span>
                <span class="section-button-label">{{ section.name }}</span>
              </button>
            </div>
          </section>
        </nav>
      </aside>

      <main class="reader-layout">
        <section class="reader-header">
          <div>
            <span class="panel-label">当前阅读</span>
            <h2>{{ currentSectionName }}</h2>
            <p>{{ currentChapterName }} · 第 {{ currentIndex + 1 }} / {{ totalSections }} 节</p>
          </div>
          <div class="reader-note">
            <span class="reader-note-label">学习提示</span>
            <strong>{{ studyFocus }}</strong>
            <p>{{ studyHint }}</p>
          </div>
          <div class="header-actions">
            <button class="tonal-button" @click="prevSection" :disabled="!prevSectionId">
              上一节
            </button>
            <button class="filled-button" @click="nextSection" :disabled="!nextSectionId">
              下一节
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
            <strong>{{ prevSectionName || '已经是第一节' }}</strong>
          </button>
          <div class="pager-center">
            <span class="panel-label">进度</span>
            <strong>{{ progressText }}</strong>
            <span>继续保持阅读节奏</span>
          </div>
          <button class="pager-button primary" @click="nextSection" :disabled="!nextSectionId">
            <span class="pager-label">下一篇</span>
            <strong>{{ nextSectionName || '已经是最后一节' }}</strong>
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
import { computed, onMounted, ref } from 'vue'
import { marked } from 'marked'

const chapters = ref([])
const expandedChapters = ref([])
const currentSection = ref('')
const contentData = ref({})
const loading = ref(true)
const lastUpdate = ref('加载中...')

const chapterBadge = (index) => String(index + 1).padStart(2, '0')

const loadContent = async () => {
  loading.value = true
  contentData.value = {}

  try {
    const res = await fetch('/compose-docs/docs/README.md')
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const fullMd = await res.text()
    const updateMatch = fullMd.match(/[*🕐\s]*最后更新[：:]\s*(\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2})/)

    lastUpdate.value = updateMatch ? updateMatch[1] : '未知'

    const sectionPattern = /##\s*(\d+)\.\s*([^\n#][^\n]*)/g
    const parsedSections = []
    let match

    while ((match = sectionPattern.exec(fullMd)) !== null) {
      const num = Number.parseInt(match[1], 10)
      const name = match[2].trim()
      const id = name
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      parsedSections.push({ num, id, name })
    }

    const chapterMap = new Map()
    const chineseNums = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

    parsedSections.forEach((section, index) => {
      const chapterIndex = Math.floor(index / 10)
      const chapterId = `section-${chapterIndex}`
      const chapterName = `第${chineseNums[chapterIndex + 1] || chapterIndex + 1}章`

      if (!chapterMap.has(chapterId)) {
        chapterMap.set(chapterId, {
          id: chapterId,
          name: chapterName,
          sections: [],
        })
      }

      chapterMap.get(chapterId).sections.push({
        id: section.id,
        name: section.name,
        order: section.num,
      })

      const sectionTitle = section.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const contentMatch = fullMd.match(
        new RegExp(`##\\s*${section.num}\\.\\s*${sectionTitle}[\\s\\S]*?(?=##\\s*\\d+\\.|$)`, 'i')
      )

      if (contentMatch) {
        contentData.value[section.id] = contentMatch[0]
      }
    })

    chapters.value = Array.from(chapterMap.values())
    expandedChapters.value = chapters.value.map((chapter) => chapter.id)

    if (parsedSections.length > 0) {
      currentSection.value = parsedSections[0].id
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
const currentChapter = computed(
  () => chapters.value.find((chapter) => chapter.sections.some((section) => section.id === currentSection.value)) || null
)
const currentChapterName = computed(() => currentChapter.value?.name || '课程概览')
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
    return '从第一节开始，先熟悉整体目录，再按顺序推进会更轻松。'
  }

  if (progressPercent.value < 30) {
    return '这一阶段适合快速浏览概念边界，先理解“为什么有这些能力”，不要急着记住所有细节。'
  }

  if (progressPercent.value < 70) {
    return '这一阶段建议边读边对照代码示例，把组件职责、状态变化和布局思路串起来。'
  }

  return '你已经进入后半程，适合带着问题回看重点章节，把零散知识整理成自己的理解框架。'
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

const toggleChapter = (id) => {
  const index = expandedChapters.value.indexOf(id)

  if (index >= 0) {
    expandedChapters.value.splice(index, 1)
    return
  }

  expandedChapters.value.push(id)
}

const selectSection = (id) => {
  currentSection.value = id

  for (const chapter of chapters.value) {
    if (chapter.sections.some((section) => section.id === id) && !expandedChapters.value.includes(chapter.id)) {
      expandedChapters.value.push(chapter.id)
    }
  }
}

const prevSection = () => {
  if (prevSectionId.value) {
    selectSection(prevSectionId.value)
  }
}

const nextSection = () => {
  if (nextSectionId.value) {
    selectSection(nextSectionId.value)
  }
}

const renderedContent = computed(() => {
  const md = contentData.value[currentSection.value] || '# 暂无内容\n\n请选择一个章节开始阅读。'
  return marked(md)
})

onMounted(() => {
  loadContent()
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

.mobile-chapter + .mobile-chapter {
  margin-top: 14px;
}

.mobile-chapter-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 0.95rem;
  font-weight: 700;
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
  border: 1px solid rgba(205, 195, 211, 0.85);
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-surface-container-lowest);
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: 0.18s ease;
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

.chapter-group {
  border-radius: var(--md-sys-shape-corner-large);
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid rgba(205, 195, 211, 0.7);
  overflow: hidden;
}

.chapter-toggle {
  width: 100%;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.18s ease;
}

.chapter-toggle:hover {
  background: rgba(234, 223, 255, 0.4);
}

.chapter-badge {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  font-size: 0.8rem;
  font-weight: 800;
}

.chapter-title-block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chapter-title {
  font-weight: 700;
}

.chapter-summary {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.85rem;
}

.toggle-icon {
  width: 24px;
  height: 24px;
  color: var(--md-sys-color-on-surface-variant);
  transition: transform 0.18s ease;
}

.toggle-icon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.toggle-icon.expanded {
  transform: rotate(90deg);
}

.chapter-sections {
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.65;
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
