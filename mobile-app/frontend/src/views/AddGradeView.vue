<template>
    <div class="flex flex-col flex-1 bg-zinc-50">

        <!-- Name -->
        <div class="mt-6 mx-5">
            <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Name</p>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <input
                    v-model="name"
                    type="text"
                    autofocus
                    required
                    placeholder="Name"
                    @blur="touched = true"
                    :class="[
                        'w-full px-4 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isNameInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isNameInvalid ? 'opacity-100' : 'opacity-0'"
            >
                Please enter a name.
            </p>
        </div>

        <!-- Mark -->
        <div class="mt-2 mx-5">
            <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Mark</p>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <input
                    v-model="mark"
                    type="number"
                    required
                    placeholder="Mark"
                    step="0.5"
                    min="1"
                    max="6"
                    @blur="touched = true"
                    :class="[
                        'w-full px-4 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isMarkInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isMarkInvalid ? 'opacity-100' : 'opacity-0'"
            >
                Please enter a mark. 
            </p>
        </div>

        <!-- Weight -->
        <div class="mt-2 mx-5">
            <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Weight</p>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <input
                    v-model="weight"
                    type="number"
                    required
                    placeholder="Weight"
                    step="0.5"
                    min="0"
                    @blur="touched = true"
                    :class="[
                        'w-full px-4 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isWeightInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isWeightInvalid ? 'opacity-100' : 'opacity-0'"
            >
                Please enter a weight.
            </p>
        </div>

        <!-- Date -->
        <div class="mt-2 mx-5">
            <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Date</p>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <input
                    v-model="date"
                    type="date"
                    required
                    @blur="touched = true"
                    :class="[
                        'w-full px-4 py-3.5 text-[15px] text-zinc-900 bg-transparent focus:outline-none',
                        isDateInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isDateInvalid ? 'opacity-100' : 'opacity-0'"
            >
                Bitte ein Datum eingeben.
            </p>
        </div>

        <!-- Submit -->
        <div class="mx-5 mt-4">
            <button
                type="button"
                @click="submit"
                class="w-full bg-zinc-100 active:bg-zinc-200 text-zinc-700 text-[15px] font-medium rounded-2xl py-3.5 transition-colors duration-150 border border-zinc-200"
                style="-webkit-tap-highlight-color: transparent;"
            >
                Add Grade
            </button>
        </div>

    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'

import { useGradeStore } from '../stores/grades'

function getToday() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const route = useRoute()
const router = useRouter()

const gradeStore = useGradeStore()
const name    = ref('')
const mark    = ref()
const weight  = ref(1.0)
const date    = ref(getToday())
const touched = ref(false)

const formattedDate = computed(() => {
    if (!date.value) return ''
    const [year, month, day] = date.value.split('-')
    return `${day}.${month}.${year}`
})

const isNameInvalid   = computed(() => touched.value && !name.value.trim())
const isMarkInvalid   = computed(() => touched.value && !mark.value)
const isWeightInvalid = computed(() => touched.value && !weight.value)
const isDateInvalid   = computed(() => touched.value && !date.value)

async function submit() {
    touched.value = true
    if (isNameInvalid.value || isMarkInvalid.value || isWeightInvalid.value || isDateInvalid.value) return

    await gradeStore.addGrade(name.value, mark.value, weight.value, formattedDate.value, route.params.subjectId)

    router.back()
}
</script>