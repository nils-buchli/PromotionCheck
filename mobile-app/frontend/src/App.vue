<template>
  <div class="h-screen flex flex-col">
    <AppBar />

    <main class="flex-1 min-h-0 flex overflow-y-auto">
      <router-view v-slot="{ Component }">
        <component :is="Component" class="flex-1 min-h-0" />
      </router-view>
    </main>

    <BottomBar />

    <RemovingPanel />
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