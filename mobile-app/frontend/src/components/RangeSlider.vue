<template>
    <div class="px-0 pb-2 pt-1">
        <!-- Slider Track -->
        <div
            class="relative flex items-center"
            style="height: 28px; touch-action: none;"
            ref="trackRef"
        >
            <!-- Base track -->
            <div class="absolute inset-x-2.5 h-1.5 rounded-full bg-zinc-100 border border-zinc-200" />

           <!-- Left: red -->
            <div
                class="absolute h-1.5 rounded-full bg-red-500"
                :style="{ left: '10px', right: `calc(100% - ${offsetPct(lowPct)}%)` }"
            />

            <!-- Middle: orange -->
            <div
                class="absolute h-1.5 rounded-full bg-orange-500"
                :style="{ left: `${offsetPct(lowPct)}%`, right: `calc(100% - ${offsetPct(highPct)}%)` }"
            />

            <!-- Right: green -->
            <div
                class="absolute h-1.5 rounded-full bg-emerald-500"
                :style="{ left: `${offsetPct(highPct)}%`, right: '10px' }"
            />

            <!-- Orange handle -->
            <div
                class="absolute w-6 h-6 rounded-full bg-white border-[3px] border-orange-600 shadow-md"
                style="touch-action: none; cursor: grab;"
                :style="{ left: `calc(${offsetPct(lowPct)}% - 12px)`, zIndex: lowPct >= 50 ? 20 : 10 }"
                @pointerdown.stop.prevent="startDrag('low', $event)"
            />

            <!-- Green handle -->
            <div
                class="absolute w-6 h-6 rounded-full bg-white border-[3px] border-emerald-600 shadow-md"
                style="touch-action: none; cursor: grab;"
                :style="{ left: `calc(${offsetPct(highPct)}% - 12px)`, zIndex: lowPct >= 50 ? 10 : 20 }"
                @pointerdown.stop.prevent="startDrag('high', $event)"
            />
        </div>

        <!-- Min / Max labels -->
        <div class="flex justify-between mt-0.5 px-0.5">
            <span class="text-[10px] text-zinc-400 tabular-nums">{{ min }}</span>
            <span class="text-[10px] text-zinc-400 tabular-nums">{{ max }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
    min: { type: Number, default: -1 },
    max: { type: Number, default: 1 },
    step: { type: Number, default: 0.5 },
    modelLow: { type: Number, default: -0.5 },
    modelHigh: { type: Number, default: 0.5 },
})

const emit = defineEmits(['update:modelLow', 'update:modelHigh'])

const trackRef = ref(null)
const localLow = ref(props.modelLow)
const localHigh = ref(props.modelHigh)

const range = computed(() => props.max - props.min)
const lowPct = computed(() => ((localLow.value - props.min) / range.value) * 100)
const highPct = computed(() => ((localHigh.value - props.min) / range.value) * 100)

// Offset pct to account for handle radius (12px each side)
function offsetPct(pct) {
    if (!trackRef.value) return pct
    const w = trackRef.value.getBoundingClientRect().width
    const usable = w - 24 // subtract both handle radii
    return (pct / 100) * (usable / w) * 100 + (12 / w) * 100
}

function snap(val) {
    const stepped = Math.round(val / props.step) * props.step
    return Math.min(props.max, Math.max(props.min, parseFloat(stepped.toFixed(10))))
}

function clientXToVal(clientX) {
    const rect = trackRef.value.getBoundingClientRect()
    const usable = rect.width - 24
    const x = Math.min(usable, Math.max(0, clientX - rect.left - 12))
    return snap(props.min + (x / usable) * range.value)
}

let dragging = null

function startDrag(handle, e) {
    dragging = handle
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e) {
    if (!dragging || !trackRef.value) return
    const val = clientXToVal(e.clientX)

    if (dragging === 'low') {
        localLow.value = Math.min(val, localHigh.value)
        emit('update:modelLow', localLow.value)
    } else {
        localHigh.value = Math.max(val, localLow.value)
        emit('update:modelHigh', localHigh.value)
    }
}

function onPointerUp() {
    dragging = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
}

onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
})
</script>