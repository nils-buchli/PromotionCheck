<template>
    <div class="relative group">
        <div 
            ref="elementRef"
            @click="onClick()" 
            @mousedown="startLongPress"
            @mouseup="endLongPress"
            @mouseleave="cancelLongPress"
            @touchstart="startLongPress"
            @touchend="endLongPress"
            class="block w-full cursor-pointer"
        >
            <div class="w-full h-20 flex items-center bg-white border-b border-zinc-200 transition-colors duration-200" :class="showActions ? 'bg-zinc-50' : ''">
                <div class="h-full w-full flex items-center px-4 transition-all duration-200" :class="isIrelevant ? 'opacity-40 bg-zinc-100' : ''">         
                    <div class="flex-1 pr-4">
                        <p class="text-lg font-semibold text-zinc-900" :class="removeToggle ? 'line-through' : ''">{{ props.element.name }}</p>
                        <p v-if="hasDate" class="text-xs text-zinc-500">{{ props.element.date }}</p>
                        <p v-if="hasSubElement" class="text-xs text-zinc-500">{{ elementCount }} {{ elementCount != 1 ? subElementName + 's' : subElementName }}</p>
                    </div>
                    <div class="grid grid-cols-2 grid-rows-2 items-center gap-1 pt-2 text-sm text-zinc-600">
                        <div v-if="hasWeight" class="flex items-center gap-1">                        
                            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#1f1f1f"><path d="m296-224-56-56 240-240 240 240-56 56-184-183-184 183Zm0-240-56-56 240-240 240 240-56 56-184-183-184 183Z"/></svg>
                            <span>{{ props.element.weight }}</span>
                        </div>
                        <div v-if="hasPlusPoints" class="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#1f1f1f"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>
                            <span>{{ plusPoints }}</span>
                        </div>
                        <div v-if="hasTeacher" class="col-span-2 flex items-center gap-1">                             
                            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#1f1f1f"><path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z"/></svg>
                            <span>Hägi</span>
                        </div>
                    </div>
                    <div class="flex-1 text-right">
                        <p class="text-lg font-semibold text-zinc-900">{{ data == '-' ? '-' : Math.round(data * 100) / 100 }}</p>
                        <p class="text-xs text-zinc-500">{{ dataLabel }}</p>
                    </div>
                </div>
            </div>
        </div>

        <transition name="fade">
            <div 
                v-if="showActions"
                @click="closeActions"
                class="fixed inset-0 z-40 bg-black/0"
            />
        </transition>

        <Teleport to="body" v-if="showActions">
            <transition name="popup">
                <div 
                    class="fixed z-50 px-1.5 py-1.5 bg-white rounded-full shadow-md border border-zinc-200/80 flex gap-0.5"
                    :style="{
                        top: islandTop + 'px',
                        left: islandLeft + 'px',
                        transform: 'translate(-50%, -100%)',
                        backdropFilter: 'blur(4px)'
                    }"
                    @click.stop
                >
                    <button
                        @click="handleEdit"
                        class="py-1 px-1.5 rounded-full hover:bg-zinc-100 transition-colors duration-150 text-zinc-600 hover:text-zinc-900"
                    >
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                            <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>

                    <button
                        @click="handleDelete"
                        class="py-1 px-1.5 rounded-full hover:bg-zinc-100 transition-colors duration-150 text-zinc-600 hover:text-zinc-900"
                    >
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/>
                        </svg>
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
    
    import { useYearStore } from '../stores/years'
    import { useSubjectStore } from '../stores/subjects'
    import { useSubSubjectStore } from '../stores/subsubjects'
    import { useGradeStore } from '../stores/grades'
    import { useGlobalStatesStore } from '../stores/globalStates'

    import EditIsland from './EditIsland.vue'

    const route = useRoute()
    const router = useRouter()

    const globalStatesStore = useGlobalStatesStore()
    const yearStore = useYearStore()
    const subjectStore = useSubjectStore()
    const subSubjectStore = useSubSubjectStore()
    const gradeStore = useGradeStore()

    const props = defineProps({
        element: {
            type: Object, 
            required: true
        }, 
        isSelected: {
            type: Boolean, 
            default: false
        }
    })
    const emit = defineEmits(['edit', 'delete', 'click'])

    const removeToggle = ref(false)
    const elementRef = ref(null)
    const islandTop = ref(0)
    const islandLeft = ref(0)
    const editMode = ref(false)
    
    const longPressTimer = ref(null)
    const showActions = ref(false)
    const LONG_PRESS_DURATION = 500

    watch(() => showActions.value, (newVal) => {
        if (newVal && elementRef.value) {
            const rect = elementRef.value.getBoundingClientRect()
            islandTop.value = rect.bottom + rect.height / 3
            islandLeft.value = rect.left + rect.width / 1.15
        }
    })

    watch(() => globalStatesStore.removingElements, (value) => {
        removeToggle.value = false
    })

    const elementCount = computed(() => {
        switch(route.name) {
            case 'years': 
                return subjectStore.elementCountByYear?.[props.element.id] ?? 0
            default: 
                if (subjectStore.subjectsById[props.element.id]?.hasSubSubject) {
                    return subSubjectStore.elementCountBySubject?.[props.element.id] ?? 0
                } else {
                    return gradeStore.elementCountBySubject?.[props.element.id] ?? 0
                }       
        }
    })
    
    const hasSubSubject = computed(() => {
        if (!subjectStore.subjectsById?.[props.element.id]) return false
        return route.name == 'subjects' && subjectStore.subjectsById?.[props.element.id].hasSubSubject
    })

    let hasWeight = computed(() => 'years' != route.name)
    let hasTeacher = computed(() => 'subjects' == route.name)
    let hasSubElement = computed(() => 'grades' != route.name)
    let hasPlusPoints = computed(() => 'grades' != route.name)
    let hasDate = computed(() => 'grades' == route.name)
    let data = computed(() => {
        switch(route.name) {
            case 'years': 
                return subjectStore.averageByYear?.[props.element.id] ?? '-'
            case 'subjects': 
                return hasSubSubject.value ? 
                    subSubjectStore.averageBySubject?.[props.element.id] ?? '-': 
                    gradeStore.averageBySubject?.[props.element.id] ?? '-'
            case 'subSubjects': 
                return gradeStore.averageBySubject?.[props.element.id] ?? '-'
            default:  
                return gradeStore.gradesById?.[props.element.id] ?? '-'
        }
    })
    let dataLabel = computed(() => 'grades' == route.name ? 'Mark' : 'Average')
    let subElementName = computed(() => {
        switch(route.name) {
            case 'subjects': 
                return hasSubSubject.value ? 'Sub-subject' : 'Grade'
            case 'subSubjects': 
                return 'Grade'
            default: 
                return 'Subject'
        }
    })
    let plusPoints = computed(() => {
        switch(route.name) {
            case 'grades' : 
                break 
            case 'years' : 
                return subjectStore.getPlusPointsByYear()?.[props.element.id] ?? '-'
            default : 
                return gradeStore.getPlusPointsBySubject()?.[props.element.id] ?? '-'
        }
    })
    let navTo = computed(() => {
        switch (route.name) {
            case 'years': 
                return {name: 'subjects', params: {yearId: props.element.id}}
            case 'subjects' : 
                return hasSubSubject.value ? 
                    {name: 'subSubjects', params: {subjectId: props.element.id}}: 
                    {name: 'grades', params: {subjectId: props.element.id}}
            case'subSubjects': 
                return {name: 'grades', params: {subjectId: props.element.id}}
            default: 
                return route 
        }
    })
    let isIrelevant = computed(() => globalStatesStore.removingElements && !removeToggle.value)

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
        longPressTimer.value = setTimeout(() => {
            showActions.value = true
        }, LONG_PRESS_DURATION)
    }   

    function endLongPress() {
        if (longPressTimer.value) {
            clearTimeout(longPressTimer.value)
        }
    }

    function cancelLongPress() {
        if (longPressTimer.value) {
            clearTimeout(longPressTimer.value)
        }
    }

    function closeActions() {
        showActions.value = false
    }

    function handleEdit() {
        emit('edit', props.element)

        editMode.value = true
        closeActions()
    }

    function handleDelete() {
        emit('delete', props.element)

        switch(route.name) {
            case 'years': 
                yearStore.removeYearsById(new Set([props.element.id]))
                break
            case 'subjects': 
                subjectStore.removeSubjectsById(new Set([props.element.id]))
                break
            case 'subSubjects': 
                subSubjectStore.removeSubSubjectsById(new Set([props.element.id]))
                break 
            case 'grades': 
                gradeStore.removeGradesByIds(new Set([props.element.id]))
                break
        }

        closeActions()
    }

    function saveEdit(data) {
        switch (route.name) {
            case 'years': 
                if (data.name) yearStore.editYearById(props.element.id, {name: data.name})
                break
            case 'subjects': 
                if (data.name && data.weight) subjectStore.editSubjectById(props.element.id, {name: data.name, weight: data.weight})
                break
            case 'subSubjects': 
                if (data.name && data.weight) subSubjectStore.editSubSubjectById(props.element.id, {name: data.name, weight: data.weight})
                break 
            case 'grades': 
                if (data.name && data.mark && data.weight && data.date) gradeStore.editGradeById(props.element.id, data)
                break
        }     

        closeActions()
    }

</script>

<style scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 200ms ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }

    .popup-enter-active {
        transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .popup-leave-active {
        transition: all 150ms ease-out;
    }

    .popup-enter-from {
        opacity: 0;
        transform: translate(-50%, -100%) scale(0.9);
    }

    .popup-leave-to {
        opacity: 0;
        transform: translate(-50%, -100%) scale(0.9);
    }
</style>