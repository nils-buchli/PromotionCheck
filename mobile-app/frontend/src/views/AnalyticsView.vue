<template>
    <main class="flex flex-col h-full">
        <!-- Custom Year Dropdown -->
        <div class="px-4 py-3 bg-white border-b border-zinc-200/50 flex-shrink-0">
            <div class="relative">
                <button
                    @click="dropdownOpen = !dropdownOpen"
                    class="w-full px-4 py-2 rounded-xl bg-zinc-100 border border-zinc-300 text-left text-sm text-zinc-900 font-medium hover:bg-zinc-200 transition flex items-center justify-between"
                >
                    <span>{{ selectedYear }}</span>
                    <svg 
                        :class="['w-4 h-4 transition', dropdownOpen ? 'rotate-180' : '']"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </button>

                <!-- Dropdown Menu -->
                <div 
                    v-if="dropdownOpen"
                    class="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-300 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                    <div 
                        v-for="year in years" 
                        :key="year.id"
                        @click="selectYear(year.id)"
                        :class="[
                            'px-4 py-2 text-sm text-zinc-900 cursor-pointer transition',
                            selectedYearId === year.id ? 'bg-zinc-100 font-medium' : 'hover:bg-zinc-50'
                        ]"
                    >
                        {{ year.name }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Chart Container - No Scrolling -->
        <div class="flex-1 flex flex-col min-h-0">
            <div class="flex-1 px-4 py-4 min-h-0 flex flex-col">
                <div class="bg-white rounded-2xl p-4 border border-zinc-200/50 shadow-sm flex-1 flex flex-col overflow-hidden">
                    <div class="mb-3 flex-shrink-0">
                        <p class="text-xs text-zinc-500 mb-1">Notenschnitt Verlauf</p>
                        <p class="text-2xl font-bold text-zinc-900">{{ currentAverage }}</p>
                    </div>
                    
                    <div class="flex-1 relative min-h-0">
                        <canvas ref="chartRef"></canvas>
                    </div>

                    <!-- Info Text -->
                    <div class="pt-3 border-t border-zinc-100 flex-shrink-0">
                        <p class="text-xs text-zinc-500">
                            <span class="font-medium">{{ gradeCount }}</span> Noten erfasst
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
    import { ref, computed, watch, onMounted } from 'vue'
    import Chart from 'chart.js/auto'

    const chartRef = ref(null)
    let chartInstance = null
    const dropdownOpen = ref(false)

    const years = [
        { id: '1', name: '2024' },
        { id: '2', name: '2025' }
    ]

    const gradesData = {
        '1': [
            { date: '01.09', mark: 4.0 },
            { date: '15.09', mark: 4.2 },
            { date: '01.10', mark: 4.1 },
            { date: '20.10', mark: 4.3 },
            { date: '05.11', mark: 4.5 },
            { date: '22.11', mark: 4.4 },
            { date: '10.12', mark: 4.6 }
        ],
        '2': [
            { date: '15.01', mark: 3.9 },
            { date: '02.02', mark: 4.0 },
            { date: '20.02', mark: 4.2 },
            { date: '08.03', mark: 4.1 },
            { date: '25.03', mark: 4.3 }
        ]
    }

    const selectedYearId = ref('1')

    const selectedYear = computed(() => {
        return years.find(y => y.id === selectedYearId.value)?.name || ''
    })

    const currentGrades = computed(() => gradesData[selectedYearId.value] || [])

    const currentAverage = computed(() => {
        if (currentGrades.value.length === 0) return '-'
        const avg = currentGrades.value.reduce((sum, g) => sum + g.mark, 0) / currentGrades.value.length
        return (Math.round(avg * 100) / 100).toFixed(2)
    })

    const gradeCount = computed(() => currentGrades.value.length)

    const selectYear = (yearId) => {
        selectedYearId.value = yearId
        dropdownOpen.value = false
    }

    const initChart = () => {
        if (!chartRef.value) return

        const grades = currentGrades.value

        if (grades.length === 0) return

        if (chartInstance) {
            chartInstance.destroy()
        }

        const ctx = chartRef.value.getContext('2d')
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: grades.map(g => g.date),
                datasets: [{
                    label: 'Notenschnitt',
                    data: grades.map(g => g.mark),
                    borderColor: '#1f2937',
                    backgroundColor: 'rgba(31, 41, 55, 0.08)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 2.5,
                    pointBackgroundColor: '#1f2937',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: '#1f2937'
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
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 10,
                        titleFont: {
                            size: 12,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        },
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return 'Schnitt: ' + context.parsed.y.toFixed(2)
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 1,
                        max: 6,
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
                            padding: 2
                        }
                    }
                }
            }
        })
    }

    watch(selectedYearId, () => {
        initChart()
    })

    onMounted(() => {
        initChart()
    })
</script>

<style scoped>
</style>