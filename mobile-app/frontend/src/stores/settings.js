import { defineStore } from 'pinia'
import db from '../services/db'
import { useSubjectStore } from './subjects'
import { useGradeStore } from './grades'
import { useSubSubjectStore } from './subsubjects'

export const useSettingsStore = defineStore('settingsStore', {
    state: () => ({
        doubleCompensation: true, 
        roundToThs: 100, 
        showPluspoints: true,
        coloring: {subjectMin: 0, subjectMax: 0.5, yearMin: 0, yearMax: 3}, 
        sorting: {year: 'nd', subject: 'vd', grade: 'vd'}
    }), 

    getters: {
        minusPointFactor: (state) => state.doubleCompensation ? 2 : 1, 
    }, 

    actions: { 
        async init() {
            const roundTo    = await db.getSetting('round_to_ths')
            const doubleComp = await db.getSetting('double_compensation')
            const showPPs    = await db.getSetting('show_pluspoints')
            const colors     = await db.getSetting('coloring')
            const sortings   = await db.getSetting('sorting')

            await this.setRoundToThs(parseInt(roundTo) ? parseInt(roundTo) : 100)
            await this.setDoubleCompensation(doubleComp == 'false' ? false : true)
            await this.setShowPluspoints(showPPs == 'false' ? false : true)
            if (colors != null) {
                const [sMin, sMax, yMin, yMax] = colors.split(',')
                await this.setColoring(sMin, sMax, yMin, yMax) 
            } 
            if (sortings != null) {
                const [ySort, sSort, gSort] = sortings.split(',')
                await this.setSorting(ySort, sSort, gSort)
            }
        }, 
        async setDoubleCompensation(newState) {
            this.doubleCompensation = newState
            await db.changeSetting('double_compensation', String(newState))
        }, 
        async setRoundToThs(newThs) {
            this.roundToThs = newThs
            await db.changeSetting('round_to_ths', String(newThs))
        }, 
        async setShowPluspoints(newState) {
            this.showPluspoints = newState
            await db.changeSetting('show_pluspoints', String(newState))
        }, 
        async setColoring(sMin, sMax, yMin, yMax) {
            this.coloring.subjectMin = sMin
            this.coloring.subjectMax = sMax
            this.coloring.yearMin    = yMin
            this.coloring.yearMax    = yMax
            await db.changeSetting('coloring', String([sMin, sMax, yMin, yMax]))
        }, 
        async setSorting(year, subject, grade) {
            this.sorting.year    = year
            this.sorting.subject = subject
            this.sorting.grade   = grade
            await db.changeSetting('sorting', String([year, subject, grade]))
        }, 
        round(number) {return Math.round(number * this.roundToThs) / this.roundToThs}, 
        _sortByName(dir, list) {
            if (dir === 'd') return [...list].sort((a, b) => a.name.localeCompare(b.name))
            else return [...list].sort((a, b) => b.name.localeCompare(a.name))
        }, 
        _sortByAverage(dir, avgList) {
            if (dir === 'd') return [...avgList].sort((a, b) => b.avg - a.avg).map((v) => v.element)
            else return [...avgList].sort((a, b) => a.avg - b.avg).map((v) => v.element)
        }, 
        sortYear(list) {
            if (this.sorting.year[0] === 'n') return this._sortByName(this.sorting.year[1], list)
            else {
                const listWithAverages = []
                const subjectStore = useSubjectStore()

                for (const e of list) listWithAverages.push({element: e, avg: subjectStore.averageByYear[e.id]})
                
                return this._sortByAverage(this.sorting.year[1], listWithAverages)
            }
        }, 
        sortSubject(list) {
            if (this.sorting.subject[0] === 'n') return this._sortByName(this.sorting.subject[1], list)
            else {
                const listWithAverages = []
                const subSubjectStore = useSubSubjectStore()
                const gradeStore = useGradeStore()

                const averageBySubject = {...gradeStore.averageBySubject, ...subSubjectStore.averageBySubject}
                for (const e of list) listWithAverages.push({element: e, avg: averageBySubject[e.id]})

                return this._sortByAverage(this.sorting.subject[1], listWithAverages)
            }
        }, 
        sortGrade(list) {
            const toISO = str => str.split('.').reverse().join('-')

            if (this.sorting.grade[0] === 'n') return this._sortByName(this.sorting.grade[1], list)
            else if (this.sorting.grade[0] === 'v') {
                if (this.sorting.grade[1] === 'd') return [...list].sort((a, b) => b.mark - a.mark) 
                else return [...list].sort((a, b) => a.mark - b.mark)
            } else {
                if (this.sorting.grade[1] === 'd') return [...list].sort((a, b) => toISO(a.date).localeCompare(toISO(b.date))) 
                else return [...list].sort((a, b) => toISO(b.date).localeCompare(toISO(a.date))) 
            }
        }
    }
})
