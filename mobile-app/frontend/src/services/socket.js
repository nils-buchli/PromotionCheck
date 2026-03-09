import io from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'

import { useUserStore } from '../stores/userStore'
import { SyncService } from './sync'
import db from './db'

export class SocketService {
    async init() {
        const userStore = useUserStore()
        const sync = new SyncService(db)
        
        const token = localStorage.getItem('access_token')
        
        // init socket
        this.socket = io('https://456-optiplex.ddns.net', {
            path: '/api/socket.io', 
            auth: {token}, 
        })

        this.socket.on('connect', () => {})
        
        this.socket.on('connect_error', (error) => {
            console.log(`Socket error: ${error}`)
        })
        
        // sync on event
        this.socket.on('sync_required', async (data) => {
            await sync.sync() 
        })
    }
}