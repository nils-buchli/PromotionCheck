<template>
    <div class="flex flex-1">
        <RegisterComponent v-if="currentView === 'register'" @switch-to-login="method = 'login'" />
        <LoginComponent v-else-if="currentView === 'login'" @switch-to-register="method = 'register'" />
        <ProfileComponent v-else />
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue'
    
    import RegisterComponent from './../components/Register.vue'
    import LoginComponent from './../components/Login.vue'
    import ProfileComponent from './../components/Profile.vue'
    import { useUserStore } from '../stores/userStore'
    
    const userStore = useUserStore()

    const method = ref('login')
    
    const currentView = computed(() => {
        if (userStore.isLoggedIn) {
            return 'profile'
        } else {
            return method.value
        }
    })

</script>