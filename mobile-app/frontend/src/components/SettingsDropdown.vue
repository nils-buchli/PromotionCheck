<template>
    <div class="relative" ref="dropdownRef">
        <button
            @click="open = !open"
            class="w-full px-4 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-left text-sm text-zinc-900 font-medium active:bg-zinc-200 transition-colors flex items-center justify-between"
            style="-webkit-tap-highlight-color: transparent;"
        >
            <span>{{ selected?.label }}</span>
            <svg :class="['w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0', open ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
            <div v-if="open" class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div
                    v-for="option in options" :key="option.value"
                    @click="select(option)"
                    :class="['px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between', selected?.value === option.value ? 'bg-zinc-100 text-zinc-900 font-medium' : 'text-zinc-700 active:bg-zinc-50']"
                    style="-webkit-tap-highlight-color: transparent;"
                >
                    <span>{{ option.label }}</span>
                    <svg v-if="selected?.value === option.value" class="w-4 h-4 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    options: { type: Array, required: true }, // [{ value, label }]
    modelValue: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const dropdownRef = ref(null)
const selected = ref(props.modelValue ?? props.options[0])

function select(option) {
    selected.value = option
    open.value = false
    emit('update:modelValue', option)
}

function handleClickOutside(e) {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
        open.value = false
    }
}

onMounted(() => document.addEventListener('pointerdown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleClickOutside))
</script>