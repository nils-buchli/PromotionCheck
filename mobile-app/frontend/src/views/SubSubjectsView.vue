<template>
    <ElementList element-type="subSubject" :addr-id="props.subjectId"/>
</template>

<script setup>    
    import ElementList from '../components/ElementList.vue'

    const props = defineProps({
        subjectId: {
            type: String, 
            required: true
        }
    })   
</script>
    
    
    
    