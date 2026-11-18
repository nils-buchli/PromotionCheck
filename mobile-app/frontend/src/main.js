import './assets/tailwind.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { StatusBar, Style } from '@capacitor/status-bar'
import { NavigationBar } from '@capgo/capacitor-navigation-bar'
import { Capacitor } from '@capacitor/core'

import db from './services/db'
import { defineCustomElements } from 'jeep-sqlite/loader'
import { useYearStore } from './stores/years'
import { useSubjectStore } from './stores/subjects'
import { useSubSubjectStore } from './stores/subsubjects'
import { useGradeStore } from './stores/grades'
import { useGlobalStatesStore } from './stores/globalStates'
import { useUserStore } from './stores/userStore'
import { SyncService } from './services/sync'
import { SocketService } from './services/socket'  
import { useAnalyticsStore } from './stores/analytics'
import { useSettingsStore } from './stores/settings'

window.JEEP_SQLITE_WASM_PATH = '/assets/sql-wasm.wasm';

defineCustomElements(window)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

async function initApp() {
    if (Capacitor.isNativePlatform()) {
        await StatusBar.setStyle({ style: Style.Light })
        await StatusBar.setBackgroundColor({ color: '#f4f4f5' })

        await NavigationBar.setNavigationBarColor({
            color: '#f4f4f5',
            darkButtons: true
        })
    }

    // Mount immediately so the loading screen is visible during init
    app.mount('#app')

    await db.init()

    const globalStateStore = useGlobalStatesStore()
    const userStore        = useUserStore()
    const settingsStore    = useSettingsStore()
    const yearStore        = useYearStore()
    const subjectStore     = useSubjectStore()
    const subSubjectStore  = useSubSubjectStore()
    const gradeStore       = useGradeStore()

    await userStore.updateUser()

    await yearStore.loadYears()
    await subjectStore.loadSubjects()
    await subSubjectStore.loadSubSubjects()
    await gradeStore.loadGrades()
    await settingsStore.init()

    // App is ready — hide loading screen
    globalStateStore.initComplete = true

    // Sync and socket run in the background after the app is already visible
    if (userStore.isLoggedIn) {
        const sync   = new SyncService(db)
        const socket = new SocketService()
        sync.sync()
        socket.init()
    }
}

const setVh = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
}
setVh()
window.addEventListener('resize', setVh)

initApp()