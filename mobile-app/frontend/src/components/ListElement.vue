<template>
    <div @click="onClick()" class="block w-full">
        <div class="w-full h-20 flex items-center bg-white border-b border-zinc-200">
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
</template>


<script setup>
    import { ref, computed, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    
    import { useYearStore } from '../stores/years'
    import { useSubjectStore } from '../stores/subjects'
    import { useSubSubjectStore } from '../stores/subsubjects'
    import { useGradeStore } from '../stores/grades'
    import { useGlobalStatesStore } from '../stores/globalStates'

    const route = useRoute()
    const router = useRouter()

    const globalStatesStore = useGlobalStatesStore()
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

    const removeToggle = ref(false)

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
    }
    
    )
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
        if (globalStatesStore.removingElements) {
            removeToggle.value = !removeToggle.value
            globalStatesStore.toggleRemoveById(props.element.id) 
        } else {
            router.push(navTo.value)
        }    
    }

</script>