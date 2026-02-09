import { defineStore } from 'pinia'
import { Grade } from '../models/grade'

export const useGradeStore = defineStore('gradeStore', {
    state: () => ({
        grades: []
    }), 

    getters: {
        elementCount: (state) => state.grades.length, 
        gradesBySubject: (state) => {
            const map = {}

            for (const grade in state.grades) {
                map[grade.subjectId] ??= []
                map[grade.subjectId].push(grade)
            }

            return map
        }, 
        averageBySubject: (state) => {
            const map = {}
            
            for (const grade of state.grades) {
                map[grade.subjectId] ??= {sum: 0, count: 0}
                map[grade.subjectId].sum += grade.mark
                map[grade.subjectId].count++
            }

            return Object.fromEntries(
                Object.entries(map).map(([id, value]) => [id, value.sum / value.count])
            ) // {subjectId : average}
        }, 

    }, 

    actions: {
    }

})