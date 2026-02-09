<template>
    <main class="mt-auto" >
        <div v-for="element in elements":key="element.id" >
            <ListElement :element="element" />
        </div>
    </main>
</template>

<script setup>
    import { computed } from 'vue'
    
    import { useYearStore } from '../stores/years'  
    import { useSubjectStore } from '../stores/subjects'
    import { useGradeStore } from '../stores/grades'
    
    import ListElement from './ListElement.vue'

    const yearStore = useYearStore()
    const subjectStore = useSubjectStore()
    const gradeStore = useGradeStore()
    
    const props = defineProps({
        elementType: {
            type: String, 
            required: true
        }, 
        addrId: {
            type: String, 
            default: null
        }
    })

    const elements = computed(() => {
        switch(props.elementType) {
        case "year":
            return yearStore.years
        case "subject": 
            return subjectStore.subjectsByYear[props.addrId]
        case "grade": 
            return gradeStore.gradesBySubject[props.addrId]
        }
    })

</script>