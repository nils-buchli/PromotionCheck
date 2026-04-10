<template>
    <div class="relative" ref="containerRef">

        <!-- Trigger -->
        <div
            @click="toggle"
            :class="[
                'w-full px-4 py-3.5 text-[15px] bg-white rounded-2xl border border-zinc-200 flex items-center justify-between cursor-pointer select-none transition-colors duration-150',
                isOpen ? 'border-zinc-300' : ''
            ]"
        >
            <span :class="modelValue ? 'text-zinc-900' : 'text-zinc-300'">
                {{ modelValue || 'Date' }}
            </span>
            <svg
                :class="['w-4 h-4 text-zinc-400 transition-transform duration-200', isOpen ? 'rotate-180' : '']"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>

        <!-- Dropdown Calendar -->
        <Transition name="picker">
            <div
                v-if="isOpen"
                class="absolute left-0 right-0 z-50 mb-2 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm bottom-full"
            >
                <!-- Month Nav -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                    <button
                        @click="prevMonth"
                        class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
                    >
                        <svg class="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <span class="text-[13px] font-semibold text-zinc-900">
                        {{ monthName }} {{ viewYear }}
                    </span>

                    <button
                        @click="nextMonth"
                        class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
                    >
                        <svg class="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <!-- Weekday Headers -->
                <div class="grid grid-cols-7 px-3 pt-2 pb-1">
                    <div
                        v-for="day in weekDays"
                        :key="day"
                        class="text-center text-[10px] font-semibold text-zinc-400 uppercase tracking-widest py-1"
                    >
                        {{ day }}
                    </div>
                </div>

                <!-- Day Grid -->
                <div class="grid grid-cols-7 px-3 pb-3 gap-y-1">
                    <div
                        v-for="(cell, i) in calendarCells"
                        :key="i"
                        @click="cell.day ? selectDay(cell.day) : null"
                        :class="[
                            'flex items-center justify-center h-9 rounded-xl text-[14px] transition-colors duration-100',
                            !cell.day ? '' : 'cursor-pointer',
                            cell.isSelected
                                ? 'bg-zinc-900 text-white font-semibold'
                                : cell.isToday
                                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                                    : cell.day
                                        ? 'text-zinc-800 hover:bg-zinc-100 active:bg-zinc-200'
                                        : ''
                        ]"
                    >
                        {{ cell.day || '' }}
                    </div>
                </div>
            </div>
        </Transition>

    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const containerRef = ref(null)

const today = new Date()

const viewMonth = ref(today.getMonth())
const viewYear  = ref(today.getFullYear())

const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const monthName = computed(() => monthNames[viewMonth.value])

const selectedDate = computed(() => {
    if (!props.modelValue) return null
    const parts = props.modelValue.split('.')
    if (parts.length !== 3) return null
    const [day, month, year] = parts
    return {
        day:   parseInt(day),
        month: parseInt(month) - 1,
        year:  parseInt(year)
    }
})

// Wenn ein initialer Wert gesetzt ist, Calendar auf dessen Monat/Jahr springen
watch(selectedDate, (val) => {
    if (val) {
        viewMonth.value = val.month
        viewYear.value  = val.year
    }
}, { immediate: true })

const calendarCells = computed(() => {
    const year  = viewYear.value
    const month = viewMonth.value

    const firstDay    = new Date(year, month, 1).getDay()
    const offset      = firstDay === 0 ? 6 : firstDay - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < offset; i++) cells.push({ day: null })

    for (let d = 1; d <= daysInMonth; d++) {
        const isToday =
            d === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()

        const isSelected =
            selectedDate.value !== null &&
            d === selectedDate.value.day &&
            month === selectedDate.value.month &&
            year === selectedDate.value.year

        cells.push({ day: d, isToday, isSelected })
    }

    return cells
})

const prevMonth = () => {
    if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
    else viewMonth.value--
}

const nextMonth = () => {
    if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
    else viewMonth.value++
}

const selectDay = (day) => {
    const m = String(viewMonth.value + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    emit('update:modelValue', `${d}.${m}.${viewYear.value}`)
    isOpen.value = false
}

const toggle = () => { isOpen.value = !isOpen.value }

const handleClickOutside = (e) => {
    if (containerRef.value && !containerRef.value.contains(e.target)) {
        isOpen.value = false
    }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))
</script>