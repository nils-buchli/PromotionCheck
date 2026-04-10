<template>
    <div class="flex flex-col flex-1 overflow-hidden">

        <!-- Legal overlays -->
        <PrivacyPolicy
            v-if="subView === 'privacy'"
            @back="subView = null"
        />
        <TermsOfService
            v-else-if="subView === 'terms'"
            @back="subView = null"
        />
        <Licenses 
            v-else-if="subView === 'licenses'"
            @back="subView = null"
        />

        <template v-else>

            <ProfileComponent v-if="currentView === 'profile'" />

            <div v-else-if="currentView === 'settings'" class="flex flex-col flex-1 bg-zinc-50 overflow-y-auto">
                <div class="mx-5 mt-8">
                    <button
                        @click="showAuth = true; method = 'login'"
                        class="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3.5 flex items-center justify-between active:bg-zinc-50 transition-colors"
                        style="-webkit-tap-highlight-color: transparent;"
                    >
                        <div class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                <svg class="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div class="text-left">
                                <p class="text-[15px] font-medium text-zinc-900">Log in to sync your data</p>
                                <p class="text-[12px] text-zinc-400 mt-0.5">Your data stays local until you sign in</p>
                            </div>
                        </div>
                        <svg class="w-4 h-4 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </button>
                </div>
                
                <Settings />
                <HowTo />
                <ImportExport />
                <Legal                                      
                    @show-privacy="subView = 'privacy'"     
                    @show-terms="subView = 'terms'"
                    @show-licenses="subView = 'licenses'"
                /> 
                
                <div class="h-10 flex-shrink-0" />
            </div>

            <RegisterComponent
                v-else-if="currentView === 'register'"
                @switch-to-login="method = 'login'"
                @back="showAuth = false"
                @show-privacy="subView = 'privacy'"
                @show-terms="subView = 'terms'"
            />

            <LoginComponent
                v-else-if="currentView === 'login'"
                @switch-to-register="method = 'register'"
                @back="showAuth = false"
            />

        </template>

    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import RegisterComponent from './../components/Register.vue'
import LoginComponent from './../components/Login.vue'
import ProfileComponent from './../components/Profile.vue'
import Settings from '../components/Settings.vue'
import PrivacyPolicy from '../components/PrivacyPolicy.vue'
import TermsOfService from '../components/TermsOfService.vue'
import Legal from '../components/Legal.vue'
import Licenses from '../components/Licenses.vue'
import HowTo from '../components/HowTo.vue'
import ImportExport from '../components/ImportExport.vue'

import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()
const method    = ref('login')
const showAuth  = ref(false)
const subView   = ref(null)

const currentView = computed(() => {
    if (userStore.isLoggedIn) return 'profile'
    if (!showAuth.value) return 'settings'
    return method.value === 'register' ? 'register' : 'login'
})

</script>