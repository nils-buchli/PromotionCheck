<template>
    <Teleport to="body">
        <Transition name="fade">
            <div 
                v-if="isOpen"
                @click="close"
                class="fixed inset-0 z-50 bg-black/20 flex items-center justify-center"
            >
                <transition name="popup">
                    <div 
                        v-if="isOpen"
                        @click.stop
                        class="bg-white rounded-2xl p-6 shadow-lg max-w-sm w-full mx-4"
                    >
                        <div class="mb-6">
                            <h2 class="text-lg font-semibold text-zinc-900">
                                Edit {{ elementType }}
                            </h2>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-zinc-900 mb-1">
                                    Title
                                </label>
                                <input 
                                    v-model="form.title"
                                    type="text"
                                    class="w-full rounded-xl border bg-zinc-100 px-4 py-2 text-sm 
                                           focus:outline-none focus:border-transparent focus:ring-2 focus:ring-zinc-700
                                           border-zinc-400 placeholder:text-zinc-700 text-zinc-900"
                                    placeholder="Enter title"
                                />
                            </div>

                            <div v-if="hasWeight">
                                <label class="block text-sm font-medium text-zinc-900 mb-1">
                                    Weight
                                </label>
                                <input 
                                    v-model.number="form.weight"
                                    type="number"
                                    step="0.1"
                                    class="w-full rounded-xl border bg-zinc-100 px-4 py-2 text-sm 
                                           focus:outline-none focus:border-transparent focus:ring-2 focus:ring-zinc-700
                                           border-zinc-400 placeholder:text-zinc-700 text-zinc-900"
                                    placeholder="0.0"
                                />
                            </div>

                            <div v-if="hasMark">
                                <label class="block text-sm font-medium text-zinc-900 mb-1">
                                    Mark
                                </label>
                                <input 
                                    v-model.number="form.mark"
                                    type="number"
                                    step="0.1"
                                    class="w-full rounded-xl border bg-zinc-100 px-4 py-2 text-sm 
                                           focus:outline-none focus:border-transparent focus:ring-2 focus:ring-zinc-700
                                           border-zinc-400 placeholder:text-zinc-700 text-zinc-900"
                                    placeholder="0.0"
                                />
                            </div>

                            <div v-if="hasDate">
                                <label class="block text-sm font-medium text-zinc-900 mb-1">
                                    Date
                                </label>
                                <input 
                                    v-model="form.date"
                                    type="date"
                                    class="w-full rounded-xl border bg-zinc-100 px-4 py-2 text-sm 
                                           focus:outline-none focus:border-transparent focus:ring-2 focus:ring-zinc-700
                                           border-zinc-400 text-zinc-900"
                                />
                            </div>
                        </div>

                        <div class="flex gap-3 mt-6">
                            <button 
                                @click="close"
                                class="flex-1 px-4 py-2 rounded-xl border border-zinc-300 text-zinc-900 
                                       hover:bg-zinc-100 transition-colors duration-150 font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                @click="save"
                                class="flex-1 px-4 py-2 rounded-xl bg-zinc-900 text-white 
                                       hover:bg-zinc-800 transition-colors duration-150 font-medium text-sm"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { useRoute } from 'vue-router'

    const route = useRoute()

    function getToday() {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    function convertToInputFormat(dateStr) {
        if (!dateStr) return getToday()  
        const [day, month, year] = dateStr.split('.')
        return `${year}-${month}-${day}`
    }

    const props = defineProps({
        isOpen: {
            type: Boolean,
            required: true
        },
        element: {
            type: Object,
            required: true
        },
        elementType: {
            type: String,
            required: true  
        }
    })

    const emit = defineEmits(['close', 'save'])

    const form = ref({
        title: props.element.name || '',
        weight: props.element.weight || 1.0,
        mark: props.element.mark || 0,
        date: convertToInputFormat(props.element.date),
    })

    const hasWeight = computed(() => route.name != 'years')
    const hasMark = computed(() => route.name == 'grades')
    const hasDate = computed(() => route.name == 'grades')


    const close = () => {
        emit('close')
    }

    const save = () => {
         let finalDate = form.value.date
         if (!finalDate) {
            finalDate = getToday()
        }

        const [year, month, day] = finalDate.split('-')
        finalDate = `${day}.${month}.${year}`

        emit('save', {
            name: form.value.title,
            weight: form.value.weight,
            mark: form.value.mark,
            date: finalDate,
        })
        close()
    }
</script>

<style scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.2s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }

    .popup-enter-active,
    .popup-leave-active {
        transition: all 0.2s ease;
    }

    .popup-enter-from,
    .popup-leave-to {
        opacity: 0;
        transform: scale(0.95);
    }
</style>