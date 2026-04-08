<template>
  <div class="app-shell">
    <p class="sr-only" aria-live="polite">当前主题：{{ announcementLabel }}</p>
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ routeAnnouncement }}</p>
    <router-view />
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from './composables/useTheme'

const route = useRoute()
const { themeMode, isDark } = useTheme()
const routeAnnouncement = ref('')

const announcementLabel = computed(() => {
  if (themeMode.value === 'system') {
    return `跟随系统（当前${isDark.value ? '夜间' : '浅色'}）`
  }

  return themeMode.value === 'dark' ? '夜间模式' : '浅色模式'
})

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    routeAnnouncement.value = document.title
  },
  { immediate: true },
)
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
