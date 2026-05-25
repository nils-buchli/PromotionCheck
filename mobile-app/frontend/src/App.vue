<template>
  <div class="flex justify-center bg-zinc-100" style="height: calc(var(--vh, 1dvh) * 100);">

    <!-- Loading screen -->
    <Transition name="loading">
      <div v-if="!globalStatesStore.initComplete" class="fixed inset-0 z-[200] flex items-center justify-center bg-white">
        <div class="flex flex-col items-center gap-4">
          <div class="w-[72px] h-[72px] rounded-[18px] overflow-hidden shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" class="w-full h-full">
              <defs><clipPath id="ic"><rect width="1024" height="1024" rx="224"/></clipPath></defs>
              <rect width="1024" height="1024" rx="224" fill="#1A3C8F"/>
              <rect width="1024" height="420" fill="#2150B5" clip-path="url(#ic)"/>
              <rect y="800" width="1024" height="224" fill="#122870" clip-path="url(#ic)"/>
              <rect x="260" y="520" width="140" height="280" rx="40" fill="#FFFFFF" opacity="0.92"/>
              <rect x="442" y="400" width="140" height="400" rx="40" fill="#FFFFFF" opacity="0.92"/>
              <rect x="624" y="260" width="140" height="540" rx="40" fill="#F0C040"/>
              <polygon points="330,360 346,400 390,400 356,426 370,468 330,442 290,468 304,426 270,400 314,400" fill="#F0C040"/>
              <rect width="1024" height="70" fill="#FFFFFF" opacity="0.04" clip-path="url(#ic)"/>
            </svg>
          </div>
          <p class="text-[13px] font-semibold text-zinc-400 tracking-[0.15em] uppercase">PromotionCheck</p>
          <div class="w-[18px] h-[18px] rounded-full border-2 border-zinc-200 border-t-zinc-500 animate-spin"></div>
        </div>
      </div>
    </Transition>

    <!-- Oben: Status Bar Bereich -->
    <div v-if="!isWeb" class="fixed top-0 left-0 right-0 bg-zinc-100 z-50" :style="{ height: statusBarHeight }"></div>

    <div class="relative w-full max-w-md flex flex-col bg-white shadow-xl"
         :style="{
           height: 'calc(var(--vh, 1dvh) * 100)',
           paddingTop: isWeb ? '0' : statusBarHeight,
           paddingBottom: isWeb ? '0' : navBarHeight
         }">

      <AppBar />

      <main class="flex-1 min-h-0 flex overflow-hidden">
        <router-view v-if="globalStatesStore.initComplete" v-slot="{ Component }">
          <component :is="Component" class="flex-1 min-h-0" />
        </router-view>
      </main>

      <BottomBar />
      <RemovingPanel />
      <Announcement />

    </div>

    <!-- Unten: Nav Bar Bereich -->
    <div v-if="!isWeb" class="fixed bottom-0 left-0 right-0 bg-zinc-100 z-50" :style="{ height: navBarHeight }"></div>

  </div>
</template>

<script setup>
import { watch } from 'vue'
import { Capacitor } from '@capacitor/core'

import AppBar from './components/AppBar.vue'
import BottomBar from './components/BottomBar.vue'
import RemovingPanel from './components/RemovingPanel.vue'
import Announcement from './components/Announcement.vue'
import { useGlobalStatesStore } from './stores/globalStates'

const globalStatesStore = useGlobalStatesStore()
const isWeb = Capacitor.getPlatform() === 'web'

const statusBarHeight = 'calc(env(safe-area-inset-top, 44px) - 15px)'
const navBarHeight = 'calc(env(safe-area-inset-bottom, 44px) - 15px)'

watch(() => globalStatesStore.removingElements, (v) => {
  globalStatesStore.clearRemove()
})

</script>

<style scoped>
@import './assets/app.css';

.loading-leave-active {
  transition: opacity 0.35s ease;
}
.loading-leave-to {
  opacity: 0;
}
</style>