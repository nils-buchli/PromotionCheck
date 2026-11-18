<template>
    <div class="mx-5 mt-4 flex flex-col gap-4">
        <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">

            <div class="flex flex-row flex-1 px-4 pt-3 pb-1">
                <svg class="w-[24px] h-[24px] pr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.6-1.4 4.9-3.5 6.2-.5.3-.5.6-.5.8v.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-.5c0-.2 0-.5-.5-.8C6.4 13.9 5 11.6 5 9a7 7 0 0 1 7-7z"/>
                </svg>
                <p class="text-[17px] font-semibold text-zinc-900 tracking-wider">How To</p>
            </div>

            <!-- Access Pluspoints on the laptop -->
            <HowToElement 
                :title="'Access the app on your laptop'"
                :sub-title="'Manage your grades from everywhere'"
                :steps="accessOnLaptopSetps"
            />

            <HowToElement 
                :title="'Let an element not count'"
                :sub-title="'Gray out elements, that do not affect your achievements'"
                :steps="letSthNotCountSteps"
            />

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

import HowToElement from './HowToElement.vue';

const accessOnLaptopSetps = [
    'Open your browser and go to promotioncheck.ch',
    'Sign in with your username and password',
]

const letSthNotCountSteps = [
    'Create or edit a subject, sub-subject or grade', 
    'Simply set its weight to zero'
]
</script>