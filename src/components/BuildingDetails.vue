<script setup>
import { eventBus } from '@/js/utils/event-bus.js'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { BUILDING_DATA } from '../constants/constants'
import { useGameState } from '../stores/useGameState'
import BuildingDetail from './BuildingDetail.vue'
import EmptyState from './EmptyState.vue'

const { t } = useI18n()
const gameState = useGameState()
const selectedBuilding = computed(() => gameState.selectedBuilding)
const currentMode = computed(() => gameState.currentMode)
const selectedPosition = computed(() => gameState.selectedPosition)

const isDrawerOpen = ref(false)

const building = computed(() => {
  if (!selectedBuilding.value)
    return {}
  const { type, level } = selectedBuilding.value
  const base = BUILDING_DATA[type] || {}
  const levelData = base.levels?.[level] || {}
  return { ...base, ...levelData, level }
})

watch(selectedBuilding, (newVal) => {
  if (newVal) {
    isDrawerOpen.value = true
  }
})

function upgradeBuilding() {
  const data = {
    action: 'upgrade',
    buildingType: selectedBuilding.value.type,
    buildingLevel: selectedBuilding.value.level,
  }
  eventBus.emit('ui:confirm-action', data)
}

function repairBuilding() {
  const data = {
    action: 'repair',
    buildingType: selectedBuilding.value.type,
    buildingLevel: selectedBuilding.value.level,
  }
  eventBus.emit('ui:confirm-action', data)
}

function demolishBuilding() {
  const data = {
    action: 'demolish',
    buildingType: selectedBuilding.value.type,
    buildingLevel: selectedBuilding.value.level,
  }
  eventBus.emit('ui:confirm-action', data)
}

function closeDrawer() {
  isDrawerOpen.value = false
}
</script>

<template>
  <!-- 桌面端侧边栏 (md 及以上显示) -->
  <aside class="hidden md:block industrial-panel shadow-industrial z-40 relative h-full">       
    <div class="p-4 h-full flex flex-col">
      <h2 class="text-lg font-bold text-industrial-accent uppercase tracking-wide mb-4 border-b border-gray-600 pb-2">
        <span class="neon-text">{{ t('buildingDetails.unitDetails') }}</span>   
      </h2>
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <EmptyState v-if="!selectedBuilding" :current-mode="currentMode" />     
        <BuildingDetail
          v-else
          :building="building"
          :selected-position="selectedPosition"
          :current-mode="currentMode"
          @upgrade="upgradeBuilding"
          @repair="repairBuilding"
        />
      </div>
    </div>
  </aside>

  <!-- 移动端详情按钮 - 使用 Teleport 传送到 body -->
  <Teleport to="body">
    <div class="fixed top-20 right-4 z-[100]">
      <Transition name="fade">
        <button
          v-if="selectedBuilding"
          class="w-12 h-12 rounded-full shadow-lg bg-orange-500 active:scale-90 transition flex items-center justify-center md:hidden"
          @click="isDrawerOpen = !isDrawerOpen"
        >
          <span class="text-xl">{{ building.icon || '🏗️' }}</span>
        </button>
      </Transition>
    </div>
  </Teleport>

  <!-- 移动端右侧抽屉 - 使用 Teleport 传送到 body -->
  <Teleport to="body">
    <Transition name="slide-right">
      <div
        v-if="isDrawerOpen && selectedBuilding"
        class="fixed top-0 right-0 bottom-0 w-[300px] z-[100] bg-[#1a1a1a]/98 backdrop-blur-lg border-l border-gray-600 flex flex-col md:hidden"
      >
        <!-- 抽屉头部 -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 class="text-base font-bold text-orange-400">📋 单位详情</h2>
          <button
            class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 active:scale-90 transition"
            @click="closeDrawer"
          >
            ✕
          </button>
        </div>
        
        <!-- 内容 -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-4">
          <BuildingDetail
            :building="building"
            :selected-position="selectedPosition"
            :current-mode="currentMode"
            @upgrade="upgradeBuilding"
            @repair="repairBuilding"
            @demolish="demolishBuilding"
          />
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 移动端遮罩 - 使用 Teleport 传送到 body -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isDrawerOpen && selectedBuilding"
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
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
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
