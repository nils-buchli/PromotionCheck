<template>
    <div class="flex flex-1 items-start justify-center bg-zinc-50">
        <form novalidate @submit.prevent="submit" class="w-full max-w-sm bg-zinc-100 rounded-2xl p-6 m-10 shadow-sm border border-zinc-200 space-y-4">
            <div>
                <label class="block text-sm font-medium text-zinc-900 mb-1">Name</label>
                <input 
                    v-model="name"
                    type="text" 
                    autofocus
                    required
                    placeholder="Syntax" 
                    :class="[
                        'w-full rounded-xl border bg-zinc-100 px-4 py-2 text-sm focus:outline-none focus:border-transparent placeholder:text-zinc-700 text-zinc-900', 
                        isNameInvalid ? 
                        'border-red-700 ring-2 ring-red-700' : 
                        'border-zinc-400 focus:ring-2 focus:ring-zinc-700'
                    ]"
                    @blur="touched=true"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-zinc-900 mb-1">Mark</label>
                <input 
                    v-model="mark"
                    type="number" 
                    required
                    placeholder="4.5" 
                    :class="[
                        'w-full rounded-xl border bg-zinc-100 px-4 py-2 text-sm focus:outline-none focus:border-transparent placeholder:text-zinc-700 text-zinc-900', 
                        isWeightInvalid ? 
                        'border-red-700 ring-2 ring-red-700' : 
                        'border-zinc-400 focus:ring-2 focus:ring-zinc-700'
                    ]"
                    @blur="touched=true"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-zinc-900 mb-1">Weight</label>
                <input 
                    v-model="weight"
                    type="number" 
                    required
                    placeholder="1.0" 
                    :class="[
                        'w-full rounded-xl border bg-zinc-100 px-4 py-2 text-sm focus:outline-none focus:border-transparent placeholder:text-zinc-700 text-zinc-900', 
                        isWeightInvalid ? 
                        'border-red-700 ring-2 ring-red-700' : 
                        'border-zinc-400 focus:ring-2 focus:ring-zinc-700'
                    ]"
                    @blur="touched=true"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-zinc-900 mb-1">Datum</label>
                <input v-model="date" type="date" placeholder="dd.mm.yyyy" required :class="[
                        'w-full rounded-xl border bg-zinc-100 px-4 py-2 text-sm focus:outline-none focus:border-transparent text-zinc-900', 
                        isDateInvalid ? 
                        'border-red-700 ring-2 ring-red-700' : 
                        'border-zinc-400 focus:ring-2 focus:ring-zinc-700'
                    ]"
                    @blur="touched=true"
                />
            </div>
            <button type="submit" class="w-full rounded-xl bg-zinc-900 py-2 text-sm font-medium text-white active:bg-zinc-700 transition">Add Grade</button>
        </form>
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
    const name = ref('')
    const mark = ref()
    const weight = ref(1.0)
    const date = ref(getToday())
    const touched = ref(false)

    const formattedDate = computed(() => {
        if (!date.value) return ''
        const [year, month, day] = date.value.split('-')
        return `${day}.${month}.${year}`
    })

    const isNameInvalid = computed(() => touched.value && !name.value.trim())
    const isMarkInvalid = computed(() => touched.value && !mark.value)
    const isWeightInvalid = computed(() => touched.value && !weight.value)
    const isDateInvalid = computed(() => touched.value && !date.value)

    async function submit() {
        touched.value = true    
        if (isNameInvalid.value || isWeightInvalid.value || isMarkInvalid.value || !isDateInvalid) return 
        
        await gradeStore.addGrade(name.value, mark.value, weight.value, formattedDate.value, route.params.subjectId)

        router.back()
    }

</script>