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
                    placeholder="Physics" 
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
            <div v-if="!isSubSubject" class="flex flex-col justify-between">
                <label class="block text-sm font-medium mb-1 text-zinc-900">
                    Sub-subjects
                </label>
                <button
                    type="button"
                    role="switch"
                    :aria-checked="hasSubSubject"
                    @click="hasSubSubject = !hasSubSubject"
                    class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full 
                        border transition-all duration-200 ease-out focus:outline-none"
                    :class="hasSubSubject
                        ? 'bg-zinc-900 border-zinc-900'
                        : 'bg-zinc-200 border-zinc-300'"
                >
                    <span class="absolute inset-0 rounded-full" :class="hasSubSubject ? 'shadow-inner' : ''"/>

                    <span
                        class="pointer-events-none inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 transform transition-all duration-200"
                        :class="hasSubSubject ? 'translate-x-6' : 'translate-x-1'"
                    >
                        <svg v-if="hasSubSubject" class="h-3 w-3 text-zinc-900" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 011.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z" clip-rule="evenodd"/>
                        </svg>
                    </span>
                </button>
            </div>
            <button type="submit" class="w-full rounded-xl bg-zinc-900 py-2 text-sm font-medium text-white active:bg-zinc-700 transition">Add Subject</button>
        </form>
    </div>
</template> 

<script setup>  
    import { useRoute, useRouter } from 'vue-router'
    import { computed, ref } from 'vue'
    
    import { useSubjectStore } from '../stores/subjects'
    import { useSubSubjectStore } from '../stores/subsubjects'

    const route = useRoute()
    const router = useRouter()

    const subjectStore = useSubjectStore()
    const subSubjectStore = useSubSubjectStore()

    const isSubSubject = route.name == 'addSubSubject'

    const name = ref('')
    const weight = ref(1.0)
    const hasSubSubject = ref(false)
    const touched = ref(false)

    const isNameInvalid = computed(() => touched.value && !name.value.trim())
    const isWeightInvalid = computed(() => touched.value && !weight.value)

    async function submit() {
        touched.value = true    
        if (isNameInvalid.value || isWeightInvalid.value) return 
        
        if (isSubSubject) {
            await subSubjectStore.addSubSubject(name.value, weight.value, route.params.subjectId)
        } else {
            await subjectStore.addSubject(name.value, weight.value, route.params.yearId, hasSubSubject.value)
        }
        
        router.back()
    }

</script>