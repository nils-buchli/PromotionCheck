<template>
  <div class="flex justify-center bg-zinc-100" style="height: calc(var(--vh, 1dvh) * 100);">
    <div class="relative w-full max-w-md flex flex-col bg-white shadow-xl" style="height: calc(var(--vh, 1dvh) * 100);">
      
      <AppBar />

      <main class="flex-1 min-h-0 flex overflow-hidden">
        <router-view v-slot="{ Component }">
          <component :is="Component" class="flex-1 min-h-0" />
        </router-view>
      </main>

      <BottomBar />

      <RemovingPanel />

    </div>
  </div>
</template>
<script setup>

  import { watch, onMounted } from 'vue'

  import db from './services/db'
  import AppBar from './components/AppBar.vue'
  import BottomBar from './components/BottomBar.vue'
  import RemovingPanel from './components/RemovingPanel.vue';
  import { useGlobalStatesStore } from './stores/globalStates'

  const globalStatesStore = useGlobalStatesStore()

  watch(() => globalStatesStore.removingElements, (v) => {
    globalStatesStore.clearRemove()
  })


</script>