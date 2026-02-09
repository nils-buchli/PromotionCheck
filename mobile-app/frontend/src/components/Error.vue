<template>
    <div class="flex-1 grid place-content-center">
            <h1 class="text-4xl font-bold">ERROR</h1>
            <p class="text-center">{{route.query.m}}</p>
            <button @click="backToHome()">Home</button>
    </div>  
</template>

<script setup>
    import { useRoute } from 'vue-router'
    import { useRouter } from 'vue-router'

    const route = useRoute()
    const router = useRouter()

    function backToHome() {
        router.replace('/')
    }

</script>