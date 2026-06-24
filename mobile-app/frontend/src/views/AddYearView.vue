<template>
    <div class="flex flex-col flex-1 bg-zinc-50">

        <!-- Input group -->
        <div class="mt-6 mx-5">
            <label for="year-name" class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1 block">Name</label>
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden focus-within:border-zinc-400 transition-colors">
                <input
                    id="year-name"
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
                        isInvalid ? 'text-red-500' : ''
                    ]"
                />
            </div>
            <p
                class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                :class="isInvalid ? 'opacity-100' : 'opacity-0'"
                role="alert"
            >
                Please enter a name.
            </p>
        </div>

        <!-- Submit -->
        <div class="mx-5 mt-4">
            <button
                type="button"
                @click="submit"
                :disabled="submitting"
                class="w-full bg-primary active:bg-primary-dark disabled:opacity-50 text-white text-[15px] font-medium rounded-2xl py-3.5 transition-colors duration-150"
            >
                Add Year
            </button>
        </div>

    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { useYearStore } from '../stores/years'

const router    = useRouter()
const yearStore = useYearStore()

const name       = ref('')
const touched    = ref(false)
const submitting = ref(false)

const isInvalid = computed(() => touched.value && !name.value.trim())

async function submit() {
    touched.value = true
    if (isInvalid.value || submitting.value) return
    submitting.value = true
    await yearStore.addYear(name.value.trim())
    router.replace('/years')
}
</script>
