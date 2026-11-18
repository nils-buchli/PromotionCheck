<template>
    <PrivacyPolicy v-if="subView == 'privacy'" @back="subView = null" />
    <TermsOfService v-else-if="subView == 'terms'" @back="subView = null" />
    <Licenses v-else-if="subView === 'licenses'"@back="subView = null" />
    
    <div v-else class="flex flex-col flex-1 bg-zinc-50 overflow-y-auto">
        <!-- Avatar + Name -->
        <div class="flex flex-col items-center mt-10 mb-2">
            <div class="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span class="text-2xl font-semibold text-primary">{{ initial }}</span>
            </div>
            <p class="text-[17px] font-semibold text-zinc-900">{{ username }}</p>
            <p class="text-[13px] text-zinc-400 mt-0.5">Username</p>
            <button
                type="button"
                @click="editMode = true"
                class="flex items-center gap-1.5 mt-2 px-3 py-1.5 text-primary active:text-primary-dark transition-colors rounded-lg min-h-[44px]"
            >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span class="text-[13px] font-medium">Edit</span>
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

        <div class="mx-5 mt-8 mb-10 flex flex-col gap-3">
            <button
                type="button"
                @click="logout"
                class="w-full bg-zinc-100 active:bg-zinc-200 text-red-500 text-[15px] font-medium rounded-2xl py-3.5 transition-colors duration-150 border border-zinc-200"
                style="-webkit-tap-highlight-color: transparent;"
            >
                Sign out
            </button>

            <button
                v-if="!confirmDelete"
                type="button"
                @click="confirmDelete = true"
                class="w-full text-zinc-400 text-[13px] py-1 transition-colors duration-150"
                style="-webkit-tap-highlight-color: transparent;"
            >
                Delete account
            </button>

            <div v-else class="bg-white border border-red-200 rounded-2xl px-4 py-4 flex flex-col gap-3">
                <div>
                    <p class="text-[14px] font-medium text-zinc-900">Delete account?</p>
                    <p class="text-[12px] text-zinc-400 mt-0.5">All your data will be permanently deleted. This cannot be undone.</p>
                </div>
                <div class="flex gap-2">
                    <button
                        type="button"
                        @click="confirmDelete = false"
                        class="flex-1 bg-zinc-100 active:bg-zinc-200 text-zinc-600 text-[14px] font-medium rounded-xl py-2.5 border border-zinc-200 transition-colors"
                        style="-webkit-tap-highlight-color: transparent;"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        @click="deleteAccount"
                        class="flex-1 bg-red-50 active:bg-red-100 text-red-500 text-[14px] font-medium rounded-xl py-2.5 border border-red-200 transition-colors"
                        style="-webkit-tap-highlight-color: transparent;"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    
        <EditUserIsland 
            :is-open="editMode"
            @close="editMode = false"
        />
    
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '../stores/userStore'
import ImportExport from './ImportExport.vue'
import db from '../services/db'
import { API_BASE } from '../config'

import { useYearStore } from '../stores/years'
import { useSubjectStore } from '../stores/subjects'
import { useSubSubjectStore } from '../stores/subsubjects'
import { useGradeStore } from '../stores/grades'
import Settings from './Settings.vue'
import Legal from './Legal.vue'
import PrivacyPolicy from './PrivacyPolicy.vue'
import TermsOfService from './TermsOfService.vue'
import Licenses from './Licenses.vue'
import HowTo from './HowTo.vue'
import EditUserIsland from './EditUserIsland.vue'

const userStore       = useUserStore()
const yearStore       = useYearStore()
const subjectStore    = useSubjectStore()
const subSubjectStore = useSubSubjectStore()
const gradeStore      = useGradeStore()

const editMode      = ref(false)
const confirmDelete = ref(false)
const subView       = ref(null)

const username = computed(() =>
    userStore.isLoggedIn ? userStore.user.name : ''
)

const initial = computed(() =>
    username.value ? username.value.charAt(0).toUpperCase() : '?'
)

async function logout() {
    db.clearData()

    yearStore.years             = []
    subjectStore.subjects       = []
    subSubjectStore.subSubjects = []
    gradeStore.grades           = []
    
    userStore.clearUser()
    localStorage.removeItem('access_token')
    window.location.reload()
}

async function deleteAccount() {
    const response = await fetch(`${API_BASE}/api/delete-user`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })

    const userData = await response.json()

    if (userData.success) {
        userStore.clearUser()
        localStorage.removeItem('access_token')
        window.location.reload()
        
    } else {
        console.log(userData.msg)
    }
}

</script>