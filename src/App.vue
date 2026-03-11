<template>
  <div class="app-container">
    <!-- 顶部 Header -->
    <header class="header">
      <div class="header-content">
        <h1 class="logo">🍊 Compose 小课堂</h1>
        <p class="subtitle">每天进步一点点 ✨</p>
      </div>
      <div class="header-decoration">
        <span class="bubble bubble-1">💖</span>
        <span class="bubble bubble-2">🌸</span>
        <span class="bubble bubble-3">⭐</span>
      </div>
    </header>

    <div class="main-layout">
      <!-- 左侧目录 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <span class="toc-title">📚 知识目录</span>
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
                ▶
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
                <span class="section-emoji">{{ section.icon }}</span>
                <span class="section-name">{{ section.name }}</span>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      <!-- 右侧内容 -->
      <main class="content">
        <div class="content-card">
          <div v-if="loading" class="loading">
            <span class="loading-bear">🐻</span>
            <p>努力加载中...</p>
          </div>
          <div v-else v-html="renderedContent" class="markdown-content"></div>
        </div>
        
        <!-- 底部导航 -->
        <div class="bottom-nav">
          <button 
            class="nav-btn prev" 
            @click="prevSection"
            :disabled="!prevSectionId"
          >
            ⬅️ 上一页
          </button>
          <span class="nav-info">{{ currentIndex + 1 }} / {{ totalSections }}</span>
          <button 
            class="nav-btn next" 
            @click="nextSection"
            :disabled="!nextSectionId"
          >
            下一页 ➡️
          </button>
        </div>
      </main>
    </div>

    <!-- 页脚 -->
    <footer class="footer">
      <p>🕐 最后更新: {{ lastUpdate }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'

// 章节数据 - 与 README.md 同步
const chapters = ref([
  {
    id: 'basic',
    name: '🍰 基础入门',
    icon: '📖',
    sections: [
      { id: 'composable', name: '@Composable 函数', icon: '⚡' },
      { id: 'state', name: 'remember / mutableStateOf', icon: '🔄' },
      { id: 'stateflow', name: 'StateFlow / collectAsState', icon: '🌊' }
    ]
  },
  {
    id: 'layout',
    name: '📦 布局基础',
    icon: '🧱',
    sections: [
      { id: 'box-row-column', name: 'Box / Row / Column', icon: '📦' },
      { id: 'lazy-list', name: 'LazyColumn / LazyRow', icon: '📋' },
      { id: 'modifier', name: 'Modifier 修饰符', icon: '🔧' }
    ]
  },
  {
    id: 'navigation',
    name: '🧭 导航',
    icon: '🗺️',
    sections: [
      { id: 'navigation', name: 'Navigation Compose 3.0', icon: '🧭' },
      { id: 'nav-advanced', name: 'Navigation Compose 进阶技巧', icon: '✨' }
    ]
  },
  {
    id: 'performance',
    name: '🚀 性能优化',
    icon: '⚡',
    sections: [
      { id: 'derived-state', name: 'derivedStateOf', icon: '🎯' },
      { id: 'kotlin2', name: 'Kotlin 2.0 Strong Skipping', icon: '🚀' },
      { id: 'performance-guide', name: '性能优化最佳实践', icon: '💨' }
    ]
  },
  {
    id: 'ui',
    name: '🎨 UI 组件',
    icon: '🖌️',
    sections: [
      { id: 'material3', name: 'Material 3 自适应布局', icon: '📱' },
      { id: 'rich-text', name: '富文本 & 2D 滚动', icon: '📝' },
      { id: 'canvas', name: 'Canvas 绘图', icon: '✏️' }
    ]
  },
  {
    id: 'advanced',
    name: '🌟 进阶',
    icon: '💎',
    sections: [
      { id: 'lifecycle', name: '可组合项生命周期与重组', icon: '🔄' },
      { id: 'modifier-node', name: 'Modifier.Node 高性能自定义', icon: '🧩' },
      { id: 'platform', name: '平台集成', icon: '📷' }
    ]
  },
  {
    id: 'animation',
    name: '🎬 动画',
    icon: '🎥',
    sections: [
      { id: 'animation', name: 'Compose 动画 API 进阶', icon: '🎬' },
      { id: 'shared-element', name: '共用元素过渡动画', icon: '✨' }
    ]
  },
  {
    id: 'testing',
    name: '🧪 测试',
    icon: '🔬',
    sections: [
      { id: 'testing', name: 'Compose 测试最佳实践', icon: '🧪' }
    ]
  },
  {
    id: 'state-mgmt',
    name: '💾 状态管理',
    icon: '💾',
    sections: [
      { id: 'state-management', name: '状态管理最佳实践', icon: '💾' },
      { id: 'side-effects', name: 'Compose 副作用 API 全攻略', icon: '⚡' },
      { id: 'state-save', name: '状态保存与恢复', icon: '💾' }
    ]
  },
  {
    id: 'arch',
    name: '🏗️ 架构',
    icon: '🏗️',
    sections: [
      { id: 'mvi', name: 'MVI 架构模式', icon: '🎯' },
      { id: 'hilt', name: 'Hilt 与 ViewModel 集成', icon: '💉' }
    ]
  }
])

const expandedChapters = ref(['basic', 'layout', 'navigation', 'performance', 'ui', 'advanced', 'animation', 'testing', 'state-mgmt', 'arch'])
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
      // 按章节分隔
      const sections = chapters.value.flatMap(c => c.sections)
      for (const section of sections) {
        const pattern = new RegExp(`##\\s*\\d+\\.\\s*${section.name}.*?[\\s\\S]*?(?=##\\s*\\d+\\.|$)`, 'i')
        const match = fullMd.match(pattern)
        if (match) {
          contentData.value[section.id] = '## ' + section.name + '\n\n' + match[0].replace(/##\s*\d+\.\s*/, '')
        }
      }
    }
  } catch (e) {
    console.log('加载失败:', e)
  } finally {
    loading.value = false
  }
}

const renderedContent = computed(() => {
  const md = contentData.value[currentSection.value] || '# 加载中...'
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
/* 全局样式 */
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f5 50%, #f5f0ff 100%);
  font-family: 'Noto Sans SC', sans-serif;
}

/* Header */
.header {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #fad0c4 100%);
  padding: 24px 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(255, 154, 158, 0.3);
}

.header-content {
  position: relative;
  z-index: 1;
}

.logo {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 2.5rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  margin: 0;
}

.subtitle {
  color: rgba(255,255,255,0.9);
  font-size: 1rem;
  margin: 8px 0 0;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.bubble {
  position: absolute;
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
}

.bubble-1 { top: 20%; right: 10%; animation-delay: 0s; }
.bubble-2 { top: 60%; right: 25%; animation-delay: 0.5s; }
.bubble-3 { top: 40%; right: 5%; animation-delay: 1s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Main Layout */
.main-layout {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  gap: 24px;
}

/* Sidebar */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  overflow: hidden;
  position: sticky;
  top: 24px;
  height: fit-content;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.sidebar-header {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  padding: 16px 20px;
}

.toc-title {
  font-weight: 700;
  color: white;
  font-size: 1.1rem;
}

.chapter {
  border-bottom: 1px solid #f0f0f0;
}

.chapter:last-child {
  border-bottom: none;
}

.chapter-title {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s;
  gap: 10px;
}

.chapter-title:hover {
  background: #fff5f8;
}

.chapter-icon {
  font-size: 1.2rem;
}

.chapter-name {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.expand-icon {
  font-size: 0.7rem;
  color: #999;
  transition: transform 0.3s;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.chapter-sections {
  background: #fafafa;
  padding: 8px 0;
}

.section-item {
  display: flex;
  align-items: center;
  padding: 10px 16px 10px 36px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 8px;
}

.section-item:hover {
  background: #fff0f5;
}

.section-item.active {
  background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%);
  color: white;
  border-radius: 0 20px 20px 0;
  margin-right: 12px;
}

.section-emoji {
  font-size: 1rem;
}

.section-name {
  font-size: 0.9rem;
}

/* Content */
.content {
  flex: 1;
  min-width: 0;
}

.content-card {
  background: white;
  border-radius: 24px;
  padding: 32px 40px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  min-height: 500px;
}

.loading {
  text-align: center;
  padding: 80px 0;
}

.loading-bear {
  font-size: 4rem;
  display: block;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.loading p {
  color: #999;
  margin-top: 16px;
}

.markdown-content {
  line-height: 1.8;
  color: #444;
}

.markdown-content :deep(h1) {
  font-size: 1.8rem;
  color: #ff6b8a;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px dashed #ffd1d9;
}

.markdown-content :deep(h2) {
  font-size: 1.4rem;
  color: #7c5ce7;
  margin: 32px 0 16px;
}

.markdown-content :deep(h3) {
  font-size: 1.15rem;
  color: #00b894;
  margin: 24px 0 12px;
}

.markdown-content :deep(code) {
  background: #f5f0ff;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
  color: #6c5ce7;
}

.markdown-content :deep(pre) {
  background: #2d2d44;
  padding: 20px;
  border-radius: 16px;
  overflow-x: auto;
  margin: 16px 0;
}

.markdown-content :deep(pre code) {
  background: none;
  color: #a29bfe;
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
  color: #ff6b8a;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #f0f0f0;
  padding: 12px;
  text-align: left;
}

.markdown-content :deep(th) {
  background: #fff5f8;
  color: #ff6b8a;
}

/* Bottom Nav */
.bottom-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 24px;
}

.nav-btn {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
}

.nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 154, 158, 0.4);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-info {
  color: #999;
  font-size: 0.9rem;
}

/* Footer */
.footer {
  text-align: center;
  padding: 24px;
  color: #999;
  font-size: 0.85rem;
}

/* 响应式 */
@media (max-width: 900px) {
  .main-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    position: static;
    max-height: none;
  }
  
  .content-card {
    padding: 24px;
  }
}
</style>
