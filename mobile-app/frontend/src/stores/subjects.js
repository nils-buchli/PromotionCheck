import { defineStore } from 'pinia'
import {Subject} from '../models/subject'
import { useGradeStore } from './grades'

export const useSubjectStore = defineStore('subjectStore', {
    state: () => ({
        subjects: []
    }), 

    getters: {
        elementCount: (state) => state.subjects.length, 
        subjectsByYear: (state) => {
            const map = {}

            for (const subject in state.subjects) {
                map[subject.yearId] ??= []
                map[subject.yearId].push(subject)
            }

            return map
        }, 
        averageByYear: (state) => {
            const gradeStore = useGradeStore()
            const map = {}

            for (const subject of state.subjects) {
                const avg = gradeStore.averageBySubject[subject.id]
                
                if (avg) {
                    map[subject.yearId] ??= {sum: 0, count: 0}
                    map[subject.yearId].sum +=  // Problem: Was wenn es kein Grade in diesem Subject hat? Wie effizient checken mit js syntax?
                    map[subject.yearId].count++
                }     
            }

            return Object.fromEntries(
                Object.entries(map).map(([id, value]) => [id, value.sum / value.count])
            ) // {yearId : average}
        }, 

    }, 

    actions: {

    }

})