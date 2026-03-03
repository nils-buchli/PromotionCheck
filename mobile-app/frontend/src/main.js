import './assets/style.css'
import './assets/tailwind.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import db from './services/db'
import { defineCustomElements } from 'jeep-sqlite/loader'
import { useYearStore } from './stores/years'
import { useSubjectStore } from './stores/subjects'
import { useSubSubjectStore } from './stores/subsubjects'
import { useGradeStore } from './stores/grades'
import { useGlobalStatesStore } from './stores/globalStates'
import { useUserStore } from './stores/userStore'
import { SyncService } from './services/sync'

window.JEEP_SQLITE_WASM_PATH = '/assets/sql-wasm.wasm';

defineCustomElements(window)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

async function initApp() {
    await db.init()
    
    const yearStore = useYearStore()
    const subjectStore = useSubjectStore()
    const subSubjectStore = useSubSubjectStore()
    const gradeStore = useGradeStore()
    const globalStateStore = useGlobalStatesStore()
    const userStore = useUserStore()

    await yearStore.loadYears()
    await subjectStore.loadSubjects()
    await subSubjectStore.loadSubSubjects()
    await gradeStore.loadGrades()

    globalStateStore.initComplete = true

    await userStore.updateUser()

    const sync = new SyncService(db)

    if (userStore.isLoggedIn) {
        await sync.sync()
    }
    
    setInterval(() => {
        if (userStore.isLoggedIn) {
            sync.sync()
        }
    }, 60 * 1000)

    app.mount('#app')

}

initApp()





