<template>
    <div class="flex flex-col flex-1 bg-zinc-50">

        <!-- Name -->
        <div class="mt-6 mx-5">
            <label for="subject-name" class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1 block">Name</label>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden focus-within:border-zinc-400 transition-colors">
                <input
                    id="subject-name"
                    v-model="name"
                    type="text"
                    inputmode="text"
                    autocomplete="off"
                    autofocus
                    required
                    placeholder="Name"
                    @blur="touched = true"
                    :class="[
                        'w-full px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isNameInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isNameInvalid ? 'opacity-100' : 'opacity-0'"
                role="alert"
            >
                Please enter a name.
            </p>
        </div>

        <!-- Weight -->
        <div class="mt-2 mx-5">
            <label for="subject-weight" class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1 block">Weight</label>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden focus-within:border-zinc-400 transition-colors">
                <input
                    id="subject-weight"
                    v-model="weight"
                    type="number"
                    inputmode="decimal"
                    required
                    placeholder="Weight"
                    step="0.5"
                    min="0"
                    @blur="touched = true"
                    :class="[
                        'w-full px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-300 bg-transparent focus:outline-none',
                        isWeightInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isWeightInvalid ? 'opacity-100' : 'opacity-0'"
                role="alert"
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
            >
                <span class="text-base text-zinc-900">Has sub-subjects</span>

                <!-- Toggle -->
                <button
                    type="button"
                    role="switch"
                    :aria-checked="hasSubSubject"
                    class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-all duration-200"
                    :class="hasSubSubject ? 'bg-primary border-primary' : 'bg-zinc-200 border-zinc-200'"
                    @click.stop="hasSubSubject = !hasSubSubject"
                >
                    <span
                        class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200"
                        :class="hasSubSubject ? 'translate-x-6' : 'translate-x-1'"
                    />
                </button>
            </div>
        </div>

        <!-- Submit -->
        <div class="mx-5 mt-4">
            <button
                type="button"
                @click="submit"
                :disabled="submitting"
                class="w-full bg-primary active:bg-primary-dark disabled:opacity-50 text-white text-[15px] font-medium rounded-2xl py-3.5 transition-colors duration-150"
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
const submitting    = ref(false)

const isNameInvalid   = computed(() => touched.value && !name.value.trim())
const isWeightInvalid = computed(() => touched.value && weight.value === '')

async function submit() {
    touched.value = true
    if (isNameInvalid.value || isWeightInvalid.value || submitting.value) return

    submitting.value = true
    if (isSubSubject) {
        await subSubjectStore.addSubSubject(name.value.trim(), weight.value, route.params.subjectId)
    } else {
        await subjectStore.addSubject(name.value.trim(), weight.value, route.params.yearId, hasSubSubject.value)
    }

    router.back()
}
</script>
