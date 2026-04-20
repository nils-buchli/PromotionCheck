<template>
    <div class="flex flex-col flex-1 bg-zinc-50">

        <!-- Name -->
        <div class="mt-6 mx-5">
            <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Name</p>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <input
                    v-model="name"
                    type="text"
                    autofocus
                    required
                    placeholder="Name"
                    @blur="touched = true"
                    :class="[
                        'w-full px-4 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isNameInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isNameInvalid ? 'opacity-100' : 'opacity-0'"
            >
                Please enter a name. 
            </p>
        </div>

        <!-- Weight -->
        <div class="mt-2 mx-5">
            <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Weight</p>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <input
                    v-model="weight"
                    type="number"
                    required
                    placeholder="Weight"
                    step="0.5"
                    min="0"
                    @blur="touched = true"
                    :class="[
                        'w-full px-4 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isWeightInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isWeightInvalid ? 'opacity-100' : 'opacity-0'"
            >
                Please enter a weight. 
            </p>
        </div>

        <!-- Sub-subjects toggle (only for subjects, not sub-subjects) -->
        <div v-if="!isSubSubject" class="mt-2 mx-5">
            <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Sub-subjects</p>
            <div
                class="bg-white rounded-2xl border border-zinc-200 px-4 py-3.5 flex items-center justify-between cursor-pointer"
                @click="hasSubSubject = !hasSubSubject"
                style="-webkit-tap-highlight-color: transparent;"
            >
                <span class="text-[15px] text-zinc-900">Has sub-subjects</span>

                <!-- Toggle -->
                <button
                    type="button"
                    role="switch"
                    :aria-checked="hasSubSubject"
                    class="relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border transition-all duration-200 focus:outline-none"
                    :class="hasSubSubject ? 'bg-zinc-900 border-zinc-900' : 'bg-zinc-200 border-zinc-200'"
                    @click.stop="hasSubSubject = !hasSubSubject"
                >
                    <span
                        class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200"
                        :class="hasSubSubject ? 'translate-x-5' : 'translate-x-1'"
                    />
                </button>
            </div>
        </div>

        <!-- Submit -->
        <div class="mx-5 mt-4">
            <button
                type="button"
                @click="submit"
                class="w-full bg-zinc-100 active:bg-zinc-200 text-zinc-700 text-[15px] font-medium rounded-2xl py-3.5 transition-colors duration-150 border border-zinc-200"
                style="-webkit-tap-highlight-color: transparent;"
            >
                {{ isSubSubject ? 'Add sub-subject' : 'Add subject' }}
            </button>
        </div>

    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'

import { useSubjectStore }    from '../stores/subjects'
import { useSubSubjectStore } from '../stores/subsubjects'

const route  = useRoute()
const router = useRouter()

const subjectStore    = useSubjectStore()
const subSubjectStore = useSubSubjectStore()

const isSubSubject = route.name === 'addSubSubject'

const name          = ref('')
const weight        = ref(1.0)
const hasSubSubject = ref(false)
const touched       = ref(false)

const isNameInvalid   = computed(() => touched.value && !name.value.trim())
const isWeightInvalid = computed(() => touched.value && weight.value === '')

async function submit() {
    touched.value = true
    if (isNameInvalid.value || isWeightInvalid.value) return

    if (isSubSubject) {
        await subSubjectStore.addSubSubject(name.value.trim(), weight.value, route.params.subjectId)
    } else {
        await subjectStore.addSubject(name.value.trim(), weight.value, route.params.yearId, hasSubSubject.value)
    }

    router.back()
}
</script>