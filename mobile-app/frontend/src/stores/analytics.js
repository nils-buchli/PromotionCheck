import { defineStore } from 'pinia'
import db from '../services/db'
import { useSubjectStore } from './subjects'
import { useSubSubjectStore } from './subsubjects'
import { useGradeStore } from './grades'
import { useYearStore } from './years'

import * as simpleStatistics from 'simple-statistics'

function weightedLinearReggression(xs, ys, ws) {
    const wSum = ws.reduce((a, w) => a + w, 0)

    const xMean = xs.reduce((a, x, i) => a + ws[i] * x, 0) / wSum
    const yMean = ys.reduce((a, y, i) => a + ws[i] * y, 0) / wSum

    const num = xs.reduce((a, x, i) => a + ws[i] * (x - xMean) * (ys[i] - yMean), 0)
    const denom = xs.reduce((a, x, i) => a + ws[i] * (x - xMean) ** 2, 0)

    return denom === 0 ? 0 : num / denom
}

export const useAnalyticsStore = defineStore('analyticsStore', {
    state: () => ({
        structuresAndDateByYear: {},
    }), 

    getters: {
        yearAverages: (state) => {
            const map = {}

            for (const [yearId, dataList] of Object.entries(state.structuresAndDateByYear)) {
                map[yearId] = []
                for (const data of dataList) map[yearId].push({date: data.date, average: data.structure.e_sum / data.structure.w_sum})
            }
            return map
        }, 
        gradeLRSlopesBySubject: (state) => {
            const gradeStore = useGradeStore()
            const result = {}

            for (const [subjectId, grades] of Object.entries(gradeStore.getGradesBySubjectStortedByDate())) {
                if (grades.length < 2) {
                    result[subjectId] = 0
                    continue
                }
                result[subjectId] = weightedLinearReggression(grades.map((_, i) => i), grades.map(g => g.mark), grades.map(g => g.weight))
            }
            return result
        }, 
    }, 

    actions: {
        init() {
            this.gradeStore = useGradeStore()
            this.subSubjectStore = useSubSubjectStore()
            this.subjectStore = useSubjectStore()
            this.yearStore = useYearStore()

            this.gradesBySubject = this.gradeStore.gradesBySubject

            this._calHistoricYearAverages()

            // console.log(`YEAR AVERAGES: ${JSON.stringify(this.yearAverages, null, 2)}`)
            
        }, 
        _calStructure(storage, top_id, depth) {
            if (depth > 3) return 

            // console.log(`TOP ID: ${top_id}`)

            let elementList = []
            
            if (depth === 0) {
                elementList = top_id ? [this.yearStore.yearsById[top_id]] : this.yearStore.years
            } else if (depth === 1) {
                elementList = this.subjectStore.subjectsByYear[top_id]
            } else if (depth === 2) {
                elementList = this.subSubjectStore.subSubjectsBySubject[top_id]
            } else if (depth === 3) {
                elementList = this.gradesBySubject[top_id]
            }
            
            // console.log(`ELEMENT LIST: ${JSON.stringify(elementList)}`)
            // Stop tree if top_id has no children
            if (!elementList) return 
            for (const element of elementList) {
                // Create e_sum, w_sum and storage for sub element for every id
                if (depth !== 3) storage.data[element.id] = {e_sum: 0, w_sum: 0, data: {}}

                // Skip subSubject if there is none
                const nextDepth = (depth === 1 && !element.hasSubSubjects) ? depth + 2 : depth + 1 
                
                // Recursivly go over the sub elements of every element
                this._calStructure(storage.data[element.id], element.id, nextDepth)

                // update e_- & w_sum of top element
                if (depth === 3) {
                    storage.e_sum += element.mark * element.weight
                    storage.w_sum += element.weight
                } else {
                    if (storage.data[element.id].w_sum !== 0) {
                        storage.e_sum += (storage.data[element.id].e_sum / storage.data[element.id].w_sum) * (element.weight ?? 1)
                        storage.w_sum += element.weight ?? 1 
                    }
                }
                
            }
        }, 
        _calHistoricYearAverages() {
            this.gradesBySubject = {}

            // Iterate over grades sorted by date
            for (const grade of this.gradeStore.getGradesSortedByDate()) {
                // console.log(`SUBJECT ID: ${grade.subjectId}`)

                // Push grade to according Subject
                this.gradesBySubject[grade.subjectId] ??= []
                this.gradesBySubject[grade.subjectId].push(grade)

                // Reset finalStructure
                let finalStructure = {e_sum: 0, w_sum: 0, data: {}}

                // get YearId of grade
                const yearId = this.gradeStore.getYearIdForGrade(grade)
                
                
                // console.log(`GRADES BY SUBJECT ${JSON.stringify(this.gradesBySubject, null, 2)}`)
                // Fill finalStructure
                this._calStructure(finalStructure, yearId, 0)

                // Update sturcturesByDate
                this.structuresAndDateByYear[yearId] ??= []
                this.structuresAndDateByYear[yearId].push({date: grade.date, structure: finalStructure})
            }
        }, 
        getSparkDataForSubject(subjectId) {
            const grades = this.gradeStore.getGradesBySubjectStortedByDate()[subjectId]
            const sums = {e: 0, w: 0}
            const sparkData = []

            for (const g of grades) {
                sums.e += g.mark * g.weight 
                sums.w += g.weight

                if (sums.w !== 0) sparkData.push(Math.round(sums.e / sums.w * 100) / 100)
            }

            return sparkData

        }
    }
})