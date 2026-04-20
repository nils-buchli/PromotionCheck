<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        @click="close"
        class="fixed inset-0 z-50 bg-black/20 flex items-center justify-center"
      >
        <Transition name="popup">
          <div
            v-if="isOpen"
            @click.stop
            class="bg-zinc-50 rounded-3xl shadow-lg w-full mx-4 max-w-sm overflow-hidden"
          >
            <!-- Header -->
            <div class="px-5 pt-5 pb-2">
              <h2 class="text-[17px] font-semibold text-zinc-900">Dream Average Calculator</h2>
            </div>

            <!-- Fields -->
            <div class="px-5 pb-2">

              <!-- Wunschdurchschnitt -->
              <div class="mt-3">
                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Dream-average</p>
                <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                  <input
                    v-model.number="form.dreamAvg"
                    type="number"
                    step="0.1"
                    min="1"
                    max="6"
                    placeholder="Grade"
                    @blur="touched.dreamAvg = true"
                    :class="[
                      'w-full px-4 py-3.5 text-[15px] bg-transparent focus:outline-none placeholder:text-zinc-300',
                      isDreamAvgInvalid ? 'text-red-500' : 'text-zinc-900'
                    ]"
                  />
                </div>
                <p
                  class="text-[11px] text-red-400 mt-1.5 px-1 transition-opacity duration-150"
                  :class="isDreamAvgInvalid ? 'opacity-100' : 'opacity-0'"
                >
                  Please enter your dream-average.
                </p>
              </div>

              <!-- Gewichtung -->
              <div class="mt-1">
                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">Weight</p>
                <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                  <input
                    v-model.number="form.weight"
                    placeholder="Weight"
                    type="number"
                    step="0.5"
                    min="0"
                    @blur="touched.weight = true"
                    :class="[
                      'w-full px-4 py-3.5 text-[15px] bg-transparent focus:outline-none placeholder:text-zinc-300',
                      isWeightInvalid ? 'text-red-500' : 'text-zinc-900'
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

              <!-- Benötigte Note -->
              <div class="mt-4 bg-white rounded-2xl border border-zinc-200 px-4 py-3.5 flex items-center justify-between">
                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Required grade</p>
                <span
                  class="text-[22px] font-semibold"
                  :class="neededGrade !== null && neededGrade > 6 ? 'text-red-500' : 'text-zinc-900'"
                >
                  {{ neededGrade !== null ? settingsStore.round(neededGrade) : '–' }}
                </span>
              </div>

            </div>

            <!-- Buttons -->
            <div class="flex gap-3 px-5 py-5 mt-1">
              <button
                @click="close"
                class="flex-1 py-3.5 rounded-2xl border border-zinc-200 bg-zinc-100 active:bg-zinc-200 text-zinc-500 text-[15px] font-medium transition-colors duration-150"
                style="-webkit-tap-highlight-color: transparent;"
              >
                Close
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGradeStore } from '../stores/grades'
import { useSettingsStore } from '../stores/settings'

const gradeStore = useGradeStore()
const settingsStore = useSettingsStore()

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  elementId: { type: Boolean, required: true }
})

const emit = defineEmits(['close'])

const form = ref({
  dreamAvg: null,
  weight: 1,
})

const touched = ref({ dreamAvg: false, weight: false })

const isDreamAvgInvalid = computed(() => touched.value.dreamAvg && !form.value.dreamAvg)
const isWeightInvalid   = computed(() => touched.value.weight   && !form.value.weight)

const neededGrade = computed(() => {
  if (!form.value.dreamAvg || !form.value.weight) return null

  const grades = gradeStore.gradesBySubject[props.elementId]

  const sums = {gw: 0, w: 0}

  for (const g of grades) {
    sums.gw += g.mark * g.weight
    sums.w += g.weight
  }

  return (form.value.dreamAvg * (sums.w + form.value.weight) - sums.gw) / form.value.weight
})

function close() {
  emit('close')
}
</script>

<style scoped>
@import './../assets/DreamGradeIsland.css'
</style>