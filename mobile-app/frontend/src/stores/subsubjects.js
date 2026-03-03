import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import db from '../services/db'
import { useGradeStore } from './grades'
import { SubSubject } from '../models/subsubject'
import GradesView from '../views/GradesView.vue'

export const useSubSubjectStore = defineStore('subSubjectStore', {
    state: () => ({
        subSubjects: []
    }), 

    getters: {
        elementCountBySubject: (state) => {
            const map = {}

            for (const subSubject of state.subSubjects) {
                map[subSubject.subjectId] ??= 0 
                map[subSubject.subjectId]++
            }

            return map 
        }, 
        subSubjectById: (state) => {
            const map = {}

            for (const subSubject of state.subSubjects) {
                map[subSubject.id] ??= subSubject
            }

            return map
        }, 
        subSubjectsBySubject: (state) => {
            const map = {} 

            for (const subSubject of state.subSubjects) {
                map[subSubject.subjectId] ??= []
                map[subSubject.subjectId].push(subSubject)
            }

            return map
        }, 
        averageBySubject: (state) => {
            const gradeStore = useGradeStore()
            const map = {}

            for (const subSubject of state.subSubjects) {
                const avg = gradeStore.averageBySubject[subSubject.id] ?? null
                
                if (avg) {
                    const w = subSubject.weight ?? 1

                    map[subSubject.subjectId] ??= {sum: 0, weightSum: 0}
                    map[subSubject.subjectId].sum += avg * w
                    map[subSubject.subjectId].weightSum += w
                }     
            }

            return Object.fromEntries(
                Object.entries(map).map(([id, value]) => [id, value.sum / value.weightSum])
            ) // { subjectId : average}
        }, 

    }, 

    actions: {
        async loadSubSubjects() {
            const subSubjects = await db.getSubSubjects()

            for (const s of subSubjects) {
                this.subSubjects.push(new SubSubject({
                    id: s['id'], 
                    name: s['title'], 
                    weight: s['weight'], 
                    subjectId: s['subject_id']
                }))
            }
        }, 
        async addSubSubject(subSubjectName, subSubjectWeight, subSubjectSubjectId) {
            const id = uuidv4()

            await db.addSubSubject(id, subSubjectName, subSubjectWeight, subSubjectSubjectId)
           
            this.subSubjects.push(new SubSubject({
                id: id, 
                name: subSubjectName, 
                weight: subSubjectWeight, 
                subjectId: subSubjectSubjectId
            }))
        }, 
        async removeSubSubjectsById(ids) {
            const gradeStore = useGradeStore()
            
            await db.removeElements(ids, 'subSubjects')
            
            this.subSubjects = this.subSubjects.filter(s => !ids.has(s.id))
            gradeStore.removeGradesBySubjectIds(ids)
        }, 
        async removeSubSubjectsBySubjectId(ids) {
            await this.removeSubSubjectsById(new Set(this.subSubjects.filter((s) => {
                if(ids.has(s.subjectId)) {
                    return s.id
                }
            })))
        }
    }
})