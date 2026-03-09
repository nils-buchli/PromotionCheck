<template>
    <div class="flex flex-1 items-start justify-center bg-zinc-50">
        <form novalidate @submit.prevent="submit" class="w-full max-w-sm bg-zinc-100 rounded-2xl p-6 m-10 shadow-sm border border-zinc-200 space-y-4">
            <h2 class="text-lg font-semibold text-zinc-900 mb-4">Login</h2>
            
            <div v-if="error" class="rounded-xl bg-red-100 border border-red-400 p-3">
                <p class="text-sm text-red-700">{{ error }}</p>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-zinc-900 mb-1">Username</label>
                <input 
                    type="text"
                    v-model="username" 
                    autofocus
                    required
                    placeholder="Michi" 
                    class="w-full rounded-xl border bg-zinc-100 px-4 py-2 text-sm focus:outline-none focus:border-transparent placeholder:text-zinc-700 text-zinc-900 border-zinc-400 focus:ring-2 focus:ring-zinc-700"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-zinc-900 mb-1">Passwort</label>
                <input 
                    type="password" 
                    v-model="password"
                    required
                    placeholder="••••••••" 
                    class="w-full rounded-xl border bg-zinc-100 px-4 py-2 text-sm focus:outline-none focus:border-transparent placeholder:text-zinc-700 text-zinc-900 border-zinc-400 focus:ring-2 focus:ring-zinc-700"
                />
            </div>
            <button type="submit" class="w-full rounded-xl bg-zinc-900 py-2 text-sm font-medium text-white active:bg-zinc-700 transition">Login</button>
            
            <p class="text-center text-sm text-zinc-600">
                Don't have an account? 
                <button type="button" @click="$emit('switch-to-register')" class="text-zinc-900 font-medium hover:underline">Register</button>
            </p>
        </form>
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { useUserStore } from '../stores/userStore'

    const userStore = useUserStore()
    
    const username = ref('')
    const password = ref('')
    const error = ref('')

    const isUsernameInvalid = computed(() => !username.value.trim())
    const isPasswordInvalid = computed(() => !password.value.trim())

    async function submit() {
        error.value = ''
        
        if (isUsernameInvalid.value || isPasswordInvalid.value) return  

        const payload = {name: username.value, password: password.value}
        
        const response = await fetch('/api/login', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(payload)
        })
        
        const loginData = await response.json()
        if (loginData.success) {
            await userStore.updateUser()
            localStorage.setItem('access_token', loginData.access_token)
            localStorage.setItem('device_id', loginData.device_id)
            window.location.reload()
        } else {
            switch (loginData.msg) {
                case 'noPasswordMatch':
                    error.value = 'Password wrong.'
                    break 
                case 'userNotFound': 
                    error.value = 'This username does not exist.'
                    break
                case 'inputInvalid': 
                    error.value = 'The provided input is invalid.'
                    break
                default: 
                    error.value = 'An error occured.'
            }
        }
    }
</script>