<template>
    <footer
        v-if="hasBottomBar"
        class="sticky bottom-0 z-50 flex items-center justify-around h-[68px] px-3 bg-zinc-100 border-t border-zinc-200"
        style="-webkit-tap-highlight-color: transparent;"
    >
        <!-- Home -->
        <button
            @click="home"
            class="nav-btn"
            :class="isActive('years') ? 'text-zinc-900' : 'text-zinc-400'"
            aria-label="Home"
        >
            <svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
                <path d="M9 21V12h6v9"/>
            </svg>
            <span class="dot" :class="isActive('years') ? 'opacity-100' : 'opacity-0'" />
        </button>

        <!-- Analytics -->
        <button
            @click="analytics"
            class="nav-btn"
            :class="isActive('analytics') ? 'text-zinc-900' : 'text-zinc-400'"
            aria-label="Statistiken"
        >
            <svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 20V10"/>
                <path d="M12 20V4"/>
                <path d="M6 20v-6"/>
            </svg>
            <span class="dot" :class="isActive('analytics') ? 'opacity-100' : 'opacity-0'" />
        </button>

        <!-- Teachers -->
        <button
            @click="teachers"
            class="nav-btn"
            :class="isActive('teachers') ? 'text-zinc-900' : 'text-zinc-400'"
            aria-label="Lehrpersonen"
        >
            <svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span class="dot" :class="isActive('teachers') ? 'opacity-100' : 'opacity-0'" />
        </button>

        <!-- Profile -->
        <button
            @click="user"
            class="nav-btn"
            :class="isActive('user') ? 'text-zinc-900' : 'text-zinc-400'"
            aria-label="Profil"
        >
            <svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            <span class="dot" :class="isActive('user') ? 'opacity-100' : 'opacity-0'" />
        </button>
    </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()

const hasBottomBar = computed(() => !(/add.*/.test(route.name)))

function isActive(name) {
    if (name === 'years') return ['years', 'subjects', 'subSubjects', 'grades'].includes(route.name)
    return route.name === name
}

function home()      { router.push('/') }
function user()      { router.push('/user') }
function analytics() { router.push('/analytics') }
function teachers()  { router.push('/teachers') }
</script>

<style scoped>
.nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 52px;
    height: 52px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 12px;
    padding: 0;
    transition: color 150ms ease;
}
.nav-btn:active { background: #e4e4e7; }

.dot {
    display: block;
    width: 4px;
    height: 4px;
    border-radius: 9999px;
    background: currentColor;
    transition: opacity 150ms ease;
}
</style>
