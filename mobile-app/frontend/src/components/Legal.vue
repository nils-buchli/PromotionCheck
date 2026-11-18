<template>
    <div class="mx-5 mt-4 flex flex-col gap-4">
        <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">

            <div class="flex flex-row flex-1 px-4 pt-3 pb-1">
                <svg class="w-[24px] h-[24px] pr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <p class="text-[17px] font-semibold text-zinc-900 tracking-wider">Legal</p>
            </div>

            <!-- Privacy Policy -->
            <div class="px-4 py-3">
                <button
                    type="button"
                    @click="$emit('show-privacy')"
                    class="w-full flex items-center justify-between active:opacity-60 transition-opacity"
                    style="-webkit-tap-highlight-color: transparent;"
                >
                    <div>
                        <p class="text-[15px] font-medium text-zinc-900 text-left">Privacy Policy</p>
                        <p class="text-xs text-zinc-400 mt-0.5 text-left">How your data is handled</p>
                    </div>
                    <svg class="w-4 h-4 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            </div>

            <div class="mx-4 border-t border-zinc-100" />

            <!-- Terms of Service -->
            <div class="px-4 py-3">
                <button
                    type="button"
                    @click="$emit('show-terms')"
                    class="w-full flex items-center justify-between active:opacity-60 transition-opacity"
                    style="-webkit-tap-highlight-color: transparent;"
                >
                    <div>
                        <p class="text-[15px] font-medium text-zinc-900 text-left">Terms of Service</p>
                        <p class="text-[12px] text-zinc-400 mt-0.5 text-left">Rules and liability</p>
                    </div>
                    <svg class="w-4 h-4 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            </div>

            <div class="mx-4 border-t border-zinc-100" />

            <!-- Licenses -->
            <div class="px-4 py-3">
                <button
                    type="button"
                    @click="$emit('show-licenses')"
                    class="w-full flex items-center justify-between active:opacity-60 transition-opacity"
                    style="-webkit-tap-highlight-color: transparent;"
                >
                    <div>
                        <p class="text-[15px] font-medium text-zinc-900 text-left">Licenses</p>
                        <p class="text-[12px] text-zinc-400 mt-0.5 text-left">Legal credits</p>
                    </div>
                    <svg class="w-4 h-4 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            </div>

            <div class="mx-4 border-t border-zinc-100" />

            <!-- Contact -->
            <div class="px-4 py-3">
                <button
                    type="button"
                    @click="showContact = !showContact"
                    class="w-full flex items-center justify-between active:opacity-60 transition-opacity"
                    style="-webkit-tap-highlight-color: transparent;"
                >
                    <div>
                        <p class="text-[15px] font-medium text-zinc-900 text-left">Contact</p>
                        <p class="text-[12px] text-zinc-400 mt-0.5 text-left">Get in touch with the operator</p>
                    </div>
                    <svg
                        class="w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200"
                        :class="showContact ? 'rotate-90' : ''"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    >
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>

                <!-- Expanded contact info -->
                <div
                    class="overflow-hidden transition-all duration-200"
                    :class="showContact ? 'max-h-40 mt-3' : 'max-h-0'"
                >
                    <div class="bg-zinc-50 rounded-xl border border-zinc-100 px-4 py-3 space-y-2">
                        <div class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                            <p class="text-[13px] text-zinc-700">{{ operatorName }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <a
                                :href="'mailto:' + contactEmail"
                                class="text-[13px] text-zinc-700 underline underline-offset-2"
                            >{{ contactEmail }}</a>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            <p class="text-[13px] text-zinc-700">{{ operatorAddress }}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

defineEmits(['show-privacy', 'show-terms', 'show-licenses'])

const showContact = ref(false)

const operatorName    = 'Nils Buchli'
const contactEmail    = 'nils.buchli@mygymer.ch'
const operatorAddress = 'Switzerland, Bern'


</script>