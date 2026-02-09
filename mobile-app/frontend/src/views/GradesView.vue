<template>
    <ElementList element-type="grade" :addr-id="addrId"/>
</template>

<script setup>
    import ElementList from '../components/ElementList.vue'

    const props = defineProps({
        subjectId: {
            type: String, 
            required: true
        }
    })

    const addrId = props.subjectId
</script>
    
    
    
    