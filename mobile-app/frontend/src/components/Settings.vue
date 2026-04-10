<template>
    <div class="mx-5 mt-8 flex flex-col gap-4">
        <!-- Card 1: General -->
        <div class="bg-white rounded-2xl border border-zinc-200 overflow-visible">
            <div class="flex flex-row flex-1 px-4 pt-3 pb-1">
                <svg class="w-[24px] h-[24px] pr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <p class="text-[17px] font-semibold text-zinc-900 tracking-wider">Settings</p>
            </div>

            <!-- Rounding -->
            <div class="px-4 py-3">
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <p class="text-[15px] font-medium text-zinc-900">Rounding</p>
                        <p class="text-[12px] text-zinc-400 mt-0.5">Round averages to:</p>
                    </div>
                </div>
                <SettingsDropdown :options="roundOptions" v-model="selectedRoundOption"/>
            </div>

            <div class="mx-4 border-t border-zinc-100" />

            <!-- Sorting -->
            <div class="px-4 py-3">
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <p class="text-[15px] font-medium text-zinc-900">Sorting</p>
                        <p class="text-[12px] text-zinc-400 mt-0.5">Sort years by:</p>
                    </div>
                </div>
                <SettingsDropdown :options="sortYearAndSubjectOptions" v-model="selectedSortYearOption"/>
                
                <div class="flex items-center justify-between mb-2">
                    <p class="text-[12px] text-zinc-400 mt-1.5">Sort subjects by:</p>
                </div>
                <SettingsDropdown :options="sortYearAndSubjectOptions" v-model="selectedSortSubjectOption"/>
                
                <div class="flex items-center justify-between mb-2">
                    <p class="text-[12px] text-zinc-400 mt-1.5">Sort grades by:</p>
                </div>
                <SettingsDropdown :options="sortGradeOptions" v-model="selectedSortGradeOption"/>
                
            </div>

            <div class="mx-4 border-t border-zinc-100" />

            <!-- Pluspoints -->
            <div class="px-4 py-3 flex items-center justify-between">
                <div>
                    <p class="text-[15px] font-medium text-zinc-900">Pluspoints</p>
                    <p class="text-[12px] text-zinc-400 mt-0.5">Show pluspoints:</p>
                </div>
                <button type="button" role="switch" :aria-checked="ppToggleEnabled"
                    class="relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border transition-all duration-200 focus:outline-none"
                    :class="ppToggleEnabled ? 'bg-zinc-900 border-zinc-900' : 'bg-zinc-200 border-zinc-200'"
                    @click="ppToggleEnabled = !ppToggleEnabled" style="-webkit-tap-highlight-color: transparent;">
                    <span class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200"
                        :class="ppToggleEnabled ? 'translate-x-5' : 'translate-x-1'" />
                </button>
            </div>

            <div class="mx-4 border-t border-zinc-100" />

            <!-- Double Compensation -->
            <div class="px-4 py-3 flex items-center justify-between transition-opacity duration-200" :class="!ppToggleEnabled ? 'opacity-40' : ''">
                <div>
                    <p class="text-[15px] font-medium text-zinc-900">Double compensation</p>
                    <p class="text-[12px] text-zinc-400 mt-0.5">Compensate marks below 4 double:</p>
                </div>
                <button type="button" role="switch" :aria-checked="dcToggleEnabled" :disabled="!ppToggleEnabled"
                    class="relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-all duration-200 focus:outline-none"
                    :class="[dcToggleEnabled ? 'bg-zinc-900 border-zinc-900' : 'bg-zinc-200 border-zinc-200', !ppToggleEnabled ? 'cursor-not-allowed' : 'cursor-pointer']"
                    @click="ppToggleEnabled ? dcToggleEnabled = !dcToggleEnabled : null" style="-webkit-tap-highlight-color: transparent;">
                    <span class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200"
                        :class="dcToggleEnabled ? 'translate-x-5' : 'translate-x-1'" />
                </button>
            </div>

            <div class="mx-4 border-t border-zinc-100" />

            <div class="px-4 py-3 transition-opacity duration-200" :class="!ppToggleEnabled ? 'opacity-40 pointer-events-none' : ''">
                <p class="text-[15px] font-medium text-zinc-900">Coloring</p>

                <!-- Subject Threshold -->
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-[12px] text-zinc-400 mt-0.5">Pluspoint coloring of a subject:</p>
                        <p class="text-[12px] text-zinc-400 mt-0.5">
                            <span class="text-orange-400 font-medium tabular-nums">{{ subjectLow }}</span>
                            <span class="text-zinc-300 mx-1">|</span>
                            <span class="text-emerald-500 font-medium tabular-nums">{{ subjectHigh }}</span>
                        </p>
                    </div>
                </div>
                <RangeSlider :min="-2" :max="1.5" :step="0.5" v-model:modelLow="subjectLow" v-model:modelHigh="subjectHigh" />

                <!-- Year Threshold -->
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <p class="text-[12px] text-zinc-400 mt-0.5">Pluspoint coloring of a year:</p>
                        <p class="text-[12px] text-zinc-400 mt-0.5">
                            <span class="text-orange-400 font-medium tabular-nums">{{ yearLow }}</span>
                            <span class="text-zinc-300 mx-1">|</span>
                            <span class="text-emerald-500 font-medium tabular-nums">{{ yearHigh }}</span>
                        </p>
                    </div>
                </div>
                <RangeSlider :min="-4" :max="8" :step="0.5" v-model:modelLow="yearLow" v-model:modelHigh="yearHigh" />

            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import RangeSlider from './RangeSlider.vue'
import SettingsDropdown from './SettingsDropdown.vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()

// --- Dropdowns ---

const roundOptions = [
    { value: 2,   label: 'Halfs' },
    { value: 4,   label: 'Quarters' },
    { value: 10,  label: 'Tenths' },
    { value: 100, label: 'Hundredths' },
]
const selectedRoundOption = ref(roundOptions.find(o => o.value === settingsStore.roundToThs) ?? roundOptions[1])

const sortYearAndSubjectOptions = [
    { value: 'nd', label: 'Name descending' }, 
    { value: 'na', label: 'Name ascending' }, 
    { value: 'vd', label: 'Average descending' }, 
    { value: 'va', label: 'Average ascending' }
]
const selectedSortYearOption = ref(sortYearAndSubjectOptions.find(o => o.value === settingsStore.sorting.year) ?? sortYearAndSubjectOptions[0]) 

const selectedSortSubjectOption = ref(sortYearAndSubjectOptions.find(o => o.value === settingsStore.sorting.subject) ?? sortYearAndSubjectOptions[0]) 

const sortGradeOptions = [
    { value: 'nd', label: 'Name descending' }, 
    { value: 'na', label: 'Name ascending' }, 
    { value: 'vd', label: 'Mark descending' }, 
    { value: 'va', label: 'Mark ascending' }, 
    { value: 'dd', label: 'Date descending' }, 
    { value: 'da', label: 'Date ascending' }, 
]
const selectedSortGradeOption = ref(sortGradeOptions.find(o => o.value === settingsStore.sorting.grade) ?? sortGradeOptions[0]) 


// --- Toggles ---
const ppToggleEnabled = ref(settingsStore.showPluspoints)
const dcToggleEnabled = ref(settingsStore.doubleCompensation)

// --- Sliders  ---
const subjectLow  = ref(settingsStore.coloring.subjectMin)
const subjectHigh = ref(settingsStore.coloring.subjectMax)
const yearLow     = ref(settingsStore.coloring.yearMin)
const yearHigh    = ref(settingsStore.coloring.yearMax)

watch(selectedRoundOption, async (v)                                                => await settingsStore.setRoundToThs(v.value))
watch(ppToggleEnabled, async (v)                                                    => await settingsStore.setShowPluspoints(v))
watch(dcToggleEnabled, async (v)                                                    => await settingsStore.setDoubleCompensation(v))
watch([subjectLow, subjectHigh, yearLow, yearHigh], async ([v1, v2, v3, v4])        => await settingsStore.setColoring(v1, v2, v3, v4))
watch([selectedSortYearOption, selectedSortSubjectOption, selectedSortGradeOption], async ([v1, v2, v3]) => await settingsStore.setSorting(v1.value, v2.value, v3.value))

</script>