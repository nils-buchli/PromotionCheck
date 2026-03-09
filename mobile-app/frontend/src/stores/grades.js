import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import { Grade } from '../models/grade'
import { useSubSubjectStore } from './subsubjects'
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

            await db.addGrade(id, gradeName, gradeMark, gradeWeight, gradeDate, gradeSubjectId)
            
            this.grades.push(new Grade({
                    id: id, 
                    name: gradeName, 
                    mark: gradeMark, 
                    weight: gradeWeight, 
                    date: gradeDate, 
                    subjectId: gradeSubjectId
                })
            )
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
            await db.removeElements(ids, 'grades')            

            this.grades = this.grades.filter(g => !ids.has(g.id))
        },
        async editGradeById(id, data) {
            const idx = this.grades.findIndex(g => g.id === id)
            if (idx > -1) {
                this.grades[idx] = {...this.grades[idx], ...data}
            }

            await db.editElement(id, {'title': data.name, 'mark': data.mark, 'weight': data.weight, 'date': data.date}, 'grades')
        }
    }
})