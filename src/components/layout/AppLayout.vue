<script setup>
// 布局组件：通过命名插槽划分页面区域
// - header / footer 高度固定（随内容调整）
// - 中间区域 flex-1 + min-h-0，内部使用 12 栅格
// - overlays 为全局覆盖层，默认不拦截鼠标事件
</script>

<template>
  <!-- 桌面端：使用 dvh 适配移动端动态地址栏变化 -->
  <div class="game-container flex flex-col h-[100dvh] md:h-screen overflow-hidden">
    <!-- 固定顶部：高度随内容调整 -->
    <header class="flex-none">
      <slot name="header" />
    </header>

    <!-- 主体：填充剩余高度，内部使用 12 栅格 -->
    <div class="flex-1 min-h-0">
      <div class="grid grid-cols-1 md:grid-cols-12 h-full min-h-0">
        <!-- 左侧栏：桌面端显示，移动端隐藏 -->
        <aside class="hidden md:block md:col-span-2 order-1 min-h-0 overflow-y-auto">
          <slot name="left" />
        </aside>

        <!-- 中间区域：游戏画布 -->
        <section class="md:col-span-8 order-2 md:order-2 min-h-0">
          <div class="relative industrial-panel shadow-industrial overflow-hidden h-full">
            <slot name="main" />
          </div>
        </section>

        <!-- 右侧栏：桌面端显示，移动端隐藏 -->
        <aside class="hidden md:block md:col-span-2 order-3 min-h-0 overflow-y-auto">
          <slot name="right" />
        </aside>
      </div>
    </div>

    <!-- 固定底部：高度随内容调整 -->
    <footer class="flex-none">
      <slot name="footer" />
    </footer>

    <!-- 全局覆盖层（不拦截鼠标事件，子层自行开启 pointer-events） -->
    <div class="fixed inset-0 z-40 pointer-events-none">
      <slot name="overlays" />
    </div>
  </div>
</template>

<style scoped>
/* 无额外样式：完全依赖已有的全局样式中 Tailwind 工具类 */
</style>
