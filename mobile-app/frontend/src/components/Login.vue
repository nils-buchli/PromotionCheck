<template>
    <div class="flex flex-col flex-1 bg-zinc-50 overflow-y-auto">

        <!-- Server error -->
        <div v-if="serverError" class="mt-6 mx-5">
            <div class="bg-red-50 rounded-2xl border border-red-200 px-4 py-3.5">
                <p class="text-[13px] text-red-500">{{ serverError }}</p>
            </div>
        </div>

        <div class="mx-5 mt-6">
            <button
                type="button"
                @click="$emit('back')"
                class="flex items-center gap-1.5 text-zinc-400 active:text-zinc-600 transition-colors"
                style="-webkit-tap-highlight-color: transparent;"
            >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                </svg>
                <span class="text-[13px] font-medium">Back</span>
            </button>
        </div>

        <!-- Username -->
        <div class="mt-6 mx-5">
            <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Username</p>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <input
                    v-model="username"
                    type="text"
                    autofocus
                    required
                    placeholder="Username"
                    @blur="touchedFields.username = true"
                    :class="[
                        'w-full px-4 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isUsernameInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isUsernameInvalid ? 'opacity-100' : 'opacity-0'"
            >
                Please enter your username.
            </p>
        </div>

        <!-- Password -->
        <div class="mt-2 mx-5">
            <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Passwort</p>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden flex items-center pr-4">
                <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    placeholder="Password"
                    @blur="touchedFields.password = true"
                    :class="[
                        'flex-1 px-4 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isPasswordInvalid ? 'text-red-500' : ''
                    ]"
                />
                <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="text-zinc-400 active:text-zinc-600 transition-colors"
                    style="-webkit-tap-highlight-color: transparent;"
                >
                    <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.965 9.965 0 012.212-3.592M6.53 6.53A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411M3 3l18 18" />
                    </svg>
                </button>
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isPasswordInvalid ? 'opacity-100' : 'opacity-0'"
            >
                Please enter your password. 
            </p>
        </div>

        <!-- Submit -->
        <div class="mx-5 mt-4">
            <button
                type="button"
                @click="submit"
                class="w-full bg-zinc-100 active:bg-zinc-200 text-zinc-700 text-[15px] font-medium rounded-2xl py-3.5 transition-colors duration-150 border border-zinc-200"
                style="-webkit-tap-highlight-color: transparent;"
            >
                Login
            </button>
        </div>

        <!-- Register-Link -->
        <p class="text-center text-[13px] text-zinc-400 mt-5">
            No account yet?
            <button
                type="button"
                @click="$emit('switch-to-register')"
                class="text-zinc-600 font-medium"
                style="-webkit-tap-highlight-color: transparent;"
            >
                Register
            </button>
        </p>

    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import { API_BASE } from '../config'

defineEmits(['switch-to-register', 'back']) 

const userStore = useUserStore()

const username     = ref('')
const password     = ref('')
const showPassword = ref(false)
const serverError  = ref('')

const touchedFields = ref({ username: false, password: false })

const isUsernameInvalid = computed(() =>
    touchedFields.value.username && !username.value.trim()
)

const isPasswordInvalid = computed(() =>
    touchedFields.value.password && !password.value.trim()
)

async function submit() {
    touchedFields.value.username = true
    touchedFields.value.password = true
    serverError.value = ''

    if (isUsernameInvalid.value || isPasswordInvalid.value) return

    const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username.value, password: password.value })
    })

    const loginData = await response.json()

    if (loginData.success) {
        localStorage.setItem('access_token', loginData.access_token)
        localStorage.setItem('device_id', loginData.device_id)
        await userStore.updateUser()
        window.location.reload()
    } else {
        switch (loginData.msg) {
            case 'noPasswordMatch':
                serverError.value = 'Wrong password.'
                break
            case 'userNotFound':
                serverError.value = 'Username doesn\'t exist.'
                break
            case 'inputInvalid':
                serverError.value = 'Invalid input.'
                break
            default:
                serverError.value = 'An error occured. Plase try again.'
        }
    }
}
</script>