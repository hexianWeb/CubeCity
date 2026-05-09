<script setup>
import { eventBus } from '@/js/utils/event-bus.js'
import { useGameState } from '@/stores/useGameState.js'
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'
import AnimatedNumber from './AnimatedNumber.vue'
import AudioManager from './AudioManager.vue'

const gameState = useGameState()
const { credits, totalJobs, maxPopulation, territory, citySize, cityLevel, cityName, language, showMapOverview, gameDay, power, maxPower, musicEnabled, musicVolume, isPlayingMusic } = storeToRefs(gameState)

function toggleLang() {
  gameState.setLanguage(language.value === 'zh' ? 'en' : 'zh')
}

function toggleMusic() {
  gameState.toggleMusic()
}

function toggleGuide() {
  gameState.setShowGuide(true)
}

watch([totalJobs, maxPopulation, power, maxPower], ([newTotalJobs, newMaxPopulation, newPower, newMaxPower], [oldTotalJobs, oldMaxPopulation, oldPower, oldMaxPower]) => {
  if (newTotalJobs > newMaxPopulation && !(oldTotalJobs > oldMaxPopulation)) {
    eventBus.emit('toast:add', {
      message: language.value === 'zh' ? '⚠️ 就业岗位不足！人口容量已超负荷' : '⚠️ Job shortage! Population capacity exceeded',
      type: 'warning',
    })
  }

  if (newPower > newMaxPower && !(oldPower > oldMaxPower)) {
    eventBus.emit('toast:add', {
      message: language.value === 'zh' ? '⚡ 电力不足！发电量无法满足需求' : '⚡ Power shortage! Power generation insufficient',
      type: 'error',
    })
  }
}, { immediate: true })

const populationWarning = computed(() => totalJobs.value > maxPopulation.value)
const powerWarning = computed(() => power.value > maxPower.value)
</script>

<template>
  <header class="bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-gray-700/50 z-20">
    <!-- 顶部一行：城市信息和操作按钮 -->
    <div class="flex items-center justify-between px-3 py-2">
      <!-- 左侧：城市名称 -->
      <div class="flex items-center space-x-2 flex-shrink-0">
        <h1 class="text-sm font-black text-orange-400 truncate max-w-[80px]">
          {{ cityName }}
        </h1>
        <div class="flex items-center space-x-1">
          <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span class="text-xs text-gray-400">Lv.{{ cityLevel }}</span>
        </div>
      </div>
      
      <!-- 右侧：操作按钮 -->
      <div class="flex items-center space-x-1.5">
        <button 
          class="w-8 h-8 flex items-center justify-center rounded bg-gray-700/80 hover:bg-gray-600 active:scale-95 transition text-xs font-bold"
          @click="toggleLang"
        >
          {{ language === 'zh' ? 'EN' : '中' }}
        </button>
        <button 
          class="w-8 h-8 flex items-center justify-center rounded bg-gray-700/80 hover:bg-gray-600 active:scale-95 transition"
          @click="toggleGuide"
        >
          📖
        </button>
        <button 
          class="w-8 h-8 flex items-center justify-center rounded active:scale-95 transition"
          :class="musicEnabled ? 'bg-blue-600/80 hover:bg-blue-500' : 'bg-gray-700/80 hover:bg-gray-600'"
          @click="toggleMusic"
        >
          {{ musicEnabled && isPlayingMusic ? '🔊' : '🔇' }}
        </button>
      </div>
    </div>
    
    <!-- 资源栏：横向滚动 -->
    <div class="flex overflow-x-auto px-3 pb-2 space-x-2 scrollbar-hide" style="min-height: 44px;">
      <div 
        class="flex-shrink-0 rounded-lg px-2.5 py-1.5 flex items-center space-x-2"
        :class="populationWarning ? 'bg-red-900/30 border border-red-500/50' : 'bg-gray-800/80 border border-gray-600/30'"
      >
        <span class="text-sm">💰</span>
        <div>
          <div class="text-[9px] text-gray-400 uppercase">金币</div>
          <div class="text-sm font-bold text-green-400">
            <AnimatedNumber :value="credits" :duration="3" separator="," />
          </div>
        </div>
      </div>
      
      <div 
        class="flex-shrink-0 rounded-lg px-2.5 py-1.5 flex items-center space-x-2"
        :class="populationWarning ? 'bg-red-900/30 border border-red-500/50' : 'bg-gray-800/80 border border-gray-600/30'"
      >
        <span class="text-sm" :class="populationWarning ? 'text-red-400' : 'text-blue-400'">👥</span>
        <div>
          <div class="text-[9px] text-gray-400 uppercase">人口</div>
          <div class="text-sm font-bold" :class="populationWarning ? 'text-red-400' : 'text-blue-400'">
            {{ totalJobs }}/{{ maxPopulation }}
          </div>
        </div>
      </div>
      
      <div class="flex-shrink-0 rounded-lg px-2.5 py-1.5 flex items-center space-x-2 bg-gray-800/80 border border-gray-600/30">
        <span class="text-sm text-orange-400">🏭</span>
        <div>
          <div class="text-[9px] text-gray-400 uppercase">地皮</div>
          <div class="text-sm font-bold text-orange-400">{{ territory }}×{{ citySize }}</div>
        </div>
      </div>
      
      <div 
        class="flex-shrink-0 rounded-lg px-2.5 py-1.5 flex items-center space-x-2"
        :class="powerWarning ? 'bg-red-900/30 border border-red-500/50' : 'bg-gray-800/80 border border-gray-600/30'"
      >
        <span class="text-sm" :class="powerWarning ? 'text-red-400' : 'text-yellow-400'">⚡</span>
        <div>
          <div class="text-[9px] text-gray-400 uppercase">电力</div>
          <div class="text-sm font-bold" :class="powerWarning ? 'text-red-400' : 'text-yellow-400'">
            {{ power }}/{{ maxPower }}
          </div>
        </div>
      </div>
    </div>

    <AudioManager />
  </header>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
