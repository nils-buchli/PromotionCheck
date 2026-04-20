<template>
  <div class="flex justify-center bg-zinc-100" style="height: calc(var(--vh, 1dvh) * 100);">
    
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
        <router-view v-slot="{ Component }">
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
@import './assets/app.css'
</style>