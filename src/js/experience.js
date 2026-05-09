import { useGameState } from '@/stores/useGameState.js'
import * as THREE from 'three'
import Camera from './camera.js'
import Renderer from './renderer.js'
import sources from './sources.js'
import Debug from './utils/debug.js'
import { eventBus } from './utils/event-bus.js'
import IMouse from './utils/imouse.js'
import Resources from './utils/resources.js'
import Sizes from './utils/sizes.js'
import Stats from './utils/stats.js'
import Time from './utils/time.js'
import PhysicsWorld from './world/physics-world.js'
import World from './world/world.js'

let instance

export default class Experience {
  constructor(canvas) {
    if (instance) {
      return instance
    }

    instance = this

    window.Experience = this

    this.canvas = canvas

    this.eventBus = eventBus

    this.debug = new Debug()
    this.stats = new Stats()
    this.sizes = new Sizes(this.canvas)
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0x6990b8, 50, 180)
    this.camera = new Camera(true)
    this.renderer = new Renderer()
    this.resources = new Resources(sources)
    this.physics = new PhysicsWorld()
    this.iMouse = new IMouse()
    this.world = new World()
    this.gameState = useGameState()

    this.sizes.on('resize', () => {
      this.resize()
    })

    this.lastRenderTime = 0
    this.targetFPS = 30
    this.frameInterval = 1000 / this.targetFPS

    this.time.on('tick', () => {
      this.update()
    })
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    const now = performance.now()
    const delta = now - this.lastRenderTime

    this.camera.update()
    this.world.update()
    this.iMouse.update()

    if (delta >= this.frameInterval) {
      this.lastRenderTime = now - (delta % this.frameInterval)
      this.renderer.update()
      this.stats.update()
    }
  }
}
