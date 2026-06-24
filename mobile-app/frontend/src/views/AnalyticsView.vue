<template>
    <div v-if="yearStore.years.length === 0" class="flex-1 flex flex-col items-center justify-center px-8">
        <div class="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
            </svg>
        </div>
        <p class="text-[15px] font-medium text-zinc-500 mb-1">No data yet</p>
        <p class="text-[13px] text-zinc-400 text-center leading-relaxed">Add years and grades to see your analytics</p>
    </div>
    <main v-else class="flex flex-col h-full w-full overflow-hidden">
        <div class="px-4 py-3 bg-white border-b border-zinc-200/50 flex-shrink-0 w-full">
            <div class="relative">
                <button
                    @click="dropdownOpen = !dropdownOpen"
                    class="w-full px-4 py-3.5 rounded-2xl bg-white border border-zinc-200 text-left text-[15px] text-zinc-900 font-medium active:bg-zinc-50 transition-colors flex items-center justify-between"
                    aria-label="Select year"
                >
                    <span>{{ selectedYear }}</span>
                    <svg
                        :class="['w-4 h-4 transition-transform duration-200 flex-shrink-0 text-zinc-400', dropdownOpen ? 'rotate-180' : '']"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>

                <div
                    v-if="dropdownOpen"
                    class="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-2xl shadow-lg z-30 overflow-hidden"
                >
                    <div
                        v-for="year in yearStore.years"
                        :key="year.id"
                        @click="selectYear(year.id)"
                        :class="[
                            'px-4 py-3 text-[15px] text-zinc-900 cursor-pointer transition-colors',
                            selectedYearId === year.id ? 'bg-zinc-50 font-semibold' : 'active:bg-zinc-50'
                        ]"
                    >
                        {{ year.name }}
                    </div>
                </div>
            </div>
        </div>

        <div class="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
            <div class="flex-1 px-3 py-3 min-h-0 flex flex-col w-full overflow-hidden">
                <div v-if="currentAverages.length < 2" class="flex-1 flex flex-col items-center justify-center px-4">
                    <div class="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-3">
                        <svg class="w-5 h-5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                    </div>
                    <p class="text-[13px] text-zinc-400 text-center leading-relaxed">Add at least 2 grades to see the progression chart</p>
                </div>
                <div v-else class="bg-white rounded-2xl p-3 border border-zinc-200/50 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div class="mb-2 flex-shrink-0">
                        <p class="text-xs text-zinc-500 mb-1">Average progression</p>
                        <p class="text-2xl font-bold text-zinc-900">{{ currentAverage }}</p>
                    </div>

                    <div class="flex-1 h-0 relative w-full">
                        <canvas ref="chartRef" class="absolute inset-0 w-full h-full"></canvas>
                    </div>

                    <div class="pt-2 border-t border-zinc-100 flex-shrink-0">
                        <p class="text-xs text-zinc-500">
                            <span class="font-medium">{{ averageCount }}</span> grades processed
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
    import { ref, computed, watch, onMounted, nextTick  } from 'vue'
    import Chart from 'chart.js/auto'
    import { useYearStore } from '../stores/years'
    import { useGradeStore } from '../stores/grades'
    import { useSubjectStore } from '../stores/subjects'
    import { useSettingsStore } from '../stores/settings'
    import { useAnalyticsStore } from '../stores/analytics'
    import { useGlobalStatesStore } from '../stores/globalStates'

    const chartRef        = ref(null)
    let chartInstance     = null
    const dropdownOpen    = ref(false)

    const yearStore        = useYearStore()
    const gradeStore       = useGradeStore()
    const subjectStore     = useSubjectStore()
    const settingsStore    = useSettingsStore()
    const analyticsStore   = useAnalyticsStore()
    const globalStateStore = useGlobalStatesStore()


    const selectedYearId = ref(globalStateStore.selectedAnalyticsYearId ? globalStateStore.selectedAnalyticsYearId : yearStore.years[0]?.id ?? null)

    const selectedYear = computed(() => yearStore.yearsById[selectedYearId.value]?.name || '-')

    const currentAverage = computed(() => settingsStore.round(subjectStore.averageByYear[selectedYearId.value]) || '-')

    const averageCount = computed(() => currentAverages.value.length)

    const currentAverages = computed(() => analyticsStore.yearAverages[selectedYearId.value] || [])

    const selectYear = (yearId) => {
        selectedYearId.value = yearId
        globalStateStore.selectedAnalyticsYearId = yearId
        dropdownOpen.value = false
    }

    const initChart = () => {
        if (!chartRef.value  || !selectedYearId.value) return

        const averages = currentAverages.value

        if (averages.length === 0) return

        if (chartInstance) {
            chartInstance.destroy()
        }

        const values = averages.map(a => a.average)

        const yMin = Math.min(...values) - 0.1
        const yMax = Math.max(...values) + 0.1

        const ctx = chartRef.value.getContext('2d')
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: averages.map(a => a.date),
                datasets: [{
                    label: 'Average',
                    data: values,
                    borderColor: 'rgb(26, 60, 143)',
                    backgroundColor: 'rgba(26, 60, 143, 0.08)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.1,
                    pointRadius: 0,
                    pointBackgroundColor: 'rgb(26, 60, 143)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: 'rgb(26, 60, 143)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 0
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: null
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: yMin,
                        max: yMax,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#a1a1a1',
                            font: {
                                size: 10
                            },
                            padding: 4
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a1a1a1',
                            font: {
                                size: 9
                            },
                            padding: 2,

                            callback: function(value, index) {
                                const step = Math.ceil(averages.length / 6)
                                return index % step === 0 ? averages[index].date : ''
                            }
                        }
                    }
                }
            }
        })
    }

    watch(
        () => JSON.stringify(gradeStore.grades),
        () => analyticsStore.init()
    )

    watch(currentAverages, () => initChart())

    watch(selectedYearId, () => initChart())

    onMounted(() => {
        initChart()
    })
</script>
