<template>
    <div class="flex flex-col flex-1 bg-zinc-50 overflow-y-auto">

        <!-- Server error -->
        <div v-if="serverError" class="mt-6 mx-5">
            <div class="bg-red-50 rounded-2xl border border-red-200 px-4 py-3.5" role="alert">
                <p class="text-[13px] text-red-500">{{ serverError }}</p>
            </div>
        </div>

        <div class="mx-5 mt-6">
            <button
                type="button"
                @click="$emit('back')"
                class="flex items-center gap-1.5 text-zinc-400 active:text-zinc-600 transition-colors min-h-[44px]"
            >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                </svg>
                <span class="text-[13px] font-medium">Back</span>
            </button>
        </div>

        <!-- Username -->
        <div class="mt-6 mx-5">
            <label for="login-username" class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1 block">Username</label>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden focus-within:border-zinc-400 transition-colors">
                <input
                    id="login-username"
                    v-model="username"
                    type="text"
                    inputmode="text"
                    autocomplete="username"
                    autofocus
                    required
                    placeholder="Username"
                    @blur="touchedFields.username = true"
                    :class="[
                        'w-full px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isUsernameInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isUsernameInvalid ? 'opacity-100' : 'opacity-0'"
                role="alert"
            >
                Please enter your username.
            </p>
        </div>

        <!-- Password -->
        <div class="mt-2 mx-5">
            <label for="login-password" class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1 block">Password</label>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden focus-within:border-zinc-400 transition-colors flex items-center">
                <input
                    id="login-password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    required
                    placeholder="Password"
                    @blur="touchedFields.password = true"
                    :class="[
                        'flex-1 px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isPasswordInvalid ? 'text-red-500' : ''
                    ]"
                />
                <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="flex items-center justify-center w-11 h-11 mr-1 text-zinc-400 active:text-zinc-600 transition-colors flex-shrink-0"
                    aria-label="Toggle password visibility"
                >
                    <svg v-if="!showPassword" class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                </button>
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isPasswordInvalid ? 'opacity-100' : 'opacity-0'"
                role="alert"
            >
                Please enter your password.
            </p>
        </div>

        <!-- Submit -->
        <div class="mx-5 mt-4">
            <button
                type="button"
                @click="submit"
                :disabled="submitting"
                class="w-full bg-primary active:bg-primary-dark disabled:opacity-50 text-white text-[15px] font-medium rounded-2xl py-3.5 transition-colors duration-150"
            >
                {{ submitting ? 'Logging in...' : 'Login' }}
            </button>
        </div>

        <!-- Register-Link -->
        <p class="text-center text-[13px] text-zinc-400 mt-5">
            No account yet?
            <button
                type="button"
                @click="$emit('switch-to-register')"
                class="text-primary font-medium min-h-[44px]"
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
const submitting   = ref(false)

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

    if (isUsernameInvalid.value || isPasswordInvalid.value || submitting.value) return

    submitting.value = true

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
        submitting.value = false
        switch (loginData.msg) {
            case 'invalidCredentials':
                serverError.value = 'Invalid username or password.'
                break
            case 'inputInvalid':
                serverError.value = 'Invalid input.'
                break
            default:
                serverError.value = 'An error occurred. Please try again.'
        }
    }
}
</script>
