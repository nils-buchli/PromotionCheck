import { defineStore } from 'pinia'
import {Year} from '../models/year'
import { useSubjectStore } from './subjects'

export const useYearStore = defineStore('yearStore', {
    state: () => ({
        years: []
    }), 

    getters: {
        elementCount: (state) => state.years.length, 
        average: (state) => {
            const subjectStore = useSubjectStore()
            const yearAverages = subjectStore.averageByYear
            let sum = 0
            let count = 0
            
            for (const yearId of yearAverages) {
                sum += yearAverages[yearId]
                count++
            }

            return count === 0 ? 0 : sum / count
        }

    }, 

    actions: {

    }

})