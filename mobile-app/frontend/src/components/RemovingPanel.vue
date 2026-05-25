<template>
    <Transition name="fade">
        <div v-if="isActive" class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
            <div class="bg-white border border-zinc-200 shadow-lg rounded-3xl px-5 py-4 w-64">

                <!-- Label -->
                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1 px-1">
                    Delete selection 
                </p>

                <!-- Anzahl -->
                <p class="text-[15px] font-semibold text-zinc-900 px-1 mb-4">
                    {{ elementCount }} {{ elementLabel }} selected
                </p>

                <!-- Buttons -->
                <div class="flex gap-2">
                    <button
                        @click="cancel"
                        class="flex-1 rounded-2xl border border-zinc-200 bg-zinc-100 active:bg-zinc-200 text-zinc-500 text-[14px] font-medium py-2.5 transition-colors duration-150"
                        style="-webkit-tap-highlight-color: transparent;"
                    >
                        Cancel
                    </button>
                    <button
                        @click="remove"
                        class="flex-1 rounded-2xl border border-red-200 bg-red-50 active:bg-red-100 text-red-600 text-[14px] font-medium py-2.5 transition-colors duration-150"
                        style="-webkit-tap-highlight-color: transparent;"
                    >
                        Delete
                    </button>
                </div>

            </div>
        </div>
    </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useGlobalStatesStore } from '../stores/globalStates'
import { useYearStore }         from '../stores/years'
import { useSubjectStore }      from '../stores/subjects'
import { useSubSubjectStore }   from '../stores/subsubjects'
import { useGradeStore }        from '../stores/grades'

const route = useRoute()

const globalStatesStore = useGlobalStatesStore()
const yearStore         = useYearStore()
const subjectStore      = useSubjectStore()
const subSubjectStore   = useSubSubjectStore()
const gradeStore        = useGradeStore()

const isActive     = computed(() => globalStatesStore.removingElements)
const elementCount = computed(() => globalStatesStore.removeCount)

const typeLabels = { years: 'Year', subjects: 'Subject', subSubjects: 'Sub-subject', grades: 'Grade' }
const typeLabelsPl = { years: 'Years', subjects: 'Subjects', subSubjects: 'Sub-subjects', grades: 'Grades' }

const elementLabel = computed(() => {
    const count = elementCount.value
    return count === 1
        ? (typeLabels[route.name]   ?? 'Element')
        : (typeLabelsPl[route.name] ?? 'Elemente')
})

function cancel() {
    globalStatesStore.removingElements = false
    globalStatesStore.removeIds = []
}

function remove() {
    globalStatesStore.removingElements = false

    switch (route.name) {
        case 'years':       yearStore.removeYearsById(globalStatesStore.removeIds);             break
        case 'subjects':    subjectStore.removeSubjectsById(globalStatesStore.removeIds);       break
        case 'subSubjects': subSubjectStore.removeSubSubjectsById(globalStatesStore.removeIds); break
        case 'grades':      gradeStore.removeGradesByIds(globalStatesStore.removeIds);          break
    }
}
</script>

<style scoped>
@import './../assets/RemovingPanel.css'
</style>