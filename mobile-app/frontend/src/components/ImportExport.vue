<template>
    <div class="mx-5 mt-4 flex flex-col gap-4">
        <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">

            <div class="flex flex-row flex-1 px-4 pt-3 pb-1">
                <svg class="w-[24px] h-[24px] pr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p class="text-[17px] font-semibold text-zinc-900 tracking-wider">Import & Export</p>
            </div>

            <!-- Import -->
            <div class="px-4 py-3">
                <button
                    type="button"
                    @click="triggerImport"
                    :disabled="importing"
                    class="w-full flex items-center justify-between active:opacity-60 transition-opacity disabled:opacity-40"
                    style="-webkit-tap-highlight-color: transparent;"
                >
                    <div>
                        <p class="text-[15px] font-medium text-zinc-900 text-left">Import</p>
                        <p class="text-[12px] text-zinc-400 mt-0.5 text-left">Load a year from a pluspoint file</p>
                    </div>
                    <svg v-if="importing" class="w-4 h-4 text-zinc-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    <svg v-else class="w-4 h-4 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>

                <Transition
                    enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-200 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                >
                    <div
                        v-if="importFeedback"
                        class="mt-2 flex items-center gap-1.5 text-[12px] font-medium"
                        :class="importFeedback === 'success' ? 'text-emerald-500' : 'text-red-500'"
                    >
                        <svg v-if="importFeedback === 'success'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        {{ importFeedback === 'success' ? 'Import successful' : 'Import failed' }}
                    </div>
                </Transition>

                <input ref="fileInput" type="file" accept=".txt,.xml,.PlusPointExport,.plist" class="hidden" @change="onFileSelected" />
            </div>

            <div class="mx-4 border-t border-zinc-100" />

            <!-- Export -->
            <div class="px-4 py-3">
                <button
                    type="button"
                    @click="toggleExport"
                    class="w-full flex items-center justify-between active:opacity-60 transition-opacity"
                    style="-webkit-tap-highlight-color: transparent;"
                >
                    <div>
                        <p class="text-[15px] font-medium text-zinc-900 text-left">Export</p>
                        <p class="text-[12px] text-zinc-400 mt-0.5 text-left">Save a year as a pluspoint file</p>
                    </div>
                    <svg
                        class="w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200"
                        :class="showExport ? 'rotate-90' : ''"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    >
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>

                <!-- Expanded year selection -->
                <div
                    class="overflow-hidden transition-all duration-200"
                    :class="showExport ? 'max-h-[9999px] mt-3' : 'max-h-0'"
                >
                    <div class="bg-zinc-50 rounded-xl border border-zinc-100 px-4 py-3 space-y-3">

                        <div v-if="years.length === 0">
                            <p class="text-[13px] text-zinc-400">No years available.</p>
                        </div>

                        <div
                            v-for="year in years"
                            :key="year.id"
                            class="flex items-center gap-2.5"
                            @click="toggleYear(year.id)"
                            style="-webkit-tap-highlight-color: transparent;"
                        >
                            <!-- Round checkbox -->
                            <div
                                class="w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-colors duration-150"
                                :class="selectedYears.includes(year.id)
                                    ? 'bg-zinc-900 border-zinc-900'
                                    : 'bg-white border-zinc-300'"
                            >
                                <svg v-if="selectedYears.includes(year.id)" class="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>
                            <p class="text-[13px] text-zinc-700 leading-relaxed select-none">{{ year.name }}</p>
                        </div>

                        <!-- Export button -->
                        <button
                            v-if="years.length > 0"
                            type="button"
                            @click.stop="runExport"
                            :disabled="selectedYears.size === 0 || exporting"
                            class="w-full mt-1 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium transition-opacity disabled:opacity-30 active:opacity-70"
                            style="-webkit-tap-highlight-color: transparent;"
                        >
                            <span v-if="exporting">Exporting…</span>
                            <span v-else>Export {{ selectedYears.size > 0 ? `(${selectedYears.size})` : '' }}</span>
                        </button>

                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useYearStore } from '../stores/years'
import ImportExportService from '../services/importExport'

const fileInput      = ref(null)
const importing      = ref(false)
const importFeedback = ref(null)
const showExport     = ref(false)
const exporting      = ref(false)
const selectedYears  = ref([])

const yearStore = useYearStore()
const years     = computed(() => yearStore.years)

function triggerImport() {
    fileInput.value.click()
}

function onFileSelected(event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
        importing.value      = true
        importFeedback.value = null

        const success = await ImportExportService.importFromPlist(e.target.result)

        importing.value      = false
        importFeedback.value = success ? 'success' : 'error'
        setTimeout(() => importFeedback.value = null, 3000)
    }

    reader.readAsText(file)
    event.target.value = ''
}

function toggleExport() {
    showExport.value = !showExport.value
    if (!showExport.value) selectedYears.value = []
}

function toggleYear(id) {
    selectedYears.value.includes(id) ? selectedYears.value = selectedYears.value.filter(i => i !== id) : selectedYears.value.push(id)
}

async function runExport() {
    exporting.value = true
    for (const yearId of selectedYears.value) {
        const plist = await ImportExportService.exportYearToPlist(yearId)
        if (!plist) continue

        const year     = years.value.find(y => y.id === yearId)
        const filename = `${year?.name ?? yearId}.xml`
        const blob     = new Blob([plist], { type: 'application/xml' })
        const url      = URL.createObjectURL(blob)
        const a        = document.createElement('a')
        a.href         = url
        a.download     = filename
        a.click()
        URL.revokeObjectURL(url)
    }
    exporting.value     = false
    selectedYears.value = []
    showExport.value    = false
}
</script>