import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import db from '../services/db'
import {Year} from '../models/year'
import { useSubjectStore } from './subjects'

export const useYearStore = defineStore('yearStore', {
    state: () => ({
        years: []
    }), 

    getters: {
        elementCount: (state) => state.years.length, 
        yearsById: (state) => {
            const map = {}

            for (const year of state.years) {
                map[year.id] ??= year
            }

            return map 
        }, 
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
        async loadYears() {
            const years = await db.getYears()

            for (const y of years) {
                this.years.push(new Year({
                    id: y['id'], 
                    name: y['title']
                }))
            }
        }, 
        async addYear(yearName) {
            const id = uuidv4()

            await db.addYear(id, yearName)
            
            this.years.push(
                new Year({
                    id: id, 
                    name: yearName
                })
            )
        },
        async removeYearsById(ids) {
            const subjectStore = useSubjectStore()
            
            await db.removeElements(ids, 'years')
            
            this.years = this.years.filter(y => !ids.has(y.id))
            subjectStore.removeSubjectsByYearId(ids)
        } 
    }

})