<template>
    <Teleport to="body">
        <Transition enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 translate-y-2"
                    enter-to-class="opacity-100 translate-y-0">
            <div v-if="current" class="fixed inset-x-0 bottom-6 flex justify-center z-50 px-5">
                <div class="bg-white border border-zinc-200 rounded-2xl shadow-xl p-4 w-full max-w-sm">

                    <!-- Type badge -->
                    <span class="text-[11px] font-semibold uppercase tracking-wider"
                          :class="current.type === 'legal' ? 'text-amber-500' : 'text-blue-500'">
                        {{ current.type === 'legal' ? 'Terms Update' : 'New Update' }}
                    </span>

                    <p class="text-[15px] font-semibold text-zinc-900 mt-1">{{ current.title }}</p>
                    <p class="text-[13px] text-zinc-500 mt-1 leading-relaxed">{{ current.message }}</p>

                    <div class="flex gap-2 mt-3">
                        <button @click="dismiss"
                                class="flex-1 py-2 rounded-xl bg-zinc-100 text-zinc-600 text-[13px] font-medium active:bg-zinc-200">
                            Got it
                        </button>
                    </div>

                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()

const announcements = ref([])
const currentIndex  = ref(0)

const current = computed(() => announcements.value[currentIndex.value] ?? null)

async function fetchAnnouncements() {
    if (userStore.isLoggedIn) {
        const res  = await fetch('/api/announcements', {
           headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        })
        const json = await res.json()
        announcements.value = json.data ?? []
    }
}

async function dismiss() {
    if (userStore.isLoggedIn) {
        await fetch('/api/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ id: current.value.id })
        })
        currentIndex.value++ 
    }
}

fetchAnnouncements()
</script>