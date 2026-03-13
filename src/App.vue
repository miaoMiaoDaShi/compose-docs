<template>
  <div class="app-container">
    <!-- Header - M3 CenterAlignedTopAppBar -->
    <header class="header">
      <div class="header-content">
        <div class="header-icon">📱</div>
        <div>
          <h1 class="logo">Compose 小课堂</h1>
          <p class="subtitle">每天进步一点点</p>
        </div>
      </div>
    </header>

    <div class="main-layout">
      <!-- Left Sidebar - M3 NavigationRail style -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <span class="toc-title">知识目录</span>
        </div>
        
        <nav class="toc">
          <div 
            v-for="chapter in chapters" 
            :key="chapter.id"
            class="chapter"
          >
            <div 
              class="chapter-title"
              @click="toggleChapter(chapter.id)"
            >
              <span class="chapter-icon">{{ chapter.icon }}</span>
              <span class="chapter-name">{{ chapter.name }}</span>
              <span class="expand-icon" :class="{ expanded: expandedChapters.includes(chapter.id) }">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L15 12L10 18L8.59 16.59Z"/>
                </svg>
              </span>
            </div>
            
            <div 
              class="chapter-sections"
              v-show="expandedChapters.includes(chapter.id)"
            >
              <div 
                v-for="section in chapter.sections"
                :key="section.id"
                class="section-item"
                :class="{ active: currentSection === section.id }"
                @click="selectSection(section.id)"
              >
                <span class="section-name">{{ section.name }}</span>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="content">
        <div class="content-card">
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          <div v-else v-html="renderedContent" class="markdown-content"></div>
        </div>
        
        <!-- Bottom Navigation -->
        <div class="bottom-nav">
          <button 
            class="nav-btn prev" 
            @click="prevSection"
            :disabled="!prevSectionId"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z"/>
            </svg>
            上一页
          </button>
          <span class="nav-info">{{ currentIndex + 1 }} / {{ totalSections }}</span>
          <button 
            class="nav-btn next" 
            @click="nextSection"
            :disabled="!nextSectionId"
          >
            下一页
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L15 12L10 18L8.59 16.59Z"/>
            </svg>
          </button>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>最后更新: {{ lastUpdate }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'

// 章节数据 - 动态从 README 加载
const chapters = ref([])
const expandedChapters = ref([])
const currentSection = ref('composable')
const contentData = ref({})
const loading = ref(true)
const lastUpdate = ref('加载中...')

// 加载内容 - 从 README.md 读取
const loadContent = async () => {
  loading.value = true
  try {
    const res = await fetch('/compose-docs/docs/README.md')
    if (res.ok) {
      const fullMd = await res.text()
      
      // 提取最后更新时间
      const updateMatch = fullMd.match(/[*🕐\s]*最后更新[：:]\s*(\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2})/)
      if (updateMatch) {
        lastUpdate.value = updateMatch[1]
      } else {
        lastUpdate.value = '未知'
      }
      
      // 解析所有 ## 数字. 标题 格式的章节
      const sectionPattern = /##\s*(\d+)\.\s*([^\n#][^\n]*)/g
      const allSections = []
      let match
      while ((match = sectionPattern.exec(fullMd)) !== null) {
        const num = parseInt(match[1])
        const name = match[2].trim()
        // 生成唯一 id
        const id = name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
        allSections.push({ num, id, name })
      }
      
      // 按数字顺序构建章节 - 每10个为一组
      const chapterMap = new Map()
      const chineseNums = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
      const chapterIcons = ['📖', '🧱', '🗺️', '⚡', '🖌️', '💎', '🎥', '🔬', '💾', '🏗️', '📚', '🚀', '🎯', '✨', '📦']
      
      allSections.forEach((section, idx) => {
        const chapterIdx = Math.floor(idx / 10)
        const chapterId = `section-${chapterIdx}`
        const chapterName = `第${chineseNums[chapterIdx + 1] || chapterIdx + 1}章`
        
        if (!chapterMap.has(chapterId)) {
          chapterMap.set(chapterId, {
            id: chapterId,
            name: chapterName,
            icon: chapterIcons[chapterIdx % chapterIcons.length],
            sections: []
          })
        }
        chapterMap.get(chapterId).sections.push({
          id: section.id,
          name: section.name,
          icon: '📄'
        })
        // 同时按 id 存储内容
        const contentMatch = fullMd.match(new RegExp(`##\\s*${section.num}\\.\\s*${section.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=##\\s*\\d+\\.|$)`, 'i'))
        if (contentMatch) {
          contentData.value[section.id] = contentMatch[0]
        }
      })
      
      chapters.value = Array.from(chapterMap.values())
      expandedChapters.value = chapters.value.map(c => c.id)
      
      // 设置第一个可见章节为当前
      if (allSections.length > 0) {
        currentSection.value = allSections[0].id
      }
    }
  } catch (e) {
    console.log('加载失败:', e)
  } finally {
    loading.value = false
  }
}

const renderedContent = computed(() => {
  const md = contentData.value[currentSection.value] || '# 加载中...\n\n请选择左侧章节'
  return marked(md)
})

const allSections = computed(() => chapters.value.flatMap(c => c.sections))
const currentIndex = computed(() => 
  allSections.value.findIndex(s => s.id === currentSection.value)
)
const totalSections = computed(() => allSections.value.length)
const prevSectionId = computed(() => 
  currentIndex.value > 0 ? allSections.value[currentIndex.value - 1].id : null
)
const nextSectionId = computed(() => 
  currentIndex.value < totalSections.value - 1 ? allSections.value[currentIndex.value + 1].id : null
)

const toggleChapter = (id) => {
  const idx = expandedChapters.value.indexOf(id)
  if (idx > -1) {
    expandedChapters.value.splice(idx, 1)
  } else {
    expandedChapters.value.push(id)
  }
}

const selectSection = (id) => {
  currentSection.value = id
  // 自动展开所属章节
  for (const chapter of chapters.value) {
    if (chapter.sections.some(s => s.id === id)) {
      if (!expandedChapters.value.includes(chapter.id)) {
        expandedChapters.value.push(chapter.id)
      }
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

onMounted(() => {
  loadContent()
})
</script>

<style scoped>
/* Material Design 3 Design Tokens */
:root {
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #EADDFF;
  --md-sys-color-on-primary-container: #21005D;
  --md-sys-color-secondary: #625B71;
  --md-sys-color-on-secondary: #FFFFFF;
  --md-sys-color-secondary-container: #E8DEF8;
  --md-sys-color-on-secondary-container: #1D192B;
  --md-sys-color-tertiary: #7D5260;
  --md-sys-color-on-tertiary: #FFFFFF;
  --md-sys-color-tertiary-container: #FFD8E4;
  --md-sys-color-on-tertiary-container: #31111D;
  --md-sys-color-surface: #FFFBFE;
  --md-sys-color-surface-dim: #DED8E1;
  --md-sys-color-surface-bright: #FFFBFE;
  --md-sys-color-surface-container-lowest: #FFFFFF;
  --md-sys-color-surface-container-low: #F7F2FA;
  --md-sys-color-surface-container: #F3EDF7;
  --md-sys-color-surface-container-high: #ECE6F0;
  --md-sys-color-surface-container-highest: #E6E0E9;
  --md-sys-color-surface-variant: #E7E0EC;
  --md-sys-color-on-surface: #1C1B1F;
  --md-sys-color-on-surface-variant: #49454F;
  --md-sys-color-outline: #79747E;
  --md-sys-color-outline-variant: #CAC4D0;
  --md-sys-color-inverse-surface: #313033;
  --md-sys-color-inverse-on-surface: #F4EFF4;
  --md-sys-color-error: #B3261E;
  --md-sys-color-on-error: #FFFFFF;
  --md-sys-color-error-container: #F9DEDC;
  --md-ref-typeface-plain: 'Roboto', sans-serif;
  --md-sys-shape-corner-none: 0px;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-extra-large: 28px;
  --md-sys-shape-corner-full: 9999px;
}

/* Import Roboto font */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');

/* Global Styles */
.app-container {
  min-height: 100vh;
  background: var(--md-sys-color-surface-container);
  font-family: var(--md-ref-typeface-plain);
  color: var(--md-sys-color-on-surface);
}

/* Header - M3 CenterAlignedTopAppBar */
.header {
  background: var(--md-sys-color-surface);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 1200px;
  width: 100%;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: var(--md-sys-color-primary-container);
  border-radius: var(--md-sys-shape-corner-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.logo {
  font-size: 1.375rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  margin: 0;
  letter-spacing: 0;
}

.subtitle {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.875rem;
  font-weight: 400;
  margin: 0;
}

/* Main Layout - M3 NavigationRail style */
.main-layout {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 0;
}

/* Sidebar - M3 NavigationRail */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--md-sys-color-surface);
  border-right: 1px solid var(--md-sys-color-outline-variant);
  padding: 16px 0;
  position: sticky;
  top: 73px;
  height: calc(100vh - 73px);
  overflow-y: auto;
}

.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-full);
}

.sidebar-header {
  padding: 0 24px 16px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  margin-bottom: 8px;
}

.toc-title {
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chapter {
  margin-bottom: 2px;
}

.chapter-title {
  display: flex;
  align-items: center;
  padding: 10px 24px;
  cursor: pointer;
  transition: background 0.15s;
  gap: 12px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.9375rem;
  font-weight: 500;
}

.chapter-title:hover {
  background: var(--md-sys-color-surface-container-high);
}

.chapter-title:active {
  background: var(--md-sys-color-secondary-container);
}

.chapter-icon {
  font-size: 1.125rem;
  width: 24px;
  text-align: center;
}

.chapter-name {
  flex: 1;
}

.expand-icon {
  font-size: 1.125rem;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.chapter-sections {
  padding-left: 12px;
}

.section-item {
  display: flex;
  align-items: center;
  padding: 8px 24px 8px 56px;
  cursor: pointer;
  transition: all 0.15s;
  gap: 12px;
  font-size: 0.875rem;
  color: var(--md-sys-color-on-surface-variant);
}

.section-item:hover {
  background: var(--md-sys-color-surface-container-high);
}

.section-item:active {
  background: var(--md-sys-color-secondary-container);
}

.section-item.active {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.section-name {
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Content - M3 Card */
.content {
  flex: 1;
  min-width: 0;
  padding: 24px 48px;
}

.content-card {
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-shape-corner-extra-large);
  padding: 40px 48px;
  box-shadow: 0 1px 3px 1px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.3);
  min-height: 600px;
  max-width: 900px;
  margin: 0 auto;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--md-sys-color-outline-variant);
  border-top-color: var(--md-sys-color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: var(--md-sys-color-on-surface-variant);
  margin: 16px 0 0;
  font-size: 0.875rem;
}

/* Markdown Content */
.markdown-content {
  line-height: 1.6;
  color: var(--md-sys-color-on-surface);
}

.markdown-content :deep(h1) {
  font-size: 2rem;
  font-weight: 400;
  color: var(--md-sys-color-on-surface);
  margin: 0 0 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--md-sys-color-on-surface);
  margin: 32px 0 16px;
}

.markdown-content :deep(h3) {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  margin: 24px 0 12px;
}

.markdown-content :deep(p) {
  margin: 12px 0;
}

.markdown-content :deep(code) {
  background: var(--md-sys-color-surface-container-high);
  padding: 2px 8px;
  border-radius: var(--md-sys-shape-corner-small);
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875em;
  color: var(--md-sys-color-on-surface-variant);
}

.markdown-content :deep(pre) {
  background: #1e1e2e;
  padding: 20px 24px;
  border-radius: var(--md-sys-shape-corner-large);
  overflow-x: auto;
  margin: 16px 0;
}

.markdown-content :deep(pre code) {
  background: none;
  color: #e6e1ef;
  padding: 0;
}

.markdown-content :deep(ul), 
.markdown-content :deep(ol) {
  padding-left: 24px;
  margin: 12px 0;
}

.markdown-content :deep(li) {
  margin: 8px 0;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(a) {
  color: var(--md-sys-color-primary);
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--md-sys-color-primary);
  padding-left: 16px;
  margin: 16px 0;
  color: var(--md-sys-color-on-surface-variant);
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  border-radius: var(--md-sys-shape-corner-medium);
  overflow: hidden;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 12px 16px;
  text-align: left;
}

.markdown-content :deep(th) {
  background: var(--md-sys-color-surface-container-high);
  font-weight: 500;
}

/* Bottom Nav */
.bottom-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.nav-btn {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border: none;
  padding: 10px 24px;
  border-radius: var(--md-sys-shape-corner-full);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn:hover:not(:disabled) {
  background: var(--md-sys-color-surface-container-high);
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.nav-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.nav-info {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.875rem;
  padding: 0 16px;
}

/* Footer */
.footer {
  text-align: center;
  padding: 24px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
  border-top: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface);
}

/* Responsive */
@media (max-width: 900px) {
  .main-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    position: static;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
  }
  
  .content {
    padding: 16px;
  }
  
  .content-card {
    padding: 24px;
  }
}
</style>
