<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { BUILDING_CATEGORIES, BUILDING_DATA, BUILDING_MODES } from '../constants/constants'
import { useGameState } from '../stores/useGameState'

const { t } = useI18n()

const buildingCategories = computed(() => BUILDING_CATEGORIES)
const buildingData = computed(() => BUILDING_DATA)
const modes = computed(() => BUILDING_MODES)

const gameState = useGameState()
const selectedBuilding = computed(() => gameState.selectedBuilding)
const currentMode = computed(() => gameState.currentMode)
const language = computed(() => gameState.language)

const isDrawerOpen = ref(false)
const activeTab = ref('build')

function buildingsByCategory(catKey) {
  return Object.values(buildingData.value).filter(b => b.category === catKey && b.visible !== false)
}

function selectBuilding({ type, name, level = 1 }) {
  if (currentMode.value !== 'build')
    return
  if (selectedBuilding.value?.type === type && selectedBuilding.value?.level === level)
    return
  gameState.setSelectedBuilding({ type, level })
  gameState.addToast(`${t('selectedIndicator.selected')}: ${name[language.value]}`, 'info')
}

function setMode(mode) {
  if (currentMode.value === mode)
    return
  gameState.setMode(mode)
  gameState.setSelectedBuilding(null)
  gameState.addToast(`MODE : ${mode.toUpperCase()} CHANGE`, 'info')
}

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value
}

function closeDrawer() {
  isDrawerOpen.value = false
}

const modeKeyMap = {
  d: 'demolish',
  r: 'relocate',
  b: 'build',
  s: 'select',
}

function handleKeydown(e) {
  const key = e.key.toLowerCase()
  if (modeKeyMap[key]) {
    setMode(modeKeyMap[key])
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <!-- 桌面端侧边栏 (md 及以上显示) -->
  <aside class="hidden md:block industrial-panel shadow-industrial overflow-y-auto relative z-[10] custom-scrollbar">
    <div class="p-4">
      <h2 class="text-lg font-bold text-industrial-accent uppercase tracking-wide mb-4 border-b border-gray-600 pb-2">
        <span class="neon-text">{{ $t('buildingSidebar.constructionUnits') }}</span>
      </h2>
      
      <!-- 建筑分类与卡片 -->
      <div v-for="cat in buildingCategories" :key="cat.key" class="mb-6">       
        <h3 class="text-sm font-bold text-gray-300 mb-3 uppercase flex items-center" :class="language === 'zh' ? 'tracking-[0.3rem]' : ''">
          <span class="w-2 h-2 rounded-full mr-2" :class="[cat.color]" />       
          {{ cat.label[language] }}
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="b in buildingsByCategory(cat.key)" :key="b.type"
            class="building-card-industrial rounded-lg p-3 cursor-pointer"
            :class="[
              selectedBuilding?.type === b.type ? 'ring-2 ring-industrial-accent' : '',
              currentMode !== 'build' && (selectedBuilding?.type !== b.type) ? 'pointer-events-none opacity-50 grayscale' : '',
            ]"
            :title="currentMode !== 'build' ? $t('buildingSidebar.switchToBuildMode') : ''"
            @click="selectBuilding(b)"
          >
            <div class="text-2xl text-center mb-1">
              {{ b.icon }}
            </div>
            <div class="text-xs text-center font-bold text-gray-300" :class="language === 'zh' ? 'tracking-[0.3rem]' : ''">
              {{ b.name[language] }}
            </div>
            <div class="text-xs text-center text-industrial-yellow">
              <span class="text-xs">⚡</span>
              <span class="tracking-widest">{{ b.levels[1].cost }}</span>       
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作模式 -->
      <div class="mt-6 pt-4 border-t border-gray-600">
        <h3 class="text-sm font-bold text-gray-300 mb-3 uppercase" :class="language === 'zh' ? 'tracking-[0.3rem]' : 'tracking-wide'">
          {{ $t('buildingSidebar.operationMode') }}
        </h3>
        <div class="space-y-2">
          <button
            v-for="mode in modes" :key="mode.key"
            class="industrial-button w-full text-white font-bold py-2 px-3 text-sm uppercase"
            :class="[
              language === 'zh' ? 'tracking-[0.3rem]' : 'tracking-wide',        
              currentMode === mode.key ? 'bg-industrial-accent' : '',
            ]"
            @click="setMode(mode.key)"
          >
            <span v-html="mode.icon" /> {{ mode.label[language] }}
          </button>
        </div>
      </div>
    </div>
  </aside>

  <!-- 移动端浮动按钮 - 使用 Teleport 传送到 body -->
  <Teleport to="body">
    <div class="fixed bottom-24 left-4 z-[100]">
      <button
        class="w-14 h-14 rounded-full shadow-lg flex flex-col items-center justify-center active:scale-90 transition-transform md:hidden"
        :class="isDrawerOpen ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-400'"
        @click="toggleDrawer"
      >
        <span class="text-xl">🏗️</span>
      </button>
    </div>
  </Teleport>

  <!-- 移动端抽屉菜单 - 使用 Teleport 传送到 body -->
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="isDrawerOpen"
        class="fixed inset-x-0 bottom-0 z-[100] bg-[#1a1a1a]/98 backdrop-blur-lg border-t border-gray-600 max-h-[75vh] flex flex-col md:hidden"
      >
        <!-- 抽屉头部 -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 class="text-base font-bold text-orange-400">🏗️ 建造单位</h2>
          <button
            class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 active:scale-90 transition"
            @click="closeDrawer"
          >
            ✕
          </button>
        </div>
        
        <!-- Tab切换 -->
        <div class="flex border-b border-gray-700">
          <button
            class="flex-1 py-3 text-sm font-bold uppercase transition-colors"
            :class="activeTab === 'build' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'"
            @click="activeTab = 'build'"
          >
            🏠 建筑
          </button>
          <button
            class="flex-1 py-3 text-sm font-bold uppercase transition-colors"
            :class="activeTab === 'mode' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'"
            @click="activeTab = 'mode'"
          >
            ⚙️ 模式
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <!-- 建筑列表 -->
          <div v-if="activeTab === 'build'" class="p-3">
            <div v-for="cat in buildingCategories" :key="cat.key" class="mb-4">
              <h3 class="text-xs font-bold text-gray-400 mb-2 uppercase flex items-center">
                <span class="w-2 h-2 rounded-full mr-2" :class="cat.color" />
                {{ cat.label[language] }}
              </h3>
              <div class="grid grid-cols-4 gap-2">
                <div
                  v-for="b in buildingsByCategory(cat.key)" :key="b.type"
                  class="rounded-lg p-2 cursor-pointer text-center active:scale-95 transition-all"
                  :class="[
                    selectedBuilding?.type === b.type 
                      ? 'bg-orange-600 ring-2 ring-orange-400' 
                      : 'bg-gray-800',
                    currentMode !== 'build' ? 'opacity-50' : ''
                  ]"
                  @click="selectBuilding(b)"
                >
                  <div class="text-2xl mb-0.5">{{ b.icon }}</div>
                  <div class="text-[9px] font-bold text-gray-300 truncate">{{ b.name[language] }}</div>
                  <div class="text-[9px] text-yellow-400">⚡{{ b.levels[1].cost }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 模式选择 -->
          <div v-if="activeTab === 'mode'" class="p-3 space-y-2">
            <button
              v-for="mode in modes" :key="mode.key"
              class="w-full rounded-lg py-4 px-4 flex items-center space-x-3 active:scale-[0.98] transition"
              :class="currentMode === mode.key ? 'bg-orange-600' : 'bg-gray-800'"
              @click="setMode(mode.key)"
            >
              <span class="text-2xl" v-html="mode.icon" />
              <div class="text-left">
                <div class="text-sm font-bold text-white">{{ mode.label[language] }}</div>
                <div class="text-xs text-gray-400">{{ mode.key === 'build' ? '选择建筑放置' : mode.key === 'select' ? '查看建筑信息' : mode.key === 'demolish' ? '拆除已有建筑' : '移动建筑位置' }}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 移动端遮罩 - 使用 Teleport 传送到 body -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isDrawerOpen"
        class="fixed inset-0 bg-black/60 z-[99] md:hidden"
        @click="closeDrawer"
      />
    </Transition>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #3b3b3b #18181b;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  background: #18181b;
  border-radius: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #3b3b3b 60%, #ffb800 100%);
  border-radius: 8px;
  min-height: 24px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #ffb800 60%, #3b3b3b 100%);
}
.custom-scrollbar::-webkit-scrollbar-corner {
  background: #18181b;
}

/* 移动端抽屉动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
