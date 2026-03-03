<template>
    <ElementList element-type="grade" :addr-id="props.subjectId"/>
</template>

<script setup>
    import { useRouter } from 'vue-router'
    import { computed } from 'vue'
    
    import { useGradeStore } from '../stores/grades'
    
    import ElementList from '../components/ElementList.vue'

    const router = useRouter()

    const gradeStore = useGradeStore()

    const props = defineProps({
        subjectId: {
            type: String, 
            required: true
        }
    })

    const storeHasId = computed(() => !Object.hasOwn(gradeStore.gradesBySubject, props.subjectId))

    if (!storeHasId) {
        router.push('/error?m="Invalid Subject Id."') 
    }
</script>
    
    
    
    