<template>
    <Teleport to="body">
        <Transition name="fade">
            <div
                v-if="isOpen"
                @click="close"
                class="fixed inset-0 z-50 bg-black/20 flex items-center justify-center"
            >
                <Transition name="popup">
                    <div
                        v-if="isOpen"
                        @click.stop
                        class="bg-zinc-50 rounded-2xl shadow-lg w-full mx-5 max-w-sm overflow-hidden"
                    >
                        <!-- Header -->
                        <div class="px-5 pt-5 pb-2">
                            <h2 class="text-[17px] font-semibold text-zinc-900">Edit Profile</h2>
                        </div>

                        <!-- Fields -->
                        <div class="px-5 pb-2">

                            <!-- Username -->
                            <div class="mt-3">
                                <label for="edit-username" class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1 block">Username</label>
                                <div :class="['bg-white rounded-2xl border overflow-hidden transition-colors', hasUsernameError ? 'border-red-300' : 'border-zinc-200 focus-within:border-zinc-400']">
                                    <input
                                        id="edit-username"
                                        v-model="form.username"
                                        placeholder="Username"
                                        type="text"
                                        inputmode="text"
                                        autocomplete="username"
                                        @blur="touched.username = true"
                                        @input="serverUsernameError = ''"
                                        :class="['w-full px-4 py-3.5 text-base bg-transparent focus:outline-none placeholder:text-zinc-300', hasUsernameError ? 'text-red-500' : 'text-zinc-900']"
                                    />
                                </div>
                                <p class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150" :class="hasUsernameError ? 'opacity-100' : 'opacity-0'" role="alert">
                                    {{ serverUsernameError || 'Please enter a username.' }}
                                </p>
                            </div>

                            <!-- New Password -->
                            <div class="mt-1">
                                <label for="edit-new-password" class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1 block">New Password</label>
                                <div :class="['bg-white rounded-2xl border flex items-center transition-colors', isPasswordInvalid ? 'border-red-300' : 'border-zinc-200 focus-within:border-zinc-400']">
                                    <input
                                        id="edit-new-password"
                                        v-model="form.password"
                                        placeholder="New password"
                                        :type="showPassword ? 'text' : 'password'"
                                        autocomplete="new-password"
                                        @blur="touched.password = true"
                                        :class="['flex-1 px-4 py-3.5 text-base bg-transparent focus:outline-none placeholder:text-zinc-300', isPasswordInvalid ? 'text-red-500' : 'text-zinc-900']"
                                    />
                                    <button type="button" @click="showPassword = !showPassword"
                                        class="flex items-center justify-center w-11 h-11 mr-1 text-zinc-300 active:text-zinc-500 transition-colors flex-shrink-0"
                                        aria-label="Toggle password visibility">
                                        <svg v-if="!showPassword" class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                        </svg>
                                        <svg v-else class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    </button>
                                </div>
                                <p class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150" :class="isPasswordInvalid ? 'opacity-100' : 'opacity-0'" role="alert">
                                    Password must be at least 6 characters.
                                </p>
                            </div>

                            <!-- Confirm Password -->
                            <div class="mt-1">
                                <label for="edit-confirm-password" class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1 block">Confirm Password</label>
                                <div :class="['bg-white rounded-2xl border flex items-center transition-colors', isConfirmInvalid ? 'border-red-300' : 'border-zinc-200 focus-within:border-zinc-400']">
                                    <input
                                        id="edit-confirm-password"
                                        v-model="form.confirmPassword"
                                        placeholder="Repeat new password"
                                        :type="showConfirm ? 'text' : 'password'"
                                        autocomplete="new-password"
                                        @blur="touched.confirmPassword = true"
                                        :class="['flex-1 px-4 py-3.5 text-base bg-transparent focus:outline-none placeholder:text-zinc-300', isConfirmInvalid ? 'text-red-500' : 'text-zinc-900']"
                                    />
                                    <button type="button" @click="showConfirm = !showConfirm"
                                        class="flex items-center justify-center w-11 h-11 mr-1 text-zinc-300 active:text-zinc-500 transition-colors flex-shrink-0"
                                        aria-label="Toggle password visibility">
                                        <svg v-if="!showConfirm" class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                        </svg>
                                        <svg v-else class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    </button>
                                </div>
                                <p class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150" :class="isConfirmInvalid ? 'opacity-100' : 'opacity-0'" role="alert">
                                    Passwords do not match.
                                </p>
                            </div>

                        </div>

                        <!-- Buttons -->
                        <div class="flex gap-3 px-5 py-5 mt-1">
                            <button
                                @click="close"
                                class="flex-1 py-3.5 rounded-2xl border border-zinc-200 bg-zinc-100 active:bg-zinc-200 text-zinc-500 text-[15px] font-medium transition-colors duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                @click="save"
                                class="flex-1 py-3.5 rounded-2xl text-white text-[15px] font-medium transition-colors duration-150 bg-primary active:bg-primary-dark"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import { API_BASE } from '../config'

const userStore = useUserStore()

const props = defineProps({
    isOpen: { type: Boolean, required: true },
})

const emit = defineEmits(['close'])

const showPassword        = ref(false)
const showConfirm         = ref(false)
const serverUsernameError = ref('')

const form    = ref({ username: userStore.user.name, password: '', confirmPassword: '' })
const touched = ref({ username: false, password: false, confirmPassword: false })

const isUsernameInvalid = computed(() => touched.value.username && !form.value.username.trim())
const isPasswordInvalid = computed(() => touched.value.password && form.value.password.length > 0 && form.value.password.length < 6)
const isConfirmInvalid  = computed(() => touched.value.confirmPassword && form.value.confirmPassword !== form.value.password)
const hasUsernameError  = computed(() => isUsernameInvalid.value || !!serverUsernameError.value)

function close() {
    emit('close')
}

async function save() {
    touched.value = { username: true, password: true, confirmPassword: true }
    serverUsernameError.value = ''

    if (isUsernameInvalid.value || isPasswordInvalid.value || isConfirmInvalid.value) return

    const payload = {}
    if (form.value.username.trim() && form.value.username.trim() !== userStore.user.name) payload.username = form.value.username.trim()
    if (form.value.password) payload.password        = form.value.password

    if (!payload?.password && !payload?.username) {
        close()
        return
    }

    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_BASE}/api/edit-user`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body:    JSON.stringify(payload),
    })

    const data = await response.json()

    if (!data.success) {
        if (data.msg === 'usrNameAlreadyTaken') serverUsernameError.value = 'This username is already taken.'
        return
    }

    if (payload?.username) userStore.user.name = payload.username
    close()
}
</script>
