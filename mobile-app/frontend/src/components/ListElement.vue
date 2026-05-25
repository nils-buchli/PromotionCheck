<template>
    <div class="relative">

        <div
            ref="elementRef"
            @click="onClick()"
            @mousedown="startLongPress"
            @mouseup="endLongPress"
            @mouseleave="cancelLongPress"
            @touchstart.passive="startLongPress"
            @touchend="endLongPress"
            class="block w-full cursor-pointer select-none bg-white active:bg-zinc-50 transition-colors duration-150"
            :class="{ 'bg-zinc-50': showActions }"
            style="-webkit-tap-highlight-color: transparent;"
        >
            <div
                class="flex items-center gap-3 px-5 py-3.5 transition-opacity duration-200"
                :class="isIrelevant ? 'opacity-30' : 'opacity-100'"
            >
                <!-- Left: Name + Meta -->
                <div class="flex-1 min-w-0">
                    <span
                        class="block text-[15px] font-semibold text-zinc-900 tracking-tight truncate leading-snug"
                        :class="removeToggle ? 'line-through text-zinc-400' : ''"
                    >
                        {{ props.element.name }}
                    </span>

                    <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span v-if="hasDate" class="text-[11px] text-zinc-400">{{ props.element.date }}</span>

                        <template v-if="hasDate && (hasSubElement || hasTeacher || hasWeight)">
                            <span class="text-[11px] text-zinc-300">·</span>
                        </template>

                        <span v-if="hasSubElement" class="text-[11px] text-zinc-400">
                            {{ elementCount }}&thinsp;{{ elementCount !== 1 ? subElementName + 's' : subElementName }}
                        </span>

                        <template v-if="hasSubElement && (hasTeacher || hasWeight)">
                            <span class="text-[11px] text-zinc-300">·</span>
                        </template>

                        <span
                            v-if="hasWeight"
                            class="inline-flex items-center text-[11px] font-semibold text-zinc-600 bg-zinc-100 rounded px-1.5 py-px tracking-wide"
                        >
                            {{ props.element.weight }}×
                        </span>
                    </div>
                </div>

                <!-- Right: Plus · Score · Trend -->
                <div class="flex items-center gap-2.5 flex-shrink-0">
                    <span
                        v-if="hasPlusPoints && plusPoints !== '-' && settingsStore.showPluspoints"
                        class="text-[11px] font-semibold  tracking-wide"
                        :class="{
                            'text-emerald-500': plusPoints > (route.name == 'years' ? settingsStore.coloring.yearMax : settingsStore.coloring.subjectMax), 
                            'text-orange-500': plusPoints >= (route.name == 'years' ? settingsStore.coloring.yearMin : settingsStore.coloring.subjectMin) && plusPoints <= (route.name == 'years' ? settingsStore.coloring.yearMax : settingsStore.coloring.subjectMax), 
                            'text-red-500': plusPoints < (route.name == 'years' ? settingsStore.coloring.yearMin : settingsStore.coloring.subjectMin) 
                        }"
                    >
                        {{plusPoints < 0 ? '-' : '+'}}{{ Math.abs(plusPoints) }}
                    </span>

                    <div class="flex flex-col items-end">
                        <span class="text-[15px] font-semibold text-zinc-700 leading-none tracking-tight tabular-nums">
                            {{ data === '-' ? '–' : (settingsStore.round(data)) }}
                        </span>
                        <span class="text-[9px] font-medium text-zinc-400 uppercase tracking-widest mt-0.5">
                            {{ dataLabel }}
                        </span>
                    </div>
                    <svg
                        v-if="improvement != null"
                        class="w-3.5 h-3.5 flex-shrink-0"
                        :class="{
                            'text-emerald-500': improvement === 1,
                            'text-red-500': improvement === -1,
                            'text-gray-400': improvement === 0
                        }"
                        viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.8"
                        stroke-linecap="round" stroke-linejoin="round"
                    >
                        <polyline v-if="improvement === 1"  points="18 15 12 9 6 15"/>
                        <polyline v-else-if="improvement === -1" points="6 9 12 15 18 9"/>
                        <line    v-else x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    <div v-else v-if="route.name == 'subjects'" class="w-3.5 h-3.5 flex-shrink-0" />
                </div>
            </div>

            <div class="h-px bg-zinc-100 mx-5" />
        </div>

        <!-- Backdrop -->
        <transition name="fade">
            <div
                v-if="showActions"
                @click="closeActions"
                class="fixed inset-0 z-40"
            />
        </transition>

        <!-- Action Pill -->
        <Teleport to="body" v-if="showActions">
            <transition name="popup">
                <div
                    class="action-pill"
                    :style="{ top: islandTop + 'px', left: islandLeft + 'px' }"
                    @click.stop
                >
                    <!-- Edit -->
                    <button @click="handleEdit" class="action-btn">
                        <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <span>Edit</span>
                    </button>

                    <div class="w-px h-5 bg-zinc-200 flex-shrink-0" />

                    <!-- Delete -->
                    <button @click="handleDelete" class="action-btn action-btn--danger">
                        <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/>
                            <path d="M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                        <span>Delete</span>
                    </button>
                </div>
            </transition>
        </Teleport>

        <EditIsland
            :is-open="editMode"
            :element="props.element"
            :element-type="elementType"
            @close="editMode = false"
            @save="saveEdit"
        />
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useYearStore }         from '../stores/years'
import { useSubjectStore }      from '../stores/subjects'
import { useSubSubjectStore }   from '../stores/subsubjects'
import { useGradeStore }        from '../stores/grades'
import { useGlobalStatesStore } from '../stores/globalStates'
import { useAnalyticsStore }    from '../stores/analytics'
import { useSettingsStore } from '../stores/settings'


import EditIsland from './EditIsland.vue'
import DreamGradeIsland from './DreamGradeIsland.vue'

const route  = useRoute()
const router = useRouter()

const globalStatesStore = useGlobalStatesStore()
const yearStore         = useYearStore()
const subjectStore      = useSubjectStore()
const subSubjectStore   = useSubSubjectStore()
const gradeStore        = useGradeStore()
const analyticsStore    = useAnalyticsStore()
const settingsStore     = useSettingsStore()

const props = defineProps({
    element:    { type: Object,  required: true },
    isSelected: { type: Boolean, default: false },
})
const emit = defineEmits(['edit', 'delete', 'click'])

const removeToggle   = ref(false)
const elementRef     = ref(null)
const islandTop      = ref(0)
const islandLeft     = ref(0)
const editMode       = ref(false)
const longPressTimer = ref(null)
const showActions    = ref(false)
const LONG_PRESS_DURATION = 480

watch(() => showActions.value, (val) => {
    if (val && elementRef.value) {
        const rect = elementRef.value.getBoundingClientRect()
        // Center the pill horizontally over the element, just above it
        islandTop.value  = rect.top - 8
        islandLeft.value = rect.left + rect.width / 2
    }
})

watch(() => globalStatesStore.removingElements, () => {
    removeToggle.value = false
})

const elementCount = computed(() => {
    if (route.name === 'years') return subjectStore.elementCountByYear?.[props.element.id] ?? 0
    if (subjectStore.subjectsById[props.element.id]?.hasSubSubject)
        return subSubjectStore.elementCountBySubject?.[props.element.id] ?? 0
    return gradeStore.elementCountBySubject?.[props.element.id] ?? 0
})

const hasSubSubject = computed(() =>
    route.name === 'subjects' && !!subjectStore.subjectsById?.[props.element.id]?.hasSubSubject
)

const hasWeight     = computed(() => route.name !== 'years')
const hasTeacher    = computed(() => route.name === 'subjects')
const hasSubElement = computed(() => route.name !== 'grades')
const hasPlusPoints = computed(() => route.name !== 'grades')
const hasDate       = computed(() => route.name === 'grades')

const data = computed(() => {
    switch (route.name) {
        case 'years':       return subjectStore.averageByYear?.[props.element.id] ?? '-'
        case 'subjects':    return hasSubSubject.value
            ? subSubjectStore.averageBySubject?.[props.element.id] ?? '-'
            : gradeStore.averageBySubject?.[props.element.id] ?? '-'
        case 'subSubjects': return gradeStore.averageBySubject?.[props.element.id] ?? '-'
        default:            return gradeStore.gradesById?.[props.element.id] ?? '-'
    }
})

const dataLabel = computed(() => route.name === 'grades' ? 'Mark' : 'Average')

const subElementName = computed(() => {
    switch (route.name) {
        case 'subjects':    return hasSubSubject.value ? 'Sub-subject' : 'Grade'
        case 'subSubjects': return 'Grade'
        default:            return 'Subject'
    }
})

const plusPoints = computed(() => {
    if (route.name === 'grades') return '-'
    if (route.name === 'years')  return subjectStore.getPlusPointsByYear()?.[props.element.id] ?? '-'
    return gradeStore.getPlusPointsBySubject()?.[props.element.id] ?? '-'
})

const navTo = computed(() => {
    switch (route.name) {
        case 'years':       return { name: 'subjects',    params: { yearId:    props.element.id } }
        case 'subjects':    return hasSubSubject.value
            ? { name: 'subSubjects', params: { subjectId: props.element.id } }
            : { name: 'grades',      params: { subjectId: props.element.id } }
        case 'subSubjects': return { name: 'grades',      params: { subjectId: props.element.id } }
        default:            return route
    }
})

const isIrelevant = computed(() => globalStatesStore.removingElements && !removeToggle.value)

const improvement = computed(() => {
    if (route.name != 'subjects' && route.name != 'subSubjects') return null
    if (route.name == 'subjects') if (props.element.hasSubSubject) return null 
    
    const m = analyticsStore.gradeLRSlopesBySubject[props.element.id]
    
    if ( !m || m > -0.05 && m < 0.05 ) return 0 
    else if ( m < 0 ) return -1 
    else return 1
})

function onClick() {
    emit('click', props.element)
    if (globalStatesStore.removingElements) {
        removeToggle.value = !removeToggle.value
        globalStatesStore.toggleRemoveById(props.element.id)
    } else {
        router.push(navTo.value)
    }
}

function startLongPress() {
    longPressTimer.value = setTimeout(() => { showActions.value = true }, LONG_PRESS_DURATION)
}
function endLongPress()    { clearTimeout(longPressTimer.value) }
function cancelLongPress() { clearTimeout(longPressTimer.value) }
function closeActions()    { showActions.value = false }

function handleEdit() {
    emit('edit', props.element)
    editMode.value = true
    closeActions()
}

function handleDelete() {
    emit('delete', props.element)
    const map = {
        years:       () => yearStore.removeYearsById(new Set([props.element.id])),
        subjects:    () => subjectStore.removeSubjectsById(new Set([props.element.id])),
        subSubjects: () => subSubjectStore.removeSubSubjectsById(new Set([props.element.id])),
        grades:      () => gradeStore.removeGradesByIds(new Set([props.element.id])),
    }
    map[route.name]?.()
    closeActions()
}

function saveEdit(data) {
    switch (route.name) {
        case 'years':
            if (data.name) yearStore.editYearById(props.element.id, { name: data.name }); break
        case 'subjects':
            if (data.name && data.weight !== '') subjectStore.editSubjectById(props.element.id, { name: data.name, weight: data.weight }); break
        case 'subSubjects':
            if (data.name && data.weight !== '') subSubjectStore.editSubSubjectById(props.element.id, { name: data.name, weight: data.weight }); break
        case 'grades':
            if (data.name && data.mark && data.weight !== '' && data.date) gradeStore.editGradeById(props.element.id, data); break
    }
    closeActions()
}
</script>

<style scoped>
@import './../assets/ListElement.css';
</style>
