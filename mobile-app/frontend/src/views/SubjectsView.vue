<template>
    <ElementList element-type="subject" :addr-id="props.yearId"/>
</template>

<script setup>
    import ElementList from '../components/ElementList.vue'

    const props = defineProps({
        yearId: {
            type: String, 
            required: true
        }
    })
</script>
    
    
    
    