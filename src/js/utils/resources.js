import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

import Experience from '../experience.js'
import EventEmitter from './event-emitter.js'

export default class Resources extends EventEmitter {
  constructor(sources, options = {}) {
    super()

    this.experience = new Experience()
    this.renderer = this.experience.renderer
    this.sources = sources

    this.items = {}
    this.toLoad = this.sources.length
    this.loaded = 0

    // 判断是否为 uniapp 环境
    this.isUniApp = typeof uni !== 'undefined' && typeof uni.request === 'function'

    // Loading screen elements
    this.loadingScreen = document.getElementById('loading-screen')
    this.loadingBar = document.getElementById('loading-bar')
    this.loadingPercentage = document.getElementById('loading-percentage')

    this.options = {
      dracoDecoderPath: 'https://www.gstatic.com/draco/v1/decoders/',
      ktx2TranscoderPath: 'https://unpkg.com/three/examples/jsm/libs/basis/',
      ...options,
    }

    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    this.loaders = {}
    this.loaders.gltfLoader = new GLTFLoader()
    this.loaders.textureLoader = new THREE.TextureLoader()
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
    this.loaders.fontLoader = new FontLoader()
    this.loaders.fbxLoader = new FBXLoader()
    this.loaders.audioLoader = new THREE.AudioLoader()
    this.loaders.objLoader = new OBJLoader()
    this.loaders.hdrTextureLoader = new RGBELoader()
    this.loaders.svgLoader = new SVGLoader()
    this.loaders.exrLoader = new EXRLoader()
    this.loaders.ktx2Loader = new KTX2Loader()

    // Set up DRACOLoader
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(this.options.dracoDecoderPath)
    this.loaders.gltfLoader.setDRACOLoader(dracoLoader)

    // Set up KTX2Loader
    this.loaders.ktx2Loader
      .setTranscoderPath(this.options.ktx2TranscoderPath)
      .detectSupport(this.renderer.instance)
    this.loaders.gltfLoader.setKTX2Loader(this.loaders.ktx2Loader)
  }

  async startLoading() {
    for (const source of this.sources) {
      // 报错事件
      const onError = (error) => {
        console.error(`加载资源失败: ${source.name} (${source.path})`, error)
        this.sourceLoaded(source, null)
      }

      try {
        switch (source.type) {
          case 'gltfModel': {
            if (this.isUniApp) {
              await this.loadGLTFModelUniApp(source, onError)
            } else {
              this.loaders.gltfLoader.load(source.path, (file) => {
                file.scene.traverse((child) => {
                  if (child.isMesh) {
                    child.castShadow = false
                    child.receiveShadow = false
                    if (child.material) {
                      child.material.flatShading = true
                    }
                  }
                })
                this.sourceLoaded(source, file)
              }, undefined, onError)
            }
            break
          }
          case 'texture': {
            if (this.isUniApp) {
              await this.loadTextureUniApp(source, onError)
            } else {
              this.loaders.textureLoader.load(source.path, (file) => {
                file.minFilter = THREE.LinearFilter
                file.magFilter = THREE.LinearFilter
                file.generateMipmaps = false
                file.maxAnisotropy = 1
                this.sourceLoaded(source, file)
              }, undefined, onError)
            }
            break
          }
          case 'cubeTexture': {
            if (this.isUniApp) {
              await this.loadCubeTextureUniApp(source, onError)
            } else {
              this.loaders.cubeTextureLoader.load(source.path, (file) => {
                this.sourceLoaded(source, file)
              }, undefined, onError)
            }
            break
          }
          case 'font': {
            if (this.isUniApp) {
              await this.loadFontUniApp(source, onError)
            } else {
              this.loaders.fontLoader.load(source.path, (file) => {
                this.sourceLoaded(source, file)
              }, undefined, onError)
            }
            break
          }
          case 'fbxModel': {
            if (this.isUniApp) {
              await this.loadFBXModelUniApp(source, onError)
            } else {
              this.loaders.fbxLoader.load(source.path, (file) => {
                this.sourceLoaded(source, file)
              }, undefined, onError)
            }
            break
          }
          case 'audio': {
            if (this.isUniApp) {
              await this.loadAudioUniApp(source, onError)
            } else {
              this.loaders.audioLoader.load(source.path, (file) => {
                this.sourceLoaded(source, file)
              }, undefined, onError)
            }
            break
          }
          case 'objModel': {
            if (this.isUniApp) {
              await this.loadOBJModelUniApp(source, onError)
            } else {
              this.loaders.objLoader.load(source.path, (file) => {
                this.sourceLoaded(source, file)
              }, undefined, onError)
            }
            break
          }
          case 'hdrTexture': {
            if (this.isUniApp) {
              await this.loadHDRTextureUniApp(source, onError)
            } else {
              this.loaders.hdrTextureLoader.load(source.path, (file) => {
                this.sourceLoaded(source, file)
              }, undefined, onError)
            }
            break
          }
          case 'svg': {
            if (this.isUniApp) {
              await this.loadSVGUniApp(source, onError)
            } else {
              this.loaders.svgLoader.load(source.path, (file) => {
                this.sourceLoaded(source, file)
              }, undefined, onError)
            }
            break
          }
          case 'exrTexture': {
            if (this.isUniApp) {
              await this.loadEXRTextureUniApp(source, onError)
            } else {
              this.loaders.exrLoader.load(source.path, (file) => {
                this.sourceLoaded(source, file)
              }, undefined, onError)
            }
            break
          }
          case 'video': {
            this.loadVideoTexture(source.path).then((file) => {
              this.sourceLoaded(source, file)
            }).catch(onError)
            break
          }
          case 'ktx2Texture': {
            if (this.isUniApp) {
              await this.loadKTX2TextureUniApp(source, onError)
            } else {
              this.loaders.ktx2Loader.load(source.path, (file) => {
                this.sourceLoaded(source, file)
              }, undefined, onError)
            }
            break
          }
        }
      } catch (error) {
        onError(error)
      }
    }
  }

  // === uniapp 专用加载方法 ===

  async loadGLTFModelUniApp(source, onError) {
    try {
      const arrayBuffer = await this.downloadFileAsArrayBuffer(source.path)
      if (!arrayBuffer) {
        onError(new Error('文件下载失败'))
        return
      }
      this.loaders.gltfLoader.parse(arrayBuffer, '', (file) => {
        file.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false
            child.receiveShadow = false
            if (child.material) {
              child.material.flatShading = true
            }
          }
        })
        this.sourceLoaded(source, file)
      }, onError)
    } catch (error) {
      onError(error)
    }
  }

  async loadTextureUniApp(source, onError) {
    try {
      const arrayBuffer = await this.downloadFileAsArrayBuffer(source.path)
      if (!arrayBuffer) {
        onError(new Error('文件下载失败'))
        return
      }
      const blob = new Blob([arrayBuffer])
      const url = URL.createObjectURL(blob)
      this.loaders.textureLoader.load(url, (file) => {
        file.minFilter = THREE.LinearFilter
        file.magFilter = THREE.LinearFilter
        file.generateMipmaps = false
        file.maxAnisotropy = 1
        URL.revokeObjectURL(url)
        this.sourceLoaded(source, file)
      }, undefined, (error) => {
        URL.revokeObjectURL(url)
        onError(error)
      })
    } catch (error) {
      onError(error)
    }
  }

  async loadCubeTextureUniApp(source, onError) {
    try {
      if (!Array.isArray(source.path)) {
        onError(new Error('cubeTexture 路径必须是数组'))
        return
      }
      const textures = []
      for (const path of source.path) {
        const arrayBuffer = await this.downloadFileAsArrayBuffer(path)
        if (!arrayBuffer) {
          onError(new Error(`文件下载失败: ${path}`))
          return
        }
        const blob = new Blob([arrayBuffer])
        const url = URL.createObjectURL(blob)
        textures.push(url)
      }
      this.loaders.cubeTextureLoader.load(textures, (file) => {
        textures.forEach(url => URL.revokeObjectURL(url))
        this.sourceLoaded(source, file)
      }, undefined, (error) => {
        textures.forEach(url => URL.revokeObjectURL(url))
        onError(error)
      })
    } catch (error) {
      onError(error)
    }
  }

  async loadFontUniApp(source, onError) {
    try {
      const text = await this.downloadFileAsText(source.path)
      if (!text) {
        onError(new Error('文件下载失败'))
        return
      }
      const fontData = JSON.parse(text)
      this.sourceLoaded(source, fontData)
    } catch (error) {
      onError(error)
    }
  }

  async loadFBXModelUniApp(source, onError) {
    try {
      const arrayBuffer = await this.downloadFileAsArrayBuffer(source.path)
      if (!arrayBuffer) {
        onError(new Error('文件下载失败'))
        return
      }
      const file = this.loaders.fbxLoader.parse(arrayBuffer)
      this.sourceLoaded(source, file)
    } catch (error) {
      onError(error)
    }
  }

  async loadAudioUniApp(source, onError) {
    try {
      const arrayBuffer = await this.downloadFileAsArrayBuffer(source.path)
      if (!arrayBuffer) {
        onError(new Error('文件下载失败'))
        return
      }
      this.sourceLoaded(source, arrayBuffer)
    } catch (error) {
      onError(error)
    }
  }

  async loadOBJModelUniApp(source, onError) {
    try {
      const text = await this.downloadFileAsText(source.path)
      if (!text) {
        onError(new Error('文件下载失败'))
        return
      }
      const file = this.loaders.objLoader.parse(text)
      this.sourceLoaded(source, file)
    } catch (error) {
      onError(error)
    }
  }

  async loadHDRTextureUniApp(source, onError) {
    try {
      const arrayBuffer = await this.downloadFileAsArrayBuffer(source.path)
      if (!arrayBuffer) {
        onError(new Error('文件下载失败'))
        return
      }
      const blob = new Blob([arrayBuffer])
      const url = URL.createObjectURL(blob)
      this.loaders.hdrTextureLoader.load(url, (file) => {
        URL.revokeObjectURL(url)
        this.sourceLoaded(source, file)
      }, undefined, (error) => {
        URL.revokeObjectURL(url)
        onError(error)
      })
    } catch (error) {
      onError(error)
    }
  }

  async loadSVGUniApp(source, onError) {
    try {
      const text = await this.downloadFileAsText(source.path)
      if (!text) {
        onError(new Error('文件下载失败'))
        return
      }
      const file = this.loaders.svgLoader.parse(text)
      this.sourceLoaded(source, file)
    } catch (error) {
      onError(error)
    }
  }

  async loadEXRTextureUniApp(source, onError) {
    try {
      const arrayBuffer = await this.downloadFileAsArrayBuffer(source.path)
      if (!arrayBuffer) {
        onError(new Error('文件下载失败'))
        return
      }
      const file = this.loaders.exrLoader.parse(arrayBuffer)
      this.sourceLoaded(source, file)
    } catch (error) {
      onError(error)
    }
  }

  async loadKTX2TextureUniApp(source, onError) {
    try {
      const arrayBuffer = await this.downloadFileAsArrayBuffer(source.path)
      if (!arrayBuffer) {
        onError(new Error('文件下载失败'))
        return
      }
      this.loaders.ktx2Loader.parse(arrayBuffer, '', (file) => {
        this.sourceLoaded(source, file)
      }, onError)
    } catch (error) {
      onError(error)
    }
  }

  // 使用 uni.downloadFile 下载文件为 ArrayBuffer
  downloadFileAsArrayBuffer(path) {
    return new Promise((resolve, reject) => {
      uni.downloadFile({
        url: path.startsWith('/') ? path.slice(1) : path,
        success: (res) => {
          if (res.statusCode === 200) {
            const filePath = res.tempFilePath
            uni.getFileInfo({
              filePath: filePath,
              success: (fileInfo) => {
                const file = new FileReader()
                file.onload = (e) => {
                  resolve(e.target.result)
                }
                file.onerror = () => {
                  reject(new Error('文件读取失败'))
                }
                // 由于无法直接获取文件内容，这里使用另一种方法
                // 在 uniapp 中，我们需要使用 base64 或者其他方式
                uni.getFileSystemManager().readFile({
                  filePath: filePath,
                  encoding: 'binary',
                  success: (data) => {
                    // 将二进制数据转换为 ArrayBuffer
                    const buffer = new ArrayBuffer(data.data.length)
                    const view = new Uint8Array(buffer)
                    for (let i = 0; i < data.data.length; i++) {
                      view[i] = data.data.charCodeAt(i) & 0xff
                    }
                    resolve(buffer)
                  },
                  fail: () => {
                    reject(new Error('文件读取失败'))
                  }
                })
              },
              fail: () => {
                reject(new Error('获取文件信息失败'))
              }
            })
          } else {
            reject(new Error(`下载失败，状态码: ${res.statusCode}`))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  // 使用 uni.request 下载文件为文本
  downloadFileAsText(path) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: path.startsWith('/') ? path.slice(1) : path,
        method: 'GET',
        responseType: 'text',
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(`下载失败，状态码: ${res.statusCode}`))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file
    this.loaded++

    // Update loading progress
    const progress = this.loadProgress
    const percentage = Math.round(progress * 100)

    if (this.loadingBar) {
      this.loadingBar.style.width = `${percentage}%`
    }
    if (this.loadingPercentage) {
      this.loadingPercentage.textContent = `${percentage}%`
    }

    if (this.loaded === this.toLoad) {
      // Hide loading screen with fade out animation
      if (this.loadingScreen) {
        this.loadingScreen.style.transition = 'opacity 0.5s ease-out'
        this.loadingScreen.style.opacity = '0'
        setTimeout(() => {
          this.loadingScreen.style.display = 'none'
        }, 500)
      }
      this.trigger('ready')
    }
  }

  loadVideoTexture(path) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.src = path
      video.loop = true
      video.muted = true
      video.playsInline = true

      video.addEventListener('loadeddata', () => {
        const texture = new THREE.VideoTexture(video)
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.format = THREE.RGBFormat

        resolve(texture)
      })

      video.addEventListener('error', (e) => {
        reject(new Error(`视频加载失败，路径: ${path}`, { cause: e }))
      })

      video.load()
    })
  }

  get loadProgress() {
    return this.loaded / this.toLoad
  }

  get isLoaded() {
    return this.loaded === this.toLoad
  }
}
