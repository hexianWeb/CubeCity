import { eventBus } from '@/js/utils/event-bus.js'
import { useGameState } from '@/stores/useGameState.js'
import * as THREE from 'three'
import Experience from '../experience.js'
import { MODES, PERSISTENT_HIGHLIGHT_MODES } from './interactor/constants.js'
import {
  confirmDemolish,
  confirmRelocate,
  confirmUpgrade,
  handleBuildMode,
  handleDefaultMode,
  handleDemolishMode,
  handleRelocateMode,
  handleSelectMode,
  rotateBuilding,
} from './interactor/handlers.js'
import { canPlaceBuilding, getIntersectedTile } from './interactor/utils.js'

/**
 * @file 交互系统：负责射线检测、对象高亮、点击交互等所有用户操作。
 * @author hexianWeb
 *
 * @description
 * 该类的核心职责是：
 * 1. 监听鼠标和键盘事件。
 * 2. 通过射线检测确定用户意图（聚焦、点击）。
 * 3. 管理交互状态（如 focused, selected, relocateFirst）。
 * 4. 根据当前游戏模式 (GameState.currentMode) 将具体业务逻辑分发给对应的处理器。
 * 5. 与 UI 层通过 eventBus 进行通信。
 */
export default class Interactor {
  constructor(cityGroup) {
    // --- 核心依赖 ---
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.iMouse = this.experience.iMouse
    this.canvas = this.experience.canvas
    this.gameState = useGameState() // Pinia Store

    // --- 内部工具 ---
    this.raycaster = new THREE.Raycaster()
    this.cityGroup = cityGroup // 城市中所有可交互对象的集合

    // --- 交互状态管理 ---
    this.focused = null // 当前鼠标悬停的 Tile
    this.selected = null // 当前点击选中的 Tile
    this.relocateFirst = null // 搬迁操作的第一个 Tile
    this.relocateSecond = null // 搬迁操作的第二个 Tile

    this.lastMode = null // 用于检测游戏模式是否发生变化

    // --- 性能优化 ---
    this.lastRaycast = 0 // 上次射线检测时间
    this.raycastInterval = 100 // 射线检测间隔（毫秒）

    // --- 初始化 ---
    this._bindEvents()
  }

  // =================================================================================
  //  事件绑定与解绑
  // =================================================================================

  /**
   * 绑定所有需要的事件监听器
   */
  _bindEvents() {
    this._onMouseMove = this._onMouseMove.bind(this)
    this._onClick = this._onClick.bind(this)
    this._onRightClick = this._onRightClick.bind(this)
    this._onActionConfirmed = this._onActionConfirmed.bind(this)
    this._onKeyDown = this._onKeyDown.bind(this)

    this.canvas.addEventListener('mousemove', this._onMouseMove)
    this.canvas.addEventListener('click', this._onClick)
    this.canvas.addEventListener('contextmenu', this._onRightClick)
    // 监听全局按键，确保'Esc'等键在任何时候都生效
    document.addEventListener('keydown', this._onKeyDown)
    eventBus.on('ui:action-confirmed', this._onActionConfirmed)
  }

  /**
   * 清理所有事件监听器，在对象销毁时调用
   */
  dispose() {
    this.canvas.removeEventListener('mousemove', this._onMouseMove)
    this.canvas.removeEventListener('click', this._onClick)
    this.canvas.removeEventListener('contextmenu', this._onRightClick)
    document.removeEventListener('keydown', this._onKeyDown)
    eventBus.off('ui:action-confirmed', this._onActionConfirmed)
  }

  // =================================================================================
  //  主要事件处理器 (逻辑委托给 handlers)
  // =================================================================================

  /**
   * 鼠标移动事件处理
   * 主要负责：检测模式变更、更新悬停对象、处理高亮效果
   */
  _onMouseMove() {
    this._handleModeChange()

    const now = Date.now()
    if (now - this.lastRaycast < this.raycastInterval) return
    this.lastRaycast = now

    const newFocusedTile = getIntersectedTile(this.raycaster, this.iMouse, this.camera, this.cityGroup)
    this._updateFocus(newFocusedTile)
  }

  /**
   * 鼠标点击事件处理
   * 主要负责：根据当前模式，分发点击逻辑
   */
  _onClick() {
    if (!this.focused)
      return

    const mode = this.gameState.currentMode

    // 在特定模式下，单击即选中
    if (PERSISTENT_HIGHLIGHT_MODES.includes(mode))
      this._setSelected(this.focused)

    // 根据模式委托给对应的处理器
    switch (mode) {
      case MODES.SELECT:
        handleSelectMode(this, this.selected)
        break
      case MODES.BUILD:
        handleBuildMode(this, this.focused)
        break
      case MODES.DEMOLISH:
        handleDemolishMode(this, this.selected)
        break
      case MODES.RELOCATE:
        handleRelocateMode(this, this.selected)
        break
      default:
        handleDefaultMode(this, this.focused)
        break
    }
  }

  /**
   * 鼠标右键事件处理
   * 主要负责：取消所有选择和操作
   */
  _onRightClick(event) {
    if (event)
      event.preventDefault() // 阻止默认的右键菜单
    this._clearSelection()
  }

  /**
   * 键盘事件处理
   * 主要负责：'Esc'键取消选择，'R'键旋转建筑
   */
  _onKeyDown(event) {
    if (event.key === 'Escape') {
      this._onRightClick()
      return
    }

    // 在建造或搬迁模式下，按 'R' 键旋转建筑
    const currentMode = this.gameState.currentMode
    if (currentMode === MODES.BUILD || currentMode === MODES.RELOCATE) {
      if (event.key.toLowerCase() === 'r') {
        const tileToRotate = currentMode === MODES.RELOCATE ? this.selected : this.focused
        if (tileToRotate)
          rotateBuilding(this, tileToRotate)
      }
    }
  }

  /**
   * UI确认事件处理
   * 当用户在UI上点击"确认"按钮后，委托给对应的处理器
   */
  _onActionConfirmed(action) {
    if (!action)
      return

    switch (action) {
      case 'upgrade':
        confirmUpgrade(this)
        break
      case 'demolish':
        confirmDemolish(this)
        break
      case 'relocate':
        confirmRelocate(this)
        break
    }
    // 任何确认操作后，都清空选择状态
    this._clearSelection()
  }

  // =================================================================================
  //  状态管理与辅助函数
  // =================================================================================

  /**
   * 检查当前游戏模式是否改变，如果改变则清空之前的选择状态
   */
  _handleModeChange() {
    if (this.lastMode !== this.gameState.currentMode) {
      this.lastMode = this.gameState.currentMode
      this._clearSelection()
    }
  }

  /**
   * 更新悬停对象的焦点和高亮
   */
  _updateFocus(newFocusedTile) {
    // 如果焦点没变，则不执行任何操作
    if (this.focused === newFocusedTile)
      return

    let mode = this.gameState.currentMode
    // 建造模式下，对不可建造地块应用特殊高亮
    if (mode === MODES.BUILD && newFocusedTile) {
      const { x, y } = newFocusedTile
      const buildingType = this.gameState.selectedBuilding?.type
      const metadata = this.gameState.metadata
      if (!canPlaceBuilding(x, y, buildingType, metadata))
        mode = 'build-invalid'
    }

    // 移除旧焦点的悬停高亮
    if (this.focused && (!this.selected || this.focused !== this.selected || !PERSISTENT_HIGHLIGHT_MODES.includes(mode)))
      this.focused.setFocused(false, mode)

    // 为新焦点添加悬停高亮
    if (newFocusedTile && (!this.selected || newFocusedTile !== this.selected || !PERSISTENT_HIGHLIGHT_MODES.includes(mode)))
      newFocusedTile.setFocused(true, mode)

    this.focused = newFocusedTile
  }

  /**
   * 设置当前选中的对象，并处理高亮状态
   */
  _setSelected(tile) {
    // 如果点击的是同一个对象，则不做任何事
    if (this.selected === tile)
      return

    // 取消上一个选中对象的高亮
    if (this.selected)
      this.selected.setFocused(false, this.gameState.currentMode)

    this.selected = tile

    // 设置新选中对象的高亮
    if (this.selected)
      this.selected.setFocused(true, this.gameState.currentMode)
  }

  /**
   * 清空所有选择状态，并将相关对象恢复默认
   */
  _clearSelection() {
    if (this.selected)
      this.selected.setFocused(false, this.gameState.currentMode)
    if (this.relocateFirst)
      this.relocateFirst.setFocused(false, this.gameState.currentMode)
    if (this.relocateSecond)
      this.relocateSecond.setFocused(false, this.gameState.currentMode)

    this.selected = null
    this.relocateFirst = null
    this.relocateSecond = null

    // 通知UI层清空选择信息
    this.gameState.clearSelection()
  }
}
