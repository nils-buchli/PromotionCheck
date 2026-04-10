<template>
    <header
        class="sticky top-0 z-50 flex items-center justify-between h-[68px] px-5 bg-zinc-100 border-b border-zinc-200"
        style="-webkit-tap-highlight-color: transparent;"
    >
        <!-- Left: back + title -->
        <div class="flex items-center gap-1 min-w-0">
            <button
                v-if="canGoBack"
                @click="goBack()"
                class="flex items-center justify-center w-7 h-7 -ml-1 flex-shrink-0 text-zinc-900 active:opacity-45 transition-opacity"
                aria-label="Zurück"
            >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
            </button>
            <h1 class="text-[22px] font-bold text-zinc-900 tracking-tight leading-none truncate">
                {{ pageName }}
            </h1>
        </div>

        <!-- Right: actions -->
        <div v-if="showActions" class="flex items-center gap-[18px] flex-shrink-0">

            <!-- Delete toggle -->
            <button
                @click="removeElements"
                class="flex items-center justify-center w-6 h-6 transition-opacity active:opacity-45"
                :class="globalStatesStore.removingElements ? 'text-red-500' : 'text-zinc-900'"
            >
                <svg class="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
            </button>

            <!-- Dream grade -->
            <button
                v-if="route.name == 'grades'"
                @click="handleDreamGrade"
                class="flex items-center justify-center w-6 h-6 text-zinc-900 active:opacity-45 transition-opacity"
            >
                <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2"/>
                    <line x1="8" y1="6" x2="16" y2="6"/>
                    <line x1="8" y1="11" x2="9" y2="11"/>
                    <line x1="12" y1="11" x2="13" y2="11"/>
                    <line x1="16" y1="11" x2="17" y2="11"/>
                    <line x1="8" y1="15" x2="9" y2="15"/>
                    <line x1="12" y1="15" x2="13" y2="15"/>
                    <line x1="16" y1="15" x2="17" y2="15"/>
                    <line x1="8" y1="19" x2="9" y2="19"/>
                    <line x1="12" y1="19" x2="13" y2="19"/>
                    <line x1="16" y1="19" x2="17" y2="19"/>
                </svg>
            </button>

            <!-- Add -->
            <button
                @click="addElement"
                class="flex items-center justify-center w-6 h-6 text-zinc-900 active:opacity-45 transition-opacity"
            >
                <svg class="w-[19px] h-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            </button>

        </div>

        <DreamGradeIsland 
           :is-open="dreamGradeMode" 
           :element-id="route.params.subjectId"
           @close="dreamGradeMode = false"
        />

    </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useYearStore }         from '../stores/years'
import { useSubjectStore }      from '../stores/subjects'
import { useSubSubjectStore }   from '../stores/subsubjects'
import { useGlobalStatesStore } from '../stores/globalStates'
import DreamGradeIsland from './DreamGradeIsland.vue'

const route  = useRoute()
const router = useRouter()

const yearStore         = useYearStore()
const subjectStore      = useSubjectStore()
const subSubjectStore   = useSubSubjectStore()
const globalStatesStore = useGlobalStatesStore()

const dreamGradeMode = ref(false)

const showActions = computed(() => !(/add.*|user|analytics/.test(route.name)))
const canGoBack   = computed(() => route.name !== 'years' && route.name !== 'user' && route.name !== 'analytics')

const pageName = computed(() => {
    switch (route.name) {
        case 'years':       return 'YEARS'
        case 'subjects':    return yearStore.yearsById[route.params.yearId]?.name?.toUpperCase() ?? '–'
        case 'subSubjects': return subjectStore.subjectsById[route.params.subjectId]?.name?.toUpperCase() ?? '–'
        case 'grades': {
            const el = subjectStore.subjectsById[route.params.subjectId]
                    ?? subSubjectStore.subSubjectById[route.params.subjectId]
            return el?.name?.toUpperCase() ?? '–'
        }
        case 'addYear':       return 'ADD YEAR'
        case 'addSubject':    return 'ADD SUBJECT'
        case 'addSubSubject': return 'ADD SUB-SUBJECT'
        case 'addGrade':      return 'ADD GRADE'
        case 'user':          return 'PROFILE'
        case 'analytics':     return 'ANALYTICS'
        case 'privacyPolicy': return 'PRIVACY POLICY'
        default:              return '404'
    }
})

function addElement() {
    switch (route.name) {
        case 'years':       return router.push('/add-year')
        case 'subjects':    return router.push(`/add-subject/${route.params.yearId}`)
        case 'subSubjects': return router.push(`/add-sub-subject/${route.params.subjectId}`)
        case 'grades':      return router.push(`/add-grade/${route.params.subjectId}`)
        default:            return router.push('/')
    }
}

function removeElements() {
    globalStatesStore.removingElements = !globalStatesStore.removingElements
}

function handleDreamGrade() {
    dreamGradeMode.value = true
}

const routeParent = {
    'subjects':    () => '/',
    'subSubjects': () => {
        const id = subjectStore.subjectsById[route.params.subjectId]?.yearId
        return id ? `/subjects/${id}` : '/' 
    }, 
    'grades': () => {
        let id = subjectStore.subjectsById[route.params.subjectId]?.yearId
        if (id) return `/subjects/${id}`
        else {
            id = subSubjectStore.subSubjectById[route.params.subjectId]?.subjectId
            return id ? `/sub-subjects/${id}` : '/'
        }
    },
    'addYear':     () => '/',
    'addSubject':  () => `/subjects/${route.params.yearId}`,
    'addSubSubject': () => `/sub-subjects/${route.params.subjectId}`,
    'addGrade':    () => `/grades/${route.params.subjectId}`,
}

function goBack() {
    const parent = routeParent[route.name]
    if (parent) {
        router.push(parent())
    } else {
        router.push('/')
    }
}

</script>
    