import { defineStore } from 'pinia'
import { User } from '../models/User'

export const useUserStore = defineStore('userStore', {
    state: () => ({ 
        user: null,
    }), 
    getters: {
        isLoggedIn: (state) => Boolean(state.user)
    }, 
    actions: {
        setUser(userId, userName) {
            this.user = new User({id: userId, name: userName})
        }, 
        async updateUser() {
            const token = localStorage.getItem('access_token')

            if (token) {
                const response = await fetch('/api/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.status == 401) {
                    console.log('Token expired.')
                    localStorage.removeItem('access_token')
                    this.clearUser()
                    return 
                }

                const userData = await response.json()

                if (userData.success) {
                    this.setUser(userData.user_id, userData.user_name)
                } else {
                    console.log(userData.msg)
                }
            }
        }, 
        clearUser() {
            this.user = null
        }
    }
})