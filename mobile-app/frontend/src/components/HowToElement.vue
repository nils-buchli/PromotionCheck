<template>
    <div class="px-4 py-3">
        <button
            type="button"
            @click="isOpen = !isOpen"
            class="w-full flex items-center justify-between active:opacity-60 transition-opacity"
            style="-webkit-tap-highlight-color: transparent;"
        >
            <div>
                <p class="text-[15px] font-medium text-zinc-900 text-left">{{ props.title }}</p>
                <p class="text-[12px] text-zinc-400 mt-0.5 text-left">{{ props.subTitle }}</p>
            </div>
            <svg
                class="w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200"
                :class="isOpen ? 'rotate-90' : ''"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
                <path d="M9 18l6-6-6-6"/>
            </svg>
        </button>

        <!-- Expanded steps -->
        <div
            class="overflow-hidden transition-all duration-200"
            :class="isOpen ? 'max-h-[9999px] mt-3' : 'max-h-0'"
        >
            <div class="bg-zinc-50 rounded-xl border border-zinc-100 px-4 py-3 space-y-3">
                <div v-for="(step, i) in props.steps" :key="i" class="flex items-start gap-2.5">
                    <div class="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span class="text-[11px] font-medium text-zinc-900">{{ i + 1 }}</span>
                    </div>
                    <p class="text-[13px] text-zinc-700 leading-relaxed">{{ step }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    title: {type: String, required: true}, 
    subTitle: {type: String, required: true}, 
    steps: {type: Array, required: true}
})

const isOpen = ref(false)

</script>