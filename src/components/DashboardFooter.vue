<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameState } from '../stores/useGameState'
import AnimatedNumber from './AnimatedNumber.vue'

const gameState = useGameState()
const { t } = useI18n()
const { buildingCount, dailyIncome, pollution, stability } = storeToRefs(gameState)

const pollutionLevel = computed(() => {
  if (pollution.value > 150) return { color: 'text-red-500', bg: 'bg-red-900/30', label: '危险' }
  if (pollution.value > 100) return { color: 'text-orange-500', bg: 'bg-orange-900/30', label: '警告' }
  return { color: 'text-yellow-400', bg: 'bg-yellow-900/30', label: '正常' }
})
</script>

<template>
  <footer class="bg-[#1a1a1a]/95 backdrop-blur-sm border-t border-gray-700/50 z-20">
    <!-- 底部指标栏 -->
    <div class="flex items-center justify-around py-3 px-3">
      <!-- 建筑数量 -->
      <div class="flex flex-col items-center min-w-[65px]">
        <div class="text-lg font-bold text-green-400">
          <AnimatedNumber :value="buildingCount" :duration="2" />
        </div>
        <div class="text-xs text-gray-400">🏗️ 建筑</div>
      </div>
      
      <!-- 日收入 -->
      <div class="flex flex-col items-center min-w-[65px]">
        <div class="text-lg font-bold text-blue-400">
          +<AnimatedNumber :value="dailyIncome" :duration="2" separator="," />
        </div>
        <div class="text-xs text-gray-400">💰 收入</div>
      </div>
      
      <!-- 污染度 -->
      <div class="flex flex-col items-center min-w-[65px]">
        <div 
          class="text-lg font-bold"
          :class="pollutionLevel.color"
        >
          <AnimatedNumber :value="pollution" :duration="2" />
        </div>
        <div class="text-xs text-gray-400" :class="pollutionLevel.color">
          💨 {{ pollutionLevel.label }}
        </div>
      </div>
      
      <!-- 稳定性 -->
      <div class="flex flex-col items-center min-w-[65px]">
        <div 
          class="text-lg font-bold"
          :class="stability > 80 ? 'text-green-400' : stability > 50 ? 'text-yellow-400' : 'text-red-400'"
        >
          <AnimatedNumber :value="stability" :duration="2" />%
        </div>
        <div class="text-xs text-gray-400">🛡️ 稳定</div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
</style>
