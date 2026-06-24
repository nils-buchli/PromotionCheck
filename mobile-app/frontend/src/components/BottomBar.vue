<template>
    <footer
        v-if="hasBottomBar"
        class="sticky bottom-0 z-40 flex items-center justify-around h-[68px] px-3 bg-zinc-100 border-t border-zinc-200"
    >
        <!-- Home -->
        <button
            @click="home"
            class="nav-btn"
            :class="isActive('years') ? 'text-primary' : 'text-zinc-400'"
            aria-label="Home"
        >
            <svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
                <path d="M9 21V12h6v9"/>
            </svg>
            <span class="indicator" :class="isActive('years') ? 'opacity-100' : 'opacity-0'" />
        </button>

        <!-- Analytics -->
        <button
            @click="analytics"
            class="nav-btn"
            :class="isActive('analytics') ? 'text-primary' : 'text-zinc-400'"
            aria-label="Analytics"
        >
            <svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 20V10"/>
                <path d="M12 20V4"/>
                <path d="M6 20v-6"/>
            </svg>
            <span class="indicator" :class="isActive('analytics') ? 'opacity-100' : 'opacity-0'" />
        </button>

        <!-- Profile -->
        <button
            @click="user"
            class="nav-btn"
            :class="isActive('user') ? 'text-primary' : 'text-zinc-400'"
            aria-label="Profile"
        >
            <svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            <span class="indicator" :class="isActive('user') ? 'opacity-100' : 'opacity-0'" />
        </button>
    </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useGlobalStatesStore } from '../stores/globalStates'

const globalStateStore = useGlobalStatesStore()

const route  = useRoute()
const router = useRouter()

const hasBottomBar = computed(() => !(/add.*/.test(route.name)))

function isActive(name) {
    if (name === 'years') return ['years', 'subjects', 'subSubjects', 'grades'].includes(route.name)
    return route.name === name
}

function home() {
    if (!(['user', 'analytics'].includes(route.name))) router.push('/')
    else router.push(globalStateStore.homeRoute)
}
function user() {
    if (!(['user', 'analytics'].includes(route.name))) globalStateStore.homeRoute = route.fullPath
    router.push('/user')
}
function analytics() {
    if (!(['user', 'analytics'].includes(route.name))) globalStateStore.homeRoute = route.fullPath
    router.push('/analytics')
}
</script>

<style scoped>
@import './../assets/BottomBar.css'
</style>
