<template>
    <div class="flex flex-col flex-1 bg-zinc-50">

        <!-- Avatar + Name -->
        <div class="flex flex-col items-center mt-10 mb-2">
            <div class="h-16 w-16 rounded-full bg-zinc-200 flex items-center justify-center mb-3">
                <span class="text-2xl font-semibold text-zinc-600">{{ initial }}</span>
            </div>
            <p class="text-[17px] font-semibold text-zinc-900">{{ username }}</p>
            <p class="text-[13px] text-zinc-400 mt-0.5">Username</p>
        </div>

        <!-- Logout -->
        <div class="mx-5 mt-8">
            <button
                type="button"
                @click="logout"
                class="w-full bg-zinc-100 active:bg-zinc-200 text-red-500 text-[15px] font-medium rounded-2xl py-3.5 transition-colors duration-150 border border-zinc-200"
                style="-webkit-tap-highlight-color: transparent;"
            >
                Sign out
            </button>
        </div>

    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()

const username = computed(() =>
    userStore.isLoggedIn ? userStore.user.name : ''
)

const initial = computed(() =>
    username.value ? username.value.charAt(0).toUpperCase() : '?'
)

function logout() {
    userStore.clearUser()
    localStorage.removeItem('access_token')
    window.location.reload()
}
</script>