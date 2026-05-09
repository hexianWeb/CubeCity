<script setup>
import { useGameState } from '@/stores/useGameState.js'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const gameState = useGameState()
const { musicEnabled, musicVolume } = storeToRefs(gameState)

// 音频上下文引用（支持uniapp和浏览器）
const audioContext = ref(null)
const browserAudioRef = ref(null)
const isUniApp = ref(false)

// 播放状态追踪，防止竞态条件
const isPlaying = ref(false)
const isPlayPending = ref(false)

// 播放列表
const playlist = ['/audio/song01.mp3', '/audio/song02.mp3']
let currentIndex = 0

// 检测是否为uniapp环境
function checkUniAppEnv() {
  return typeof uni !== 'undefined' && typeof uni.createInnerAudioContext === 'function'
}

// 获取当前音频对象
function getAudio() {
  return isUniApp.value ? audioContext.value : browserAudioRef.value
}

// 设置当前音频源
function setAudioSrc(src) {
  if (isUniApp.value) {
    audioContext.value.src = src
  } else {
    if (browserAudioRef.value) {
      browserAudioRef.value.src = src
    }
  }
}

// 设置音量
function setAudioVolume(volume) {
  const audio = getAudio()
  if (audio) {
    audio.volume = volume
  }
}

// 初始化音频
function initAudio() {
  isUniApp.value = checkUniAppEnv()

  if (isUniApp.value) {
    // uniapp环境使用原生API
    audioContext.value = uni.createInnerAudioContext()
    audioContext.value.autoplay = false
    audioContext.value.loop = false
    audioContext.value.volume = musicVolume.value

    // 设置音频事件监听
    audioContext.value.onEnded(() => {
      handleTrackEnded()
    })

    audioContext.value.onPlay(() => {
      isPlaying.value = true
      isPlayPending.value = false
      gameState.setMusicPlaying(true)
    })

    audioContext.value.onPause(() => {
      isPlaying.value = false
      isPlayPending.value = false
      gameState.setMusicPlaying(false)
    })

    audioContext.value.onStop(() => {
      isPlaying.value = false
      isPlayPending.value = false
      gameState.setMusicPlaying(false)
    })

    audioContext.value.onError((e) => {
      console.error('uniapp音频播放错误:', e)
      isPlaying.value = false
      isPlayPending.value = false
      gameState.setMusicPlaying(false)
      nextTrack()
    })

    // 设置第一首歌
    audioContext.value.src = playlist[currentIndex]
  } else {
    // 浏览器环境 - 设置第一首歌
    setTimeout(() => {
      if (browserAudioRef.value) {
        browserAudioRef.value.src = playlist[currentIndex]
      }
    }, 100)
  }
}

// 监听音乐开关状态
watch(musicEnabled, (enabled) => {
  if (enabled) {
    playMusic()
  } else {
    pauseMusic()
  }
})

// 监听音量变化
watch(musicVolume, (volume) => {
  setAudioVolume(volume)
})

// 播放音乐
function playMusic() {
  const audio = getAudio()
  if (!audio || !musicEnabled.value || isPlayPending.value) return

  // 如果已经在播放，不需要重复播放
  if (isPlaying.value) return

  isPlayPending.value = true

  try {
    if (isUniApp.value) {
      // uniapp环境 - play不是Promise
      audio.play()
    } else {
      // 浏览器环境
      audio.play().then(() => {
        isPlaying.value = true
        isPlayPending.value = false
        gameState.setMusicPlaying(true)
      }).catch((error) => {
        console.error('浏览器播放失败:', error)
        isPlaying.value = false
        isPlayPending.value = false
        gameState.setMusicPlaying(false)
        
        // 如果是中断错误，不重试
        if (error.name !== 'AbortError') {
          setTimeout(() => {
            nextTrack()
          }, 1000)
        }
      })
    }
  } catch (error) {
    console.error('播放失败:', error)
    isPlaying.value = false
    isPlayPending.value = false
    gameState.setMusicPlaying(false)
    
    if (error.name !== 'AbortError') {
      setTimeout(() => {
        nextTrack()
      }, 1000)
    }
  }
}

// 暂停音乐
function pauseMusic() {
  const audio = getAudio()
  if (!audio) return

  isPlayPending.value = false

  if (isUniApp.value) {
    audio.pause()
  } else {
    if (!audio.paused) {
      audio.pause()
      isPlaying.value = false
      gameState.setMusicPlaying(false)
    }
  }
}

// 停止音乐
function stopMusic() {
  const audio = getAudio()
  if (!audio) return

  isPlayPending.value = false

  if (isUniApp.value) {
    audio.stop()
  } else {
    audio.pause()
    audio.currentTime = 0
    isPlaying.value = false
    gameState.setMusicPlaying(false)
  }
}

// 处理歌曲结束事件 - 自动切换到下一首
function handleTrackEnded() {
  currentIndex = (currentIndex + 1) % playlist.length
  setAudioSrc(playlist[currentIndex])

  if (musicEnabled.value) {
    setTimeout(() => {
      playMusic()
    }, 500)
  }
}

// 切换到下一首歌
function nextTrack() {
  const audio = getAudio()
  if (!audio) return

  const wasPlaying = isUniApp.value ? !audio.paused : (!audio?.paused)
  currentIndex = (currentIndex + 1) % playlist.length
  setAudioSrc(playlist[currentIndex])

  if (wasPlaying && musicEnabled.value) {
    setTimeout(() => {
      playMusic()
    }, 500)
  }
}

// 组件挂载时初始化
onMounted(() => {
  initAudio()
})

// 组件卸载时清理
onUnmounted(() => {
  if (isUniApp.value && audioContext.value) {
    audioContext.value.destroy()
    audioContext.value = null
  } else if (browserAudioRef.value) {
    browserAudioRef.value.pause()
    browserAudioRef.value.src = ''
    browserAudioRef.value = null
  }
})

// 暴露方法给父组件
defineExpose({
  playMusic,
  pauseMusic,
  stopMusic,
  nextTrack,
})
</script>

<template>
  <!-- 浏览器环境使用HTML5 audio元素 -->
  <audio
    v-if="!isUniApp"
    ref="browserAudioRef"
    preload="auto"
    style="display:none"
  />
</template>
