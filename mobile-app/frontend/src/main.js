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
import { SocketService } from './services/socket'  

window.JEEP_SQLITE_WASM_PATH = '/assets/sql-wasm.wasm';

defineCustomElements(window)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

async function initApp() {
    await db.init()
    
    const globalStateStore = useGlobalStatesStore()
    const userStore = useUserStore()

    await userStore.updateUser()

    const sync = new SyncService(db)
    const socket = new SocketService()

    if (userStore.isLoggedIn) {
        await sync.sync()
        await socket.init()
    }


    globalStateStore.initComplete = true
    app.mount('#app')

}

initApp()





