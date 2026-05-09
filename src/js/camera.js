import gsap from 'gsap'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import Experience from './experience.js'

export default class Camera {
  constructor(orthographic = false) {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.orthographic = orthographic
    this.debug = this.experience.debug
    this.debugActive = this.experience.debug.active

    /* ---------- 固定点位 ---------- */
    this.fixedPoints = [
      new THREE.Vector3(18, 10, 18),
      new THREE.Vector3(18, 10, -2),
      new THREE.Vector3(-2, 10, -2),
      new THREE.Vector3(-2, 10, 18),
    ]
    this.currentIndex = 0 // 当前点位索引
    this.target = new THREE.Vector3(8, 0, 8)

    this.isRotating = false // 是否正在切换动画
    this.initialAngle = null // 记录“初始角”，仅作为标记，不强制使用

    this.setInstance()
    this.setControls()
    this.setDebug()
    this.setKeyboardControls()
  }

  /* -------------------------------------------------- */
  /*  其余函数保持不变（setInstance / setControls ……）  */
  /* -------------------------------------------------- */

  setInstance() {
    if (this.orthographic) {
      const aspect = this.sizes.aspect
      this.frustumSize = 10
      this.instance = new THREE.OrthographicCamera(
        -this.frustumSize * aspect,
        this.frustumSize * aspect,
        this.frustumSize,
        -this.frustumSize,
        -50,
        100,
      )
    }
    else {
      this.instance = new THREE.PerspectiveCamera(
        34,
        this.sizes.width / this.sizes.height,
        0.1,
        250,
      )
    }

    // 初始位置使用固定点位 0
    this.instance.position.copy(this.fixedPoints[this.currentIndex])
    this.instance.lookAt(this.target)
    this.scene.add(this.instance)
  }

  setControls() {
    // 鼠标自由旋转（OrbitControls）
    this.orbitControls = new OrbitControls(this.instance, this.canvas)
    this.orbitControls.enableDamping = true
    this.orbitControls.enableZoom = false
    this.orbitControls.enableRotate = true // 允许鼠标旋转
    this.orbitControls.dampingFactor = 0.3
    this.orbitControls.target.copy(this.target)

    // 锁定垂直极角：当前相机 -> 目标点的方向
    const offset = new THREE.Vector3().subVectors(this.instance.position, this.target)
    const polarAngle = offset.angleTo(new THREE.Vector3(0, 1, 0))
    this.orbitControls.minPolarAngle = polarAngle
    this.orbitControls.maxPolarAngle = polarAngle

    // 缩放（TrackballControls）
    this.trackballControls = new TrackballControls(this.instance, this.canvas)
    this.trackballControls.noRotate = true
    this.trackballControls.noPan = true
    this.trackballControls.noZoom = false
    this.trackballControls.zoomSpeed = 1
    this.trackballControls.minZoom = 0.5
    this.trackballControls.maxZoom = 2
    this.trackballControls.target.copy(this.target)
    this.trackballControls.handleResize()
  }

  setDebug() {
    if (this.debugActive) {
      const folder = this.debug.ui.addFolder({ title: 'Camera', expanded: false })
      folder.addBinding(this.instance, 'position', { label: 'Position' })
        .on('change', () => this.instance.lookAt(this.target))
    }
  }

  resize() {
    if (this.orthographic) {
      const aspect = this.sizes.width / this.sizes.height
      this.instance.left = -this.frustumSize * aspect
      this.instance.right = this.frustumSize * aspect
      this.instance.top = this.frustumSize
      this.instance.bottom = -this.frustumSize
      this.instance.updateProjectionMatrix()
    }
    else {
      this.instance.aspect = this.sizes.width / this.sizes.height
      this.instance.updateProjectionMatrix()
    }
    this.trackballControls.handleResize()
  }

  update() {
    this.orbitControls.update()
    this.trackballControls.update()
  }

  /* -------------------------------------------------- */
  /*              键盘切换逻辑（核心改动）               */
  /* -------------------------------------------------- */
  setKeyboardControls() {
    window.addEventListener('keydown', (ev) => {
      if (this.isRotating)
        return

      if (ev.key === 'ArrowLeft') {
        this.snapToNextPoint(-1) // 逆时针
      }
      else if (ev.key === 'ArrowRight') {
        this.snapToNextPoint(1) // 顺时针
      }
    })
  }

  snapToNextPoint(step) {
    // 1. 找到离当前相机最近的点位
    const pos = this.instance.position
    let closest = 0
    let minDist = pos.distanceTo(this.fixedPoints[0])

    for (let i = 1; i < this.fixedPoints.length; i++) {
      const d = pos.distanceTo(this.fixedPoints[i])
      if (d < minDist) {
        minDist = d
        closest = i
      }
    }

    // 2. 计算下一个点位索引
    const next = (closest + step + this.fixedPoints.length) % this.fixedPoints.length

    // 3. 执行动画
    this.animateTo(this.fixedPoints[next])
  }

  animateTo(targetPos) {
    this.isRotating = true

    gsap.to(this.instance.position, {
      duration: 0.7,
      ease: 'power2.inOut',
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      onUpdate: () => {
        this.instance.lookAt(this.target)
        // 同步控制器
        this.orbitControls.target.copy(this.target)
        this.trackballControls.target.copy(this.target)
      },
      onComplete: () => {
        this.isRotating = false
        this.orbitControls.update()
        this.trackballControls.update()
      },
    })
  }
}
