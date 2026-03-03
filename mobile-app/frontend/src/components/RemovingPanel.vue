<template>
  <transition name="fade">
    <div v-if="isActive" class="fixed left-4 bottom-24 z-50 opacity-85">
      <div class="bg-zinc-100 border border-zinc-200 shadow-sm rounded-2xl px-5 py-4 w-40">
        <p  class="text-s font-semibold tracking-wide text-zinc-900 mb-1">
          REMOVING
        </p>
        <p class="text-xs font-semibold  text-zinc-500 mb-2">
          Elements {{ elementCount }}
        </p>
        <button @click="remove" class="w-full rounded-xl bg-red-700 py-2 text-sm font-medium text-white active:bg-red-800 transition">
          Delete
        </button>

      </div>
    </div>
  </transition>
</template>

<script setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    
    import { useGlobalStatesStore } from '../stores/globalStates'
    import { useYearStore } from '../stores/years'
    import { useSubjectStore } from '../stores/subjects'
    import { useSubSubjectStore } from '../stores/subsubjects'
    import { useGradeStore } from '../stores/grades'

    const route = useRoute()

    const globalStatesStore = useGlobalStatesStore()
    const yearStore = useYearStore()
    const subjectStore = useSubjectStore()
    const subSubjectStore = useSubSubjectStore()
    const gradeStore = useGradeStore()

    const isActive = computed(() => globalStatesStore.removingElements)
    const elementCount = computed(() => globalStatesStore.removeCount)

    function remove(){
        globalStatesStore.removingElements = false
        
        switch(route.name) {
          case 'years': 
            yearStore.removeYearsById(globalStatesStore.removeIds)
            break
          case 'subjects': 
            subjectStore.removeSubjectsById(globalStatesStore.removeIds)
            break 
          case 'subSubjects': 
            subSubjectStore.removeSubSubjectsById(globalStatesStore.removeIds)
              break 
          case 'grades': 
            gradeStore.removeGradesByIds(globalStatesStore.removeIds)
            break
        }
    }
</script>

<style>
    .fade-enter-active,
    .fade-leave-active{
    transition: opacity .2s ease, transform .2s ease;
    }
    .fade-enter-from,
    .fade-leave-to{
    opacity:0;
    transform: translateY(10px);
    }
</style>
