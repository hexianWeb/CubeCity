import { BUILDING_DATA } from '@/constants/constants.js'
import { eventBus } from '@/js/utils/event-bus.js'
import { FREE_BUILDING_TYPES } from './constants.js'

/**
 * 判断建筑是否可以放置在指定地块 (单纯判断地形)
 * @param {number} x - x 坐标
 * @param {number} y - y 坐标
 * @param {string} buildingType - 建筑类型
 * @param {object} metadata - 城市元数据
 * @returns {boolean} - 是否可以放置
 */
export function canPlaceBuilding(x, y, buildingType, metadata) {
  if (!metadata?.[x]?.[y])
    return false
  // 部分特殊建筑可随意建造
  if (FREE_BUILDING_TYPES.includes(buildingType))
    return true

  // 其他建筑需相邻道路
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  for (const [dx, dy] of dirs) {
    const nx = x + dx
    const ny = y + dy
    if (metadata[nx]?.[ny]?.type === 'ground' && metadata[nx]?.[ny]?.building === 'road')
      return true
  }
  return false
}

/**
 * 从场景中的物理对象向上查找，直到找到Tile实例
 * @param {THREE.Raycaster} raycaster - 射线投射器
 * @param {object} iMouse - 鼠标管理器
 * @param {THREE.Camera} camera - 相机
 * @param {THREE.Group} cityGroup - 城市对象组
 * @returns {object|null} - 找到的 Tile 实例或 null
 */
export function getIntersectedTile(raycaster, iMouse, camera, cityGroup) {
  if (!cityGroup)
    return null
  raycaster.setFromCamera(iMouse.normalizedMouse, camera)
  const intersections = raycaster.intersectObjects(cityGroup.children, true)

  if (intersections.length === 0)
    return null

  const findTile = (obj) => {
    if (!obj)
      return null
    // userData 是我们在创建 Tile 时自己挂载的实例引用
    if (obj.userData && typeof obj.userData.setBuilding === 'function')
      return obj.userData

    return findTile(obj.parent)
  }

  return findTile(intersections[0].object)
}

/**
 * 更新一个地块四周的道路模型
 * @param {object} tile - 目标地块
 * @param {object} city - City 实例
 */
export function updateAdjacentRoads(tile, city) {
  if (!city || !tile)
    return

  const [x, y] = tile.name.split('-').slice(1).map(Number)

  // 获取上下左右四个邻居
  const neighbors = [
    city.getTile(x, y - 1), // top
    city.getTile(x, y + 1), // bottom
    city.getTile(x - 1, y), // left
    city.getTile(x + 1, y), // right
  ]

  // 刷新邻居中的道路
  for (const neighbor of neighbors) {
    if (neighbor?.buildingInstance?.type === 'road')
      neighbor.buildingInstance.refreshView(city)
  }

  // 如果当前地块自己就是道路，也刷新自己
  if (tile.buildingInstance?.type === 'road')
    tile.buildingInstance.refreshView(city)
}

/**
 * 根据建筑类型、等级和当前语言，获取建筑的显示名称
 * @param {string} buildingType - 建筑类型
 * @param {number} level - 建筑等级
 * @param {'zh'|'en'} language - 当前语言
 * @returns {string} - 建筑名称
 */
function getBuildingName(buildingType, level, language) {
  const buildingData = BUILDING_DATA[buildingType]
  // 只返回指定 level 下的名称
  return buildingData.levels[level].displayName[language]
}

/**
 * 在 3D 场景中交换两个地块上的建筑模型
 * @param {object} first - 第一个地块
 * @param {object} second - 第二个地块
 */
export function swapBuilding(first, second) {
  first.setType('ground')
  second.setType('ground')
  // 记录建筑数据
  const firstBuilding = first.buildingInstance
  if (firstBuilding)
    second.setBuilding(firstBuilding.type, firstBuilding.level || 1, firstBuilding.direction)

  first.removeBuilding()
}

/**
 * 封装 eventBus，用于向 UI 发送浮动提示
 * @param {'success'|'error'|'info'} type - 提示类型
 * @param {string} message - 提示信息
 */
export function showToast(type, message) {
  eventBus.emit('toast:add', { message, type })
}

/**
 * 显示“建筑已放置”的提示
 * @param {string} buildingType - 建筑类型
 * @param {object} tile - 目标地块
 * @param {number} level - 建筑等级
 * @param {object} gameState - Pinia GameState
 */
export function showBuildingPlacedToast(buildingType, tile, level, gameState) {
  const buildingName = getBuildingName(buildingType, level, gameState.language)
  const tilePos = tile.name.replace('Tile-', '')
  const message = gameState.language === 'zh'
    ? `建筑 ${buildingName} 已成功放置在 ${tilePos}。`
    : `Building ${buildingName} placed on tile ${tilePos}.`
  showToast('success', message)
}

/**
 * 显示“建筑已移除”的提示
 * @param {string} buildingType - 建筑类型
 * @param {object} tile - 目标地块
 * @param {number} level - 建筑等级
 * @param {object} gameState - Pinia GameState
 */
export function showBuildingRemovedToast(buildingType, tile, level, gameState) {
  const buildingName = getBuildingName(buildingType, level, gameState.language)
  const tilePos = tile.name.replace('Tile-', '')
  const message = gameState.language === 'zh'
    ? `位于 ${tilePos} 的 ${buildingName} 已被移除。`
    : `Building ${buildingName} on tile ${tilePos} has been removed.`
  showToast('error', message)
}
