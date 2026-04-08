import { computed, ref } from 'vue'

const STORAGE_KEY = 'compose-docs-theme'
const THEME_COLOR_META_ID = 'theme-color-meta'
const THEME_COLORS = {
  light: '#f9fbff',
  dark: '#0f1620',
}
const theme = ref('light')
const themeMode = ref('system')
let initialized = false
let mediaQuery = null

function readStoredTheme() {
  if (typeof window === 'undefined') {
    return null
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY)
  return storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system' ? storedTheme : null
}

function resolveSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

function updateResolvedTheme() {
  theme.value = themeMode.value === 'system' ? resolveSystemTheme() : themeMode.value

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme.value

    const themeColorMeta = document.getElementById(THEME_COLOR_META_ID)
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', THEME_COLORS[theme.value])
    }
  }
}

function applyThemeMode(nextMode) {
  themeMode.value = nextMode
  updateResolvedTheme()

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, nextMode)
  }
}

function handleSystemThemeChange() {
  if (themeMode.value === 'system') {
    updateResolvedTheme()
  }
}

export function initTheme() {
  if (initialized) {
    return
  }

  themeMode.value = readStoredTheme() || 'system'
  updateResolvedTheme()

  if (typeof window !== 'undefined') {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  }

  initialized = true
}

export function useTheme() {
  initTheme()

  const isDark = computed(() => theme.value === 'dark')
  const modeLabel = computed(() => {
    if (themeMode.value === 'system') {
      return `跟随系统${isDark.value ? ' · 深色' : ' · 浅色'}`
    }

    return themeMode.value === 'dark' ? '夜间模式' : '浅色模式'
  })
  const toggleTheme = () => {
    const nextMode = themeMode.value === 'system'
      ? 'light'
      : themeMode.value === 'light'
        ? 'dark'
        : 'system'

    applyThemeMode(nextMode)
  }

  return {
    theme,
    themeMode,
    isDark,
    modeLabel,
    toggleTheme,
    setTheme: applyThemeMode,
  }
}
