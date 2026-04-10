import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import {Subject} from '../models/subject'
import { useGradeStore } from './grades'
import { useSubSubjectStore } from './subsubjects'
import { computed } from 'vue'
import db from '../services/db'
import { useSettingsStore } from './settings'

export const useSubjectStore = defineStore('subjectStore', {
    state: () => ({
        subjects: []
    }), 

    getters: {
        elementCountByYear: (state) => {
            const map = {}

            for (const subject of state.subjects) {
                map[subject.yearId] ??= 0 
                map[subject.yearId]++
            }

            return map 
        }, 
        subjectsById: (state) => {
            const map = {}

            for (const subject of state.subjects) {
                map[subject.id] ??= subject 
            }

            return map 
        }, 
        subjectsByYear: (state) => {
            const map = {} 

            for (const subject of state.subjects) {
                map[subject.yearId] ??= []
                map[subject.yearId].push(subject)
            }

            return map
        }, 
        averageByYear: (state) => {
            const subSubjectStore = useSubSubjectStore()
            const gradeStore = useGradeStore()
            
            const map = {}

            for (const subject of state.subjects) {

                const avg = subject.hasSubSubject ? 
                    subSubjectStore.averageBySubject[subject.id] ?? null : 
                    gradeStore.averageBySubject[subject.id] ?? null
                    
                
                if (avg) {
                    const w = subject.weight ?? 1

                    map[subject.yearId] ??= {sum: 0, weightSum: 0}
                    map[subject.yearId].sum += avg * w
                    map[subject.yearId].weightSum += w
                }     
            }

            return Object.fromEntries(
                Object.entries(map).map(([id, value]) => [id, value.sum / value.weightSum])
            ) // {yearId : average}
        }, 
    }, 

    actions: {
        async loadSubjects() {
            const subjects = await db.getSubjects()

            this.subjects = subjects.map(s => new Subject({
                id: s['id'], 
                name: s['title'], 
                weight: s['weight'], 
                yearId: s['year_id'], 
                hasSubSubject: s['has_sub_subjects']
            }))
            
            for (const s of subjects) {
                if (!(s.id in this.subjectsById)) {
                    this.subjects.push()
                }
            }
        },    
        async addSubject(subjectName, subjectWeight, subjectYearId, subjectHasSubSubject) {
            const id = uuidv4()
            
            await db.addSubject(id, subjectName, subjectWeight, subjectYearId, subjectHasSubSubject)

            this.subjects.push(new Subject({
                id: id, 
                name: subjectName, 
                weight: subjectWeight, 
                yearId: subjectYearId, 
                hasSubSubject: subjectHasSubSubject
            }))
        },
        getPlusPointsByYear() {
            const map = {}
            const gradeStore = useGradeStore()
            const subSubjectStore = useSubSubjectStore()
            const settingsStore = useSettingsStore()

            for (const [subjectId, avg] of Object.entries({...gradeStore.averageBySubject, ...subSubjectStore.averageBySubject})) {
                const diff = Math.round((avg - 4) * 2) / 2
                const subject = this.subjectsById?.[subjectId]  
                
                if (subject) {
                    map[subject.yearId] ??= 0
                    map[subject.yearId] += diff < 0 ? diff * settingsStore.minusPointFactor : diff
                }
            }

            return map 
        },
        async removeSubjectsById(ids) {
            await db.removeElements(ids, 'subjects')
            
            this.subjects = this.subjects.filter(s => !ids.has(s.id))
        }, 
        async editSubjectById(id, data) {
            const idx = this.subjects.findIndex(s => s.id === id)
            if (idx > -1) {
                this.subjects[idx] = {...this.subjects[idx], ...data}
            }

            await db.editElement(id, {'title': data.name, 'weight': data.weight}, 'subjects')
        }
    }
})