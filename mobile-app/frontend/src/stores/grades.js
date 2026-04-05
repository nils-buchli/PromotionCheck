import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import { Grade } from '../models/grade'
import { useSubSubjectStore } from './subsubjects'
import { useSubjectStore } from './subjects'
import { useAnalyticsStore } from './analytics'
import db from '../services/db'


export const useGradeStore = defineStore('gradeStore', {
    state: () => ({
        grades: []
    }), 

    getters: {
        elementCountBySubject: (state) => {
            const map = {}

            for (const grade of state.grades) {
                map[grade.subjectId] ??= 0
                map[grade.subjectId]++
            }
            
            return map 
        }, 
        gradesById: (state) => {
            const map = {}

            for (const grade of state.grades) {
                map[grade.id] = grade.mark
            }

            return map 
        }, 
        gradesBySubject: (state) => {
            const map = {}

            for (const grade of state.grades) {
                map[grade.subjectId] ??= []
                map[grade.subjectId].push(grade)
            }

            return map
        }, 
        averageBySubject: (state) => {
            const map = {}
            
            for (const grade of state.grades) {
                const w = grade.weight ?? 1

                map[grade.subjectId] ??= { sum: 0, weightSum: 0 }

                map[grade.subjectId].sum += grade.mark * w
                map[grade.subjectId].weightSum += w
            }

            return Object.fromEntries(
                Object.entries(map).map(([id, value]) => [id, value.sum / value.weightSum])
            ) // {subjectId : average}
        }, 
        gradesByYearId: (state) => {
            const subSubjectStore = useSubSubjectStore()
            const subjectStore = useSubjectStore()

            const map = {}
            
            for (const g of state.grades) {
                let subjectId = g.subjectId
                
                const subSubject = subSubjectStore.subSubjectById?.[subjectId]
                if (subSubject) subjectId = subSubject.subjectId
                const yearId = subjectStore.subjectsById[subjectId].yearId
                
                map[yearId] ??= []
                map[yearId].push(g)
            }

            return map
        }

    }, 

    actions: {
        async loadGrades() {
            const grades = await db.getGrades()

            this.grades = grades.map(g => new Grade({
                id: g['id'], 
                name: g['title'], 
                mark: g['mark'], 
                weight: g['weight'], 
                date: g['date'], 
                subjectId: g['subject_id']
            }))
        },   
        async addGrade(gradeName, gradeMark, gradeWeight, gradeDate, gradeSubjectId) {
            const id = uuidv4()
            
                    
            this.grades.push(new Grade({
                    id: id, 
                    name: gradeName, 
                    mark: gradeMark, 
                    weight: gradeWeight, 
                    date: gradeDate, 
                    subjectId: gradeSubjectId
                })
            )

            await db.addGrade(id, gradeName, gradeMark, gradeWeight, gradeDate, gradeSubjectId)
    
        }, 
        getPlusPointsBySubject() {
            const map =  {}
            const subSubjectStore = useSubSubjectStore()

            for (const [id, avg] of [...Object.entries(this.averageBySubject), ...Object.entries(subSubjectStore.averageBySubject)]) {
                const diff = Math.round((avg - 4) * 2) / 2  
                map[id] = diff < 0 ? diff * 2 : diff 
            }
            
            return map
        }, 
        async removeGradesByIds(ids) {
            this.grades = this.grades.filter(g => !ids.has(g.id))

            await db.removeElements(ids, 'grades')  
        },
        async editGradeById(id, data) {
            const idx = this.grades.findIndex(g => g.id === id)
            if (idx > -1) {
                this.grades[idx] = {...this.grades[idx], ...data}
            }

            await db.editElement(id, {'title': data.name, 'mark': data.mark, 'weight': data.weight, 'date': data.date}, 'grades')
        }, 
        getGradesBySubjectStortedByDate() {
            const gradesBySubject = this.gradesBySubject
            const toISO = str => str.split('.').reverse().join('-')
            
            for (const [subjectId, grades] of Object.entries(gradesBySubject)) {
                gradesBySubject[subjectId] = grades.sort((a, b) => toISO(a.date).localeCompare(toISO(b.date)))
            }
            return gradesBySubject
        }, 
        getGradesSortedByDate() {
            const toISO = str => str.split('.').reverse().join('-')
            return [...this.grades].sort((a, b) => toISO(a.date).localeCompare(toISO(b.date)))
        }, 
        getYearIdForGrade(grade) {
            const subSubjectStore = useSubSubjectStore()
            const subjectStore = useSubjectStore()
            
            let subjectId = grade.subjectId
            if (subjectId in subSubjectStore.subSubjectById) {
                subjectId = subSubjectStore.subSubjectById[subjectId].subjectId
            }
            return subjectStore.subjectsById[subjectId]?.yearId

        }
        
    }
})