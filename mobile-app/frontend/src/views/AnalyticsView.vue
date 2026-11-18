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
                        v-if="hasMultipleYears"
                        @click="selectYear(SUMMARY)"
                        :class="[
                            'px-4 py-3 text-[15px] text-zinc-900 cursor-pointer transition-colors border-b border-zinc-100',
                            isSummary ? 'bg-zinc-50 font-semibold' : 'active:bg-zinc-50'
                        ]"
                    >
                        Summary
                    </div>
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
                <div v-if="!hasChartData" class="flex-1 flex flex-col items-center justify-center px-4">
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
                        <p v-if="!isSummary" class="text-2xl font-bold text-zinc-900">{{ currentAverage }}</p>
                        <div v-else class="flex flex-wrap gap-x-3 gap-y-1">
                            <div v-for="y in summaryYears" :key="y.year.id" class="flex items-center gap-1.5 text-[13px]">
                                <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: y.color }"></span>
                                <span class="text-zinc-600">{{ y.year.name }}</span>
                                <span class="font-semibold text-zinc-900">{{ settingsStore.round(subjectStore.averageByYear[y.year.id]) || '-' }}</span>
                            </div>
                        </div>
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

    // Summary: one line per year, colors assigned by the year's position (validated categorical palette)
    const SUMMARY        = 'summary'
    const SUMMARY_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948']

    // Summary area: below every line its own color, until the next line below it or the bottom.
    // Lines cross, so the chart is cut into strips (at every point of any line and every crossing) and
    // in each strip the areas are painted top line first, lowest line last. Painted opaque on a scratch
    // canvas, then laid over the chart with the same alpha as the single year fill (0.08).
    const summaryFillCanvas = document.createElement('canvas')
    const summaryFillPlugin = {
        id: 'summaryFill',
        beforeDatasetsDraw(chart) {
            const metas = chart.data.datasets.map((_, i) => chart.getDatasetMeta(i))
            const yAt = (m, x) => {
                const p = m.data
                for (let k = 0; k < p.length - 1; k++) {
                    if (x >= p[k].x && x <= p[k + 1].x) return p[k].y + (p[k + 1].y - p[k].y) * (x - p[k].x) / (p[k + 1].x - p[k].x)
                }
            }

            // between two neighbouring points (of any line) every line is straight, so a crossing is a sign change
            const points = [...new Set(metas.flatMap(m => m.data.map(p => p.x)))].sort((a, b) => a - b)
            const xs = [...points]
            for (let s = 0; s < points.length - 1; s++) for (let i = 0; i < metas.length; i++) for (let j = i + 1; j < metas.length; j++) {
                const d0 = yAt(metas[i], points[s]) - yAt(metas[j], points[s])
                const d1 = yAt(metas[i], points[s + 1]) - yAt(metas[j], points[s + 1])
                if (d0 * d1 < 0) xs.push(points[s] + (points[s + 1] - points[s]) * d0 / (d0 - d1))
            }
            xs.sort((a, b) => a - b)

            const dpr  = chart.currentDevicePixelRatio
            const off  = summaryFillCanvas
            off.width  = chart.canvas.width
            off.height = chart.canvas.height
            const octx = off.getContext('2d')

            for (let s = 0; s < xs.length - 1; s++) {
                const mid   = (xs[s] + xs[s + 1]) / 2
                const order = metas.filter(m => yAt(m, mid) !== undefined).sort((a, b) => yAt(a, mid) - yAt(b, mid))

                octx.save()
                octx.beginPath()
                octx.rect(Math.round(xs[s] * dpr), 0, Math.round(xs[s + 1] * dpr) - Math.round(xs[s] * dpr), off.height)
                octx.clip()
                octx.setTransform(dpr, 0, 0, dpr, 0, 0)
                for (const m of order) {
                    octx.beginPath()
                    m.dataset.path(octx)
                    octx.lineTo(m.data[m.data.length - 1].x, chart.chartArea.bottom)
                    octx.lineTo(m.data[0].x, chart.chartArea.bottom)
                    octx.closePath()
                    octx.fillStyle = m.dataset.options.borderColor
                    octx.fill()
                }
                octx.restore()
            }

            chart.ctx.save()
            chart.ctx.setTransform(1, 0, 0, 1, 0, 0)
            chart.ctx.globalAlpha = 0.08
            chart.ctx.drawImage(off, 0, 0)
            chart.ctx.restore()
        }
    }

    const hasMultipleYears = computed(() => yearStore.years.length > 1)

    const storedYearId   = globalStateStore.selectedAnalyticsYearId
    const defaultYearId  = yearStore.years.length > 1 ? SUMMARY : yearStore.years[0]?.id ?? null
    const selectedYearId = ref(storedYearId && (storedYearId !== SUMMARY || yearStore.years.length > 1) ? storedYearId : defaultYearId)

    const isSummary = computed(() => selectedYearId.value === SUMMARY)

    const summaryYears = computed(() => yearStore.years
        .map((year, i) => ({ year, color: SUMMARY_COLORS[i % SUMMARY_COLORS.length], averages: analyticsStore.yearAverages[year.id] || [] }))
        .filter(y => y.averages.length >= 2)
    )

    const selectedYear = computed(() => isSummary.value ? 'Summary' : yearStore.yearsById[selectedYearId.value]?.name || '-')

    const currentAverage = computed(() => settingsStore.round(subjectStore.averageByYear[selectedYearId.value]) || '-')

    const averageCount = computed(() => isSummary.value ? summaryYears.value.reduce((n, y) => n + y.averages.length, 0) : currentAverages.value.length)

    const currentAverages = computed(() => analyticsStore.yearAverages[selectedYearId.value] || [])

    const hasChartData = computed(() => isSummary.value ? summaryYears.value.length > 0 : currentAverages.value.length >= 2)

    const selectYear = (yearId) => {
        selectedYearId.value = yearId
        globalStateStore.selectedAnalyticsYearId = yearId
        dropdownOpen.value = false
    }

    const initChart = () => {
        if (!chartRef.value  || !selectedYearId.value) return

        const averages = currentAverages.value
        const summary  = isSummary.value

        if (summary ? summaryYears.value.length === 0 : averages.length === 0) return

        if (chartInstance) {
            chartInstance.destroy()
        }

        const values = summary ? summaryYears.value.flatMap(y => y.averages.map(a => a.average)) : averages.map(a => a.average)

        const yMin = Math.min(...values) - 0.1
        const yMax = Math.max(...values) + 0.1

        const ctx = chartRef.value.getContext('2d')
        chartInstance = new Chart(ctx, {
            type: 'line',
            plugins: summary ? [summaryFillPlugin] : [],
            data: {
                labels: averages.map(a => a.date),
                datasets: summary ? summaryYears.value.map(y => ({
                    label: y.year.name,
                    // Summary: every year is stretched over the full width (x from 0 to 1), more tests = more detail
                    data: y.averages.map((a, i) => ({ x: i / (y.averages.length - 1), y: a.average })),
                    borderColor: y.color,
                    borderWidth: 2.5,
                    fill: false, // area is drawn by summaryFillPlugin
                    tension: 0.1,
                    pointRadius: 0,
                    pointBackgroundColor: y.color,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: y.color
                })) : [{
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
                    mode: summary ? 'nearest' : 'index'
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
                        ...(summary ? { type: 'linear', min: 0, max: 1 } : {}),
                        grid: {
                            display: false
                        },
                        ticks: {
                            display: !summary,
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

    watch([currentAverages, summaryYears], () => initChart(), { flush: 'post' })

    watch(selectedYearId, () => initChart(), { flush: 'post' })

    onMounted(() => {
        initChart()
    })
</script>
