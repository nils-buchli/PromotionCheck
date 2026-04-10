import { defineStore } from 'pinia'
import db from '../services/db'
import { useSubjectStore } from './subjects'
import { useSubSubjectStore } from './subsubjects'
import { useGradeStore } from './grades'
import { useYearStore } from './years'

function weightedLinearReggression(xs, ys, ws) {
    const wSum = ws.reduce((a, w) => a + w, 0)

    const xMean = xs.reduce((a, x, i) => a + ws[i] * x, 0) / wSum
    const yMean = ys.reduce((a, y, i) => a + ws[i] * y, 0) / wSum

    const num = xs.reduce((a, x, i) => a + ws[i] * (x - xMean) * (ys[i] - yMean), 0)
    const denom = xs.reduce((a, x, i) => a + ws[i] * (x - xMean) ** 2, 0)

    return denom === 0 ? 0 : num / denom
}

function calStructure(storage, top_id, depth, ctx) {
    if (depth > 3) return 

    const { gradesBySubject, yearStore, subjectStore, subSubjectStore } = ctx

    let elementList = []
    
    if (depth === 0) {
        const year = yearStore.yearsById[top_id]
        if (!year) return 
        elementList = top_id ? [year] : yearStore.years
    } else if (depth === 1) {
        elementList = subjectStore.subjectsByYear[top_id]
    } else if (depth === 2) {
        elementList = subSubjectStore.subSubjectsBySubject[top_id]
    } else if (depth === 3) {
        elementList = gradesBySubject[top_id]
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
        calStructure(storage.data[element.id], element.id, nextDepth, ctx)

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
} 

export const useAnalyticsStore = defineStore('analyticsStore', {
    state: () => ({
        structuresAndDateByYear: {},
    }), 

    getters: {
        yearAverages: (state) => {
            const gradeStore    = useGradeStore()
            const subjectStore  = useSubjectStore()
            const subSubjectStore = useSubSubjectStore()
            const yearStore     = useYearStore()

            const gradesBySubject = {}
            const structuresAndDateByYear = {}

            for (const grade of gradeStore.getGradesSortedByDate()) {
                gradesBySubject[grade.subjectId] ??= []
                gradesBySubject[grade.subjectId].push(grade)

                const yearId = gradeStore.getYearIdForGrade(grade)
                if (!yearId) continue

                const finalStructure = {e_sum: 0, w_sum: 0, data: {}}
                calStructure(finalStructure, yearId, 0, {
                    gradesBySubject, yearStore, subjectStore, subSubjectStore
                })

                structuresAndDateByYear[yearId] ??= []
                structuresAndDateByYear[yearId].push({
                    date: grade.date,
                    structure: finalStructure
                })
            }

            const map = {}
            for (const [yearId, dataList] of Object.entries(structuresAndDateByYear)) {
                map[yearId] = dataList.map(d => ({
                    date: d.date,
                    average: d.structure.w_sum !== 0 ? d.structure.e_sum / d.structure.w_sum : 0
                }))
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
        getSparkDataForSubject(subjectId) {
            const gradeStore = useGradeStore()
            
            const grades = gradeStore.getGradesBySubjectStortedByDate()[subjectId]
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