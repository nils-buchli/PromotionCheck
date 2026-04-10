<template>
    <Teleport to="body">
        <Transition name="fade">
            <div
                v-if="isOpen"
                @click="close"
                class="fixed inset-0 z-50 bg-black/20 flex items-center justify-center"
            >
                <Transition name="popup">
                    <div
                        v-if="isOpen"
                        @click.stop
                        class="bg-zinc-50 rounded-3xl shadow-lg w-full mx-4 max-w-sm overflow-hidden"
                    >
                        <!-- Header -->
                        <div class="px-5 pt-5 pb-2">
                            <h2 class="text-[17px] font-semibold text-zinc-900">{{ title }}</h2>
                        </div>

                        <!-- Felder -->
                        <div class="px-5 pb-2">

                            <!-- Name -->
                            <div class="mt-3">
                                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Name</p>
                                <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                                    <input
                                        v-model="form.title"
                                        placeholder="Name"
                                        type="text"
                                        @blur="touched.title = true"
                                        :class="[
                                            'w-full px-4 py-3.5 text-[15px] bg-transparent focus:outline-none placeholder:text-zinc-300',
                                            isTitleInvalid ? 'text-red-500' : 'text-zinc-900'
                                        ]"
                                    />
                                </div>
                                <p
                                    class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                                    :class="isTitleInvalid ? 'opacity-100' : 'opacity-0'"
                                >
                                    Please enter a name. 
                                </p>
                            </div>

                            <!-- Gewichtung -->
                            <div v-if="hasWeight" class="mt-1">
                                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Weight</p>
                                <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                                    <input
                                        v-model.number="form.weight"
                                        placeholder="Weight"
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        @blur="touched.weight = true"
                                        :class="[
                                            'w-full px-4 py-3.5 text-[15px] bg-transparent focus:outline-none placeholder:text-zinc-300',
                                            isWeightInvalid ? 'text-red-500' : 'text-zinc-900'
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

                            <!-- Note -->
                            <div v-if="hasMark" class="mt-1">
                                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Mark</p>
                                <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                                    <input
                                        v-model.number="form.mark"
                                        placeholder="Mark"
                                        type="number"
                                        step="0.5"
                                        min="1"
                                        max="6"
                                        @blur="touched.mark = true"
                                        :class="[
                                            'w-full px-4 py-3.5 text-[15px] bg-transparent focus:outline-none placeholder:text-zinc-300',
                                            isMarkInvalid ? 'text-red-500' : 'text-zinc-900'
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

                            <!-- Date -->
                            <div v-if="hasDate" class="mt-1">
                                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Date</p>
                                <DateSelector v-model="form.date" @blur="touched = true" />
                                <p
                                    class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                                    :class="isDateInvalid ? 'opacity-100' : 'opacity-0'"
                                >
                                    Please enter a date.
                                </p>
                            </div>
                        </div>

                        <!-- Buttons -->
                        <div class="flex gap-3 px-5 py-5 mt-1">
                            <button
                                @click="close"
                                class="flex-1 py-3.5 rounded-2xl border border-zinc-200 bg-zinc-100 active:bg-zinc-200 text-zinc-500 text-[15px] font-medium transition-colors duration-150"
                                style="-webkit-tap-highlight-color: transparent;"
                            >
                                Cancel
                            </button>
                            <button
                                @click="save"
                                class="flex-1 py-3.5 rounded-2xl bg-zinc-900 active:bg-zinc-700 text-white text-[15px] font-medium transition-colors duration-150"
                                style="-webkit-tap-highlight-color: transparent;"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

import DateSelector from '../components/DateSelector.vue' 

const route = useRoute()

function getToday() {
    const today = new Date()
    const year  = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day   = String(today.getDate()).padStart(2, '0')
    return `${day}.${month}.${year}`
}

const props = defineProps({
    isOpen:      { type: Boolean, required: true },
    element:     { type: Object,  required: true },
    elementType: { type: String,  required: true }
})

const emit = defineEmits(['close', 'save'])

const form = ref({
    title:  '',
    weight: 1.0,
    mark:   0,
    date:   getToday(),
})

const touched = ref({ title: false, weight: false, mark: false, date: false })

watch(() => props.element, (el) => {
    form.value = {
        title:  el.name   || '',
        weight: el.weight ?? 1.0,
        mark:   el.mark   ?? 0,
        date:   el.date   || getToday(),
    }
    touched.value = { title: false, weight: false, mark: false, date: false }
}, { immediate: true })

const hasWeight = computed(() => route.name !== 'years')
const hasMark   = computed(() => route.name === 'grades')
const hasDate   = computed(() => route.name === 'grades')

const isTitleInvalid  = computed(() => touched.value.title  && !form.value.title.trim())
const isWeightInvalid = computed(() => touched.value.weight && !form.value.weight)
const isMarkInvalid   = computed(() => touched.value.mark   && !form.value.mark)
const isDateInvalid   = computed(() => touched.value.date   && !form.value.date)

const typeLabels = { years: 'Year', subjects: 'Subject', subsubjects: 'Sub-Subject', grades: 'Grade' }
const title = computed(() => `${typeLabels[route.name] ?? 'Eintrag'} bearbeiten`)

function close() {
    emit('close')
}

function save() {
    touched.value = { title: true, weight: true, mark: true, date: true }

    if (isTitleInvalid.value) return
    if (hasWeight.value && isWeightInvalid.value) return
    if (hasMark.value   && isMarkInvalid.value)   return
    if (hasDate.value   && isDateInvalid.value)   return

    emit('save', {
        name:   form.value.title,
        weight: form.value.weight,
        mark:   form.value.mark,
        date:   form.value.date,
    })
    close()
}
</script>