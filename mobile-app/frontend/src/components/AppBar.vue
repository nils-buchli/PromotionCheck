<template>
    <header class="sticky top-0 z-50 h-20 bg-zinc-100 border-b flex items-center px-4 justify-itmes-start justify-between">
        <span class="font-semibold text-xl font-sans">{{ pageName }}</span>
        <div v-if="showActions" class="flex gap-3">
            <button class="p-1 flex items-center justify-center bg-transparent rounded-full transition-colors active:bg-zinc-200" @click="addEelement()">      
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#1f1f1f"><path d="M440-120v-320H120v-80h320v-320h80v320h320v80H520v320h-80Z"/></svg>
            </button>
            <button class="p-1 flex items-center justify-center bg-transparent rounded-full transition-colors active:bg-zinc-200" @click="removeElements()">      
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#1f1f1f"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
            </button>
        </div>
    </header>
</template>

<script setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { useRouter } from 'vue-router'

    import { useYearStore } from '../stores/years'
    import { useSubjectStore } from '../stores/subjects'
    import { useSubSubjectStore } from '../stores/subsubjects'
    import { useGlobalStatesStore } from '../stores/globalStates'

    const route = useRoute()
    const router = useRouter()

    const yearStore = useYearStore()
    const subjectStore = useSubjectStore()
    const subSubjectStore = useSubSubjectStore()
    const globalStatesStore = useGlobalStatesStore()

    const showActions = computed(() => !(/add.*|user/.test(route.name)))
    const pageName = computed(() => {
        switch (route.name) {
            case 'years': 
                return 'YEARS'
            case 'subjects': 
                return computed(() => yearStore.yearsById[route.params.yearId].name.toUpperCase())
            case 'subSubjects': 
                return computed(() => subjectStore.subjectsById[route.params.subjectId].name.toUpperCase())
            case 'grades': 
                return computed(() => {
                    const element = subjectStore.subjectsById[route.params.subjectId] ?? subSubjectStore.subSubjectById[route.params.subjectId]
                    return element.name.toUpperCase()
                })
            case 'addYear': 
                return 'ADD YEAR'
            case 'addSubject': 
                return 'ADD SUBJECT'
            case 'addSubSubject': 
                return 'ADD SUB-SUBJECT'
            case 'addGrade': 
                return 'ADD GRADE'
            case 'user': 
                return 'PROFILE '
            default: 
                return '404'
        }
    })

    function addEelement() {
        switch (route.name) {
            case 'years': 
                router.push('/add-year')
                break 

            case 'subjects': 
                router.push(`/add-subject/${route.params.yearId}`)
                break 
            
            case 'subSubjects': 
                router.push(`/add-sub-subject/${route.params.subjectId}`)
                break
            
            case 'grades': 
                router.push(`/add-grade/${route.params.subjectId}`)
                break
            
            default : 
                router.push('/')
                break
            }
    }

    function removeElements() {
        globalStatesStore.removingElements = ! globalStatesStore.removingElements
    }
    

</script>