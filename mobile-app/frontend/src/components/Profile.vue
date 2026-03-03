<template>
    <div class="flex flex-1 items-start justify-center bg-zinc-50">
        <div class="w-full max-w-sm bg-zinc-100 rounded-2xl p-6 m-10 shadow-sm border border-zinc-200 space-y-4">
            <h2 class="text-lg font-semibold text-zinc-900 mb-4">Profil</h2>
            
            <div class="space-y-2">
                <p class="text-sm text-zinc-600">Username</p>
                <p class="text-base font-medium text-zinc-900">{{ username }}</p>
            </div>
            
            <button @click="logout" class="w-full rounded-xl bg-red-700 py-2 text-sm font-medium text-white active:bg-red-600 transition">Logout</button>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue'

    import { useUserStore } from '../stores/userStore'

    const userStore = useUserStore()
    
    const username = computed(() => {
        if (userStore.isLoggedIn) {
            return userStore.user.name
        } 
        return ''
    })

    const logout = () => {
        userStore.clearUser()
        
        localStorage.removeItem('access_token')
        window.location.reload()
    }
</script>