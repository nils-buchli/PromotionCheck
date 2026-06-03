<template>
    <div v-if="elements.length < 1" class="flex-1 flex items-center justify-center">
        <p class="text-[13px] text-zinc-400">No {{ elementType != 'subSubject' ? elementType + 's' : 'sub-subjects' }} yet.</p>
    </div>
    <main v-else class="flex flex-col h-full">

        <!-- Summary Strip -->
        <div v-if="showStrip" class="flex-shrink-0 flex justify-center items-center bg-white border-b border-zinc-200 px-5 py-3 gap-0">

            <!-- Schnitt -->
            <div class="flex flex-col gap-0.5 items-center">
                <span class="text-[17px] font-bold text-zinc-900 leading-none tracking-tight tabular-nums">{{ average ? average : '-' }}</span>
                <span class="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">Average</span>
            </div>

            <!-- Sparkline -->
            <template v-if="showSparkline && sparkData.length > 1">
                <div class="mx-2 flex-shrink-0" />
                <div class="flex flex-col gap-0.5 items-center">
                    <div style="width: 72px; height: 28px; position: relative;">
                        <canvas ref="sparkRef"></canvas>
                    </div>
                </div>
            </template>

            <!-- Punkte -->
            <template v-if="settingsStore.showPluspoints">
                <div class="w-px h-7 bg-zinc-200 mx-4 flex-shrink-0" />
                <div class="flex flex-col gap-0.5 items-center">
                    <span
                        class="text-[17px] font-bold leading-none tracking-tight tabular-nums"
                        :class="{
                            'text-emerald-500': pluspoints.value > (props.elementType == 'subject' ? settingsStore.coloring.yearMax : settingsStore.coloring.subjectMax),
                            'text-orange-500': pluspoints.value >= (props.elementType == 'subject' ? settingsStore.coloring.yearMin : settingsStore.coloring.subjectMin) && pluspoints.value <= (props.elementType == 'subject' ? settingsStore.coloring.yearMax : settingsStore.coloring.subjectMax),
                            'text-red-500': pluspoints.value < (props.elementType == 'subject' ? settingsStore.coloring.yearMin : settingsStore.coloring.subjectMin), 
                            'text-zinc-900': pluspoints.value == null, 
                        }"
                    >{{ pluspoints.display }}</span>
                    <span class="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">Pluspoints</span>
                </div>
            </template>

            <div class="w-px h-7 bg-zinc-200 mx-4 flex-shrink-0" />

            <!-- Elemente -->
            <div class="flex flex-col gap-0.5 items-center">
                <span class="text-[17px] font-bold text-zinc-900 leading-none tracking-tight tabular-nums">{{ elementCount }}</span>
                <span class="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">Elements</span>
            </div>
        </div>
        
        <!-- Scrollbare Liste -->
        <div class="flex-1 overflow-y-auto">
            <div v-for="element in elements" :key="element.id">
                <ListElement :element="element" />
            </div>
        </div>

    </main>
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'

import { useYearStore }       from '../stores/years'
import { useSubjectStore }    from '../stores/subjects'
import { useGradeStore }      from '../stores/grades'
import { useSubSubjectStore } from '../stores/subsubjects'
import { useAnalyticsStore }  from '../stores/analytics'
import { useSettingsStore } from '../stores/settings'

import ListElement from './ListElement.vue'

const yearStore       = useYearStore()
const subjectStore    = useSubjectStore()
const subSubjectStore = useSubSubjectStore()
const gradeStore      = useGradeStore()
const analyticsStore  = useAnalyticsStore()
const settingsStore   = useSettingsStore()

const props = defineProps({
    elementType: { type: String, required: true },
    addrId:      { type: String, default: null },
})

const elements = computed(() => {
    switch (props.elementType) {
        case 'year':    
            const years = yearStore.years   
            return years ? settingsStore.sortYear(years) : [] 
        case 'subject':    
            const subjects = subjectStore.subjectsByYear[props.addrId]
            return subjects ? settingsStore.sortSubject(subjects) : []
        case 'subSubject': 
            const subSubjects = subSubjectStore.subSubjectsBySubject[props.addrId]
            return subSubjects ? settingsStore.sortSubject(subSubjects) : []
        case 'grade':      
            const grades = gradeStore.gradesBySubject[props.addrId]
            return grades ? settingsStore.sortGrade(grades) : []
    }
})

const elementCount = computed(() => elements.value.length)

const average = computed(() => {
    let avg = null
    
    switch (props.elementType) {
        case 'subject':    
            avg = settingsStore.round(subjectStore.averageByYear[props.addrId])
            break
        case 'subSubject': 
            avg = settingsStore.round(subSubjectStore.averageBySubject[props.addrId])
            break 
        case 'grade':      
            avg = settingsStore.round(gradeStore.averageBySubject[props.addrId])
            break
    }

    return avg != null ? avg : '-'
})

const pluspoints = computed(() => {
    let pp = null

    switch (props.elementType) {
        case 'subject':
            pp = subjectStore.getPlusPointsByYear()[props.addrId]
            break
        case 'subSubject': 
            pp = gradeStore.getPlusPointsBySubject()[props.addrId]
            break
        case 'grade':
            if (!subSubjectStore.subSubjectById[props.addrId])
            pp = gradeStore.getPlusPointsBySubject()[props.addrId]
            break
    }

    if (pp == null) return {display: '-', value: null}
    else return {display: `${pp < 0 ? '-' : '+'}${Math.abs(pp)}`, value: pp}
})

const showStrip = computed(() => props.elementType !== 'year' && elements.value.length > 0)

const showSparkline = computed(() =>
    props.elementType === 'grade'
)

// Hardcoded sparkline data (später durch echte Daten ersetzen)
const sparkData = computed(() => {
    if (showSparkline.value) return analyticsStore.getSparkDataForSubject(props.addrId)
    else return null
})

// Chart
const sparkRef = ref(null)
let sparkInstance = null

const initSparkline = () => {
    if (!sparkRef.value) return

    if (sparkInstance) {
        sparkInstance.destroy()
        sparkInstance = null
    }

    const values = sparkData.value
    const yMin = Math.min(...values) - 0.1
    const yMax = Math.max(...values) + 0.1

    const ctx = sparkRef.value.getContext('2d')
    sparkInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: values.map((_, i) => i),
            datasets: [{
                data: values,
                borderColor: '#1f2937',
                backgroundColor: 'rgba(31, 41, 55, 0.08)',
                borderWidth: 1.5,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            layout: { padding: 0 },
            interaction: { mode: 'none' },
            events: [],
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
            scales: {
                x: { display: false },
                y: { display: false, min: yMin, max: yMax },
            }
        }
    })
}

watch(showSparkline, (val) => {
    if (val) nextTick(() => initSparkline())
    else if (sparkInstance) { sparkInstance.destroy(); sparkInstance = null }
})

onMounted(() => {
    if (showSparkline.value) nextTick(() => initSparkline())
})
</script>