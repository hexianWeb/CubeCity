<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const _props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'showGuide'])

const { locale } = useI18n()

const showQuickReference = ref(false)

const FIRST_VISIT_KEY = 'cubecity_first_visit'

function isFirstVisit() {
  return !localStorage.getItem(FIRST_VISIT_KEY)
}

function markAsVisited() {
  localStorage.setItem(FIRST_VISIT_KEY, 'true')
}

onMounted(() => {
  if (isFirstVisit()) {
    emit('showGuide')
    markAsVisited()
  }
})

function closeModal() {
  emit('close')
  showQuickReference.value = false
}

function handleContentClick(e) {
  e.stopPropagation()
}

function toggleContent() {
  showQuickReference.value = !showQuickReference.value
}
</script>

<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end justify-center"
    @click="closeModal"
  >
    <div
      class="bg-[#1a1a1a] border-t border-gray-600 w-full max-h-[85vh] overflow-hidden"
      @click="handleContentClick"
    >
      <!-- 标题栏 -->
      <div class="p-4 border-b border-gray-600 flex justify-between items-center bg-[#242424]">
        <h2 class="text-base font-bold text-orange-400">
          🏙️ {{ locale === 'zh' ? 'CubeCity 新手游玩指南' : 'CubeCity Beginner Guide' }}
        </h2>
        <div class="flex items-center space-x-2">
          <button
            class="px-3 py-1.5 rounded bg-green-600 text-white font-bold text-sm active:scale-95 transition"
            @click="toggleContent"
          >
            {{ showQuickReference ? (locale === 'zh' ? '📖 指南' : '📖 Guide') : (locale === 'zh' ? '📋 速查表' : '📋 Quick Ref') }}
          </button>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-white active:scale-95 transition"
            @click="closeModal"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="p-4 overflow-y-auto max-h-[calc(85vh-60px)] custom-scrollbar">
        <!-- 重要提示 -->
        <div
          class="mb-4 p-3 rounded border border-yellow-500/50 bg-yellow-900/20"
        >
          <div class="text-lg font-extrabold text-yellow-400">
            🚧 {{
              locale === 'zh'
                ? '建造建筑前必须先修建道路！'
                : 'Build a road first before placing buildings!'
            }}
          </div>
          <div class="mt-1 text-sm text-gray-300">
            {{
              locale === 'zh'
                ? '建筑只能建在道路旁，特例：风力发电与公园可在任意地块建造'
                : 'Buildings must be next to roads. Exception: Wind Power and Parks can be built anywhere'
            }}
          </div>
        </div>

        <!-- 新手指南内容 -->
        <div v-if="!showQuickReference" class="space-y-4 text-gray-300">
          <section>
            <h3 class="text-base font-bold text-orange-400 mb-2">
              1. 🎮 {{ locale === 'zh' ? '游戏简介' : 'Game Introduction' }}
            </h3>
            <p class="text-sm leading-relaxed mb-2">
              {{ locale === 'zh' ? 'CubeCity 是一款以城市建设为核心的模拟经营游戏。你将从一块空地起步，逐步建造住宅、商业、工业、环境等多种建筑，合理布局道路，管理金币与人口，打造属于你的理想城市。' : 'CubeCity is a city-building simulation game where you start from an empty plot and gradually construct residential, commercial, industrial, and environmental buildings.' }}
            </p>
            <div class="bg-gray-800/50 p-3 rounded">
              <h4 class="text-sm font-bold text-yellow-400 mb-1">
                {{ locale === 'zh' ? '核心特色' : 'Core Features' }}:
              </h4>
              <ul class="text-sm space-y-1">
                <li>🏗️ {{ locale === 'zh' ? '3D 城市建设与资源管理' : '3D City Building & Resource Management' }}</li>
                <li>🏠 {{ locale === 'zh' ? 'RCI & ESG 多维建筑体系' : 'RCI & ESG Multi-dimensional Building System' }}</li>
                <li>💾 {{ locale === 'zh' ? '本地存储、响应式 UI' : 'Local Storage & Responsive UI' }}</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 class="text-base font-bold text-orange-400 mb-2">
              2. 🚀 {{ locale === 'zh' ? '快速开始' : 'Quick Start' }}
            </h3>
            <div class="bg-gray-800/50 p-3 rounded">
              <ol class="text-sm space-y-1 list-decimal list-inside">
                <li>{{ locale === 'zh' ? '打开游戏，点击"开始新城市"' : 'Open the game and click "Start New City"' }}</li>
                <li>{{ locale === 'zh' ? '你将获得一块空地和初始金币 💰' : 'You will get a plot and initial coins 💰' }}</li>
                <li>{{ locale === 'zh' ? '点击左下角🏗️按钮选择建筑类型' : 'Click the 🏗️ button to select building types' }}</li>
                <li>{{ locale === 'zh' ? '点击地图上的地皮进行放置' : 'Click on plots to place buildings' }}</li>
              </ol>
            </div>
          </section>

          <section>
            <h3 class="text-base font-bold text-orange-400 mb-2">
              3. 🎯 {{ locale === 'zh' ? '基础操作' : 'Basic Operations' }}
            </h3>
            <div class="space-y-3">
              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-yellow-400 mb-1">
                  {{ locale === 'zh' ? '建筑操作' : 'Building Operations' }}:
                </h4>
                <ul class="text-sm space-y-1">
                  <li><span class="text-green-400">🏗️</span> {{ locale === 'zh' ? '选择建筑：左下角面板点击建筑卡片' : 'Select Building: Click building cards' }}</li>
                  <li><span class="text-green-400">📍</span> {{ locale === 'zh' ? '放置建筑：选择后点击空地建造' : 'Place Building: Click empty plot' }}</li>
                  <li><span class="text-green-400">🚧</span> {{ locale === 'zh' ? '移动建筑：切换到搬迁模式' : 'Move Building: Switch to relocation mode' }}</li>
                  <li><span class="text-green-400">⬆️</span> {{ locale === 'zh' ? '升级建筑：满足条件可升级' : 'Upgrade Building: Upgrade when conditions met' }}</li>
                  <li><span class="text-green-400">💥</span> {{ locale === 'zh' ? '拆除建筑：切换到拆除模式' : 'Demolish Building: Switch to demolition mode' }}</li>
                </ul>
              </div>

              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-yellow-400 mb-1">
                  {{ locale === 'zh' ? '模式切换' : 'Mode Switching' }}:
                </h4>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div class="flex items-center space-x-1">
                    <span>🔍</span>
                    <span>{{ locale === 'zh' ? '选择：查看信息' : 'Select: View info' }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span>🏗️</span>
                    <span>{{ locale === 'zh' ? '建造：放置建筑' : 'Build: Place buildings' }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span>🚧</span>
                    <span>{{ locale === 'zh' ? '搬迁：移动建筑' : 'Relocate: Move buildings' }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span>💥</span>
                    <span>{{ locale === 'zh' ? '拆除：删除建筑' : 'Demolish: Delete buildings' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-base font-bold text-orange-400 mb-2">
              4. 🏢 {{ locale === 'zh' ? '建筑系统' : 'Building System' }}
            </h3>
            <div class="bg-gray-800/50 p-3 rounded">
              <h4 class="text-sm font-bold text-yellow-400 mb-2">
                {{ locale === 'zh' ? '建筑分类' : 'Building Categories' }}:
              </h4>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <h5 class="font-bold text-green-400">🏠 {{ locale === 'zh' ? '住宅' : 'Residential' }}</h5>
                  <p class="text-gray-400 text-xs">{{ locale === 'zh' ? '提供居住空间' : 'Provides housing' }}</p>
                </div>
                <div>
                  <h5 class="font-bold text-green-400">🏬 {{ locale === 'zh' ? '商业' : 'Commercial' }}</h5>
                  <p class="text-gray-400 text-xs">{{ locale === 'zh' ? '提供收入' : 'Provides income' }}</p>
                </div>
                <div>
                  <h5 class="font-bold text-green-400">🏭 {{ locale === 'zh' ? '工业' : 'Industrial' }}</h5>
                  <p class="text-gray-400 text-xs">{{ locale === 'zh' ? '提供工作和收入' : 'Provides jobs & income' }}</p>
                </div>
                <div>
                  <h5 class="font-bold text-green-400">🌳 {{ locale === 'zh' ? '环境' : 'Environmental' }}</h5>
                  <p class="text-gray-400 text-xs">{{ locale === 'zh' ? '改善环境' : 'Improves environment' }}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-base font-bold text-orange-400 mb-2">
              5. 💰 {{ locale === 'zh' ? '资源管理' : 'Resource Management' }}
            </h3>
            <div class="bg-gray-800/50 p-3 rounded">
              <h4 class="text-sm font-bold text-yellow-400 mb-2">
                {{ locale === 'zh' ? '主要资源' : 'Main Resources' }}:
              </h4>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="flex items-center space-x-1">
                  <span class="text-green-400">💰</span>
                  <span>{{ locale === 'zh' ? '金币：建造升级' : 'Coins: Build & upgrade' }}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <span class="text-blue-400">👥</span>
                  <span>{{ locale === 'zh' ? '人口：住宅容量' : 'Population: Housing capacity' }}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <span class="text-yellow-400">⚡</span>
                  <span>{{ locale === 'zh' ? '电力：建筑消耗' : 'Power: Building consumption' }}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <span class="text-gray-400">🌫️</span>
                  <span>{{ locale === 'zh' ? '污染：工业产生' : 'Pollution: Industrial production' }}</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-base font-bold text-orange-400 mb-2">
              6. ❓ {{ locale === 'zh' ? '常见问题' : 'FAQ' }}
            </h3>
            <div class="space-y-2">
              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-yellow-400">{{ locale === 'zh' ? 'Q：金币不够怎么办？' : 'Q: Not enough coins?' }}</h4>
                <p class="text-sm text-gray-400">{{ locale === 'zh' ? 'A：优先建造商业、工业建筑，提升金币产出' : 'A: Build commercial and industrial buildings' }}</p>
              </div>
              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-yellow-400">{{ locale === 'zh' ? 'Q：人口增长缓慢？' : 'Q: Slow population growth?' }}</h4>
                <p class="text-sm text-gray-400">{{ locale === 'zh' ? 'A：增加住宅容量，建造更多就业岗位' : 'A: Increase housing capacity and jobs' }}</p>
              </div>
              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-yellow-400">{{ locale === 'zh' ? 'Q：城市污染太高？' : 'Q: Too much pollution?' }}</h4>
                <p class="text-sm text-gray-400">{{ locale === 'zh' ? 'A：多建公园、垃圾站，远离住宅区布置工业' : 'A: Build parks and garbage stations' }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- 速查表 -->
        <div v-if="showQuickReference" class="space-y-4 text-gray-300">
          <section>
            <h3 class="text-base font-bold text-orange-400 mb-2">
              📋 {{ locale === 'zh' ? '建筑相互作用速查表' : 'Building Interaction Quick Reference' }}
            </h3>
            <p class="text-sm text-gray-400 mb-3">
              {{ locale === 'zh' ? '建筑之间会产生相互影响，合理布局能获得额外加成。' : 'Buildings interact with each other, proper layout provides bonuses.' }}
            </p>

            <div class="bg-gray-800/50 p-3 rounded mb-3">
              <h4 class="text-sm font-bold text-green-400 mb-2">🏠 {{ locale === 'zh' ? '住宅' : 'Residential' }}</h4>
              <div class="space-y-1 text-sm">
                <div><span class="text-green-400">🏠 + 🌳</span> {{ locale === 'zh' ? '每个相邻公园：+10%人口' : 'Near Park: +10% population' }}</div>
                <div><span class="text-red-400">🏠 + 🏭</span> {{ locale === 'zh' ? '每个相邻工厂：-15%人口' : 'Near Factory: -15% population' }}</div>
              </div>
            </div>

            <div class="bg-gray-800/50 p-3 rounded mb-3">
              <h4 class="text-sm font-bold text-green-400 mb-2">🏬 {{ locale === 'zh' ? '商业' : 'Commercial' }}</h4>
              <div class="space-y-1 text-sm">
                <div><span class="text-green-400">🏬 + 🌳</span> {{ locale === 'zh' ? '每个相邻公园：+10%收入' : 'Near Park: +10% income' }}</div>
              </div>
            </div>

            <div class="bg-gray-800/50 p-3 rounded mb-3">
              <h4 class="text-sm font-bold text-green-400 mb-2">🏭 {{ locale === 'zh' ? '工业' : 'Industrial' }}</h4>
              <div class="space-y-1 text-sm">
                <div><span class="text-green-400">🏭 + 🌳</span> {{ locale === 'zh' ? '每个相邻公园：-25%污染' : 'Near Park: -25% pollution' }}</div>
              </div>
            </div>

            <div class="bg-gray-800/50 p-3 rounded">
              <h4 class="text-sm font-bold text-yellow-400 mb-2">💡 {{ locale === 'zh' ? '布局建议' : 'Layout Tips' }}</h4>
              <ul class="text-sm space-y-1">
                <li>• {{ locale === 'zh' ? '住宅靠近公园，远离工业' : 'Houses near parks, away from industry' }}</li>
                <li>• {{ locale === 'zh' ? '商业靠近公园提升收入' : 'Commerce near parks for income boost' }}</li>
                <li>• {{ locale === 'zh' ? '工业区域集中布置' : 'Industrial areas close together' }}</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #3b3b3b #18181b;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #18181b;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3b3b3b;
  border-radius: 3px;
}
</style>
