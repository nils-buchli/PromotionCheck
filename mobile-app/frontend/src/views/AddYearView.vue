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
                    placeholder="Gym 1" 
                    :class="[
                        'w-full rounded-xl border bg-zinc-100 px-4 py-2 text-sm focus:outline-none focus:border-transparent placeholder:text-zinc-700 text-zinc-900', 
                        isInvalid ? 
                        'border-red-700 ring-2 ring-red-700' : 
                        'border-zinc-400 focus:ring-2 focus:ring-zinc-700'
                    ]"
                    @blur="touched=true"
                />
            </div>
            <button type="submit" class="w-full rounded-xl bg-zinc-900 py-2 text-sm font-medium text-white active:bg-zinc-700 transition">Add Year</button>
        </form>
    </div>
</template>

<script setup>  
    import { useRouter } from 'vue-router'
    import { computed, ref } from 'vue'
    
    import { useYearStore } from '../stores/years'

    const router = useRouter()

    const yearStore = useYearStore()
    const name = ref('')
    const touched = ref(false)

    const isInvalid = computed(() => touched.value && !name.value.trim())

    async function submit() {
        touched.value = true 
        if (isInvalid.value) return 
        
        await yearStore.addYear(name.value.trim())

        router.replace('/years')
    }

</script>