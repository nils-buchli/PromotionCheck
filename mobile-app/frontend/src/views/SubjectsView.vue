<template>
    <ElementList element-type="subject" :addr-id="addrId"/>
</template>

<script setup>
    import ElementList from '../components/ElementList.vue'

    const props = defineProps({
        yearId: {
            type: String, 
            required: true
        }
    })

    const addrId = props.yearId
</script>
    
    
    
    