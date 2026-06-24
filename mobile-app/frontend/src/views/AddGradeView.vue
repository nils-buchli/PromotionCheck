<template>
    <div class="flex flex-col flex-1 bg-zinc-50">

        <!-- Name -->
        <div class="mt-6 mx-5">
            <label for="grade-name" class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1 block">Name</label>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden focus-within:border-zinc-400 transition-colors">
                <input
                    id="grade-name"
                    v-model="name"
                    type="text"
                    inputmode="text"
                    autocomplete="off"
                    autofocus
                    required
                    placeholder="Name"
                    @blur="touched = true"
                    :class="[
                        'w-full px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isNameInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isNameInvalid ? 'opacity-100' : 'opacity-0'"
                role="alert"
            >
                Please enter a name.
            </p>
        </div>

        <!-- Mark -->
        <div class="mt-2 mx-5">
            <label for="grade-mark" class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1 block">Mark</label>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden focus-within:border-zinc-400 transition-colors">
                <input
                    id="grade-mark"
                    v-model="mark"
                    type="number"
                    inputmode="decimal"
                    required
                    placeholder="Mark"
                    step="0.5"
                    min="1"
                    max="6"
                    @blur="touched = true"
                    :class="[
                        'w-full px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isMarkInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isMarkInvalid ? 'opacity-100' : 'opacity-0'"
                role="alert"
            >
                Please enter a mark.
            </p>
        </div>

        <!-- Weight -->
        <div class="mt-2 mx-5">
            <label for="grade-weight" class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1 block">Weight</label>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden focus-within:border-zinc-400 transition-colors">
                <input
                    id="grade-weight"
                    v-model="weight"
                    type="number"
                    inputmode="decimal"
                    required
                    placeholder="Weight"
                    step="0.5"
                    min="0"
                    @blur="touched = true"
                    :class="[
                        'w-full px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isWeightInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isWeightInvalid ? 'opacity-100' : 'opacity-0'"
                role="alert"
            >
                Please enter a weight.
            </p>
        </div>

        <!-- Date -->
        <div class="mt-2 mx-5">
            <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Date</p>
            <DateSelector v-model="date" @blur="touched = true" />
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isDateInvalid ? 'opacity-100' : 'opacity-0'"
                role="alert"
            >
                Please enter a date.
            </p>
        </div>

        <!-- Submit -->
        <div class="mx-5 mt-4">
            <button
                type="button"
                @click="submit"
                :disabled="submitting"
                class="w-full bg-primary active:bg-primary-dark disabled:opacity-50 text-white text-[15px] font-medium rounded-2xl py-3.5 transition-colors duration-150"
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
import DateSelector from '../components/DateSelector.vue'

function getToday() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${day}.${month}.${year}`
}

const route = useRoute()
const router = useRouter()

const gradeStore = useGradeStore()
const name       = ref('')
const mark       = ref()
const weight     = ref(1.0)
const date       = ref(getToday())
const touched    = ref(false)
const submitting = ref(false)

const isNameInvalid   = computed(() => touched.value && !name.value.trim())
const isMarkInvalid   = computed(() => touched.value && !mark.value)
const isWeightInvalid = computed(() => touched.value &&  weight.value === '')
const isDateInvalid   = computed(() => touched.value && !date.value)

async function submit() {
    touched.value = true
    if (isNameInvalid.value || isMarkInvalid.value || isWeightInvalid.value || isDateInvalid.value || submitting.value) return

    submitting.value = true
    await gradeStore.addGrade(name.value, mark.value, weight.value, date.value, route.params.subjectId)

    router.back()
}
</script>
