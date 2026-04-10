<template>
    <div class="mx-5 mt-4 flex flex-col gap-4">
        <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">

            <div class="flex flex-row flex-1 px-4 pt-3 pb-1">
                <svg class="w-[24px] h-[24px] pr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.6-1.4 4.9-3.5 6.2-.5.3-.5.6-.5.8v.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-.5c0-.2 0-.5-.5-.8C6.4 13.9 5 11.6 5 9a7 7 0 0 1 7-7z"/>
                </svg>
                <p class="text-[17px] font-semibold text-zinc-900 tracking-wider">How To</p>
            </div>

            <!-- Access Pluspoints on the laptop -->
            <div class="px-4 py-3">
                <button
                    type="button"
                    @click="showPluspoints = !showPluspoints"
                    class="w-full flex items-center justify-between active:opacity-60 transition-opacity"
                    style="-webkit-tap-highlight-color: transparent;"
                >
                    <div>
                        <p class="text-[15px] font-medium text-zinc-900 text-left">Access Pluspoints on the laptop</p>
                        <p class="text-[12px] text-zinc-400 mt-0.5 text-left">Manage your grades from everywhere</p>
                    </div>
                    <svg
                        class="w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200"
                        :class="showPluspoints ? 'rotate-90' : ''"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    >
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>

                <!-- Expanded steps -->
                <div
                    class="overflow-hidden transition-all duration-200"
                    :class="showPluspoints ? 'max-h-[9999px] mt-3' : 'max-h-0'"
                >
                    <div class="bg-zinc-50 rounded-xl border border-zinc-100 px-4 py-3 space-y-3">
                        <div v-for="(step, i) in pluspointsSteps" :key="i" class="flex items-start gap-2.5">
                            <div class="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span class="text-[11px] font-medium text-zinc-900">{{ i + 1 }}</span>
                            </div>
                            <p class="text-[13px] text-zinc-700 leading-relaxed">{{ step }}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const showPluspoints = ref(false)

const pluspointsSteps = [
    'Open your browser and go to pluspoints.app',
    'Sign in with your username and password',
]
</script>