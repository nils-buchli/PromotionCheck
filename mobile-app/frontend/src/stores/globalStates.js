import { defineStore } from 'pinia'

export const useGlobalStatesStore = defineStore('globalStateStore', {
    state: () => ({
        removingElements: false, 
        removeIds: new Set(), 
        initComplete: false,
        homeRoute: '/', 
        selectedAnalyticsYearId: null,     
    }), 

    getters: {
        removeCount: (state) => state.removeIds.size
    }, 

    actions: {
        toggleRemoveById(id) {
            if (this.removeIds.has(id)) {
                this.removeIds.delete(id)
            } else {
                this.removeIds.add(id)
            }
        }, 
        clearRemove() {
            this.removeIds = new Set()
        }

    }
})