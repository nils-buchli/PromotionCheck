<template>
    <div class="flex flex-col flex-1 bg-zinc-50 items-center justify-center px-8">
        <div class="flex flex-col items-center gap-5 max-w-xs w-full">

            <div class="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
                <svg class="w-7 h-7 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>

            <div class="text-center">
                <p class="text-[17px] font-semibold text-zinc-900">Something went wrong</p>
                <p v-if="route.query.m" class="text-[13px] text-zinc-400 mt-1.5">{{ route.query.m }}</p>
            </div>

            <button
                type="button"
                @click="backToHome"
                class="w-full bg-zinc-900 active:bg-zinc-700 text-white text-[15px] font-medium rounded-2xl py-3.5 transition-colors duration-150"
                style="-webkit-tap-highlight-color: transparent;"
            >
                Back to Home
            </button>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()

function backToHome() {
    router.replace('/')
}
</script>
