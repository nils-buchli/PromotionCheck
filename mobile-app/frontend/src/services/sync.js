import { useUserStore } from '../stores/userStore'
import { useYearStore } from '../stores/years'
import { useSubjectStore } from '../stores/subjects'
import { useSubSubjectStore } from '../stores/subsubjects'
import { useGradeStore } from '../stores/grades'

export class SyncService {
    constructor(dbService) {
        this.db = dbService
        this.clientId = null
        this.socket = null
    }

    _errorCheck(msg) {

        switch (msg) {
            case "invalidInput": 
                console.log("Invalid input.")
                break
            case "itemAlreadyExists": 
                console.log("Item already exists.")
                break
            case "permissionDenied": 
                console.log("Permission denied.")
                break
            default: 
                console.log("An error occured.")
                break
        }
    }

    async pullYears() {
        const token = localStorage.getItem('access_token')
        const yearStore = useYearStore()

        const response = await fetch('/api/years', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            return
        }

        const data = await response.json()
        if (data.success) {
            for (const year of data.data) {
                if (year.deleted) {
                    await this.db.db.run(
                        'DELETE FROM years WHERE id=?;', 
                        [year.id]
                    )
                } else {
                    await this.db.db.run(
                    'INSERT OR REPLACE INTO years (id, title, synced) VALUES (?, ?, 1);', 
                    [year.id, year.title]
                    )
                } 
            }
            await this.db.saveToStore('pluspointdb')
            await yearStore.loadYears()
        } else {
            this._errorCheck(data.msg)
        }
    }

    async pushYears() {
        const token = localStorage.getItem('access_token')
        const years = await this.db.getYears()

        for (const year of years){
            if (year.synced === 0) {
                const response = await fetch('/api/years', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }, 
                    body: JSON.stringify({
                        id: year.id, 
                        title: year.title
                    })
                })
                
                if (!response.ok) {
                    continue 
                }

                const data = await response.json()

                if (data.success) {
                    await this.db.db.run(
                        'UPDATE years SET synced = 1 WHERE id=?;', 
                        [year.id]
                    )

                } else {
                    this._errorCheck(data.msg)
                }
            }
        }

        await this.db.saveToStore('pluspointdb')
        
    }

    async pullSubjects() {
        const token = localStorage.getItem('access_token')
        const subjectStore = useSubjectStore()

        const response = await fetch('/api/subjects', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            return
        }

        const data = await response.json()
        if (data.success) {
            for (const subject of data.data) {
                if (subject.deleted) {
                    await this.db.db.run(
                        'DELETE FROM subjects WHERE id=?;', 
                        [subject.id]
                    )
                } else {
                    await this.db.db.run(
                        'INSERT OR REPLACE INTO subjects (id, title, weight, year_id, has_sub_subjects, synced) VALUES (?, ?, ?, ?, ?, 1);', 
                        [subject.id, subject.title, subject.weight, subject.year_id, subject.has_sub_subjects]
                    ) 
                }  
            }
            await this.db.saveToStore('pluspointdb')
            await subjectStore.loadSubjects()
        } else {
            this._errorCheck(data.msg)
        }
    }

    async pushSubjects() {
        const token = localStorage.getItem('access_token')
        const subjects = await this.db.getSubjects()

        for (const subject of subjects){
            if (subject.synced === 0) {
                const response = await fetch('/api/subjects', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }, 
                    body: JSON.stringify({
                        id: subject.id, 
                        title: subject.title,
                        weight: subject.weight,
                        year_id: subject.year_id,
                        has_sub_subjects: subject.has_sub_subjects
                    })
                })
                
                if (!response.ok) {
                    continue 
                }

                const data = await response.json()

                if (data.success) {
                    await this.db.db.run(
                        'UPDATE subjects SET synced = 1 WHERE id=?;', 
                        [subject.id]
                    )
                } else {
                    this._errorCheck(data.msg)
                }
            }
        }

        await this.db.saveToStore('pluspointdb')
    }

    async pullSubSubjects() {
        const token = localStorage.getItem('access_token')
        const subSubjectStore = useSubSubjectStore()

        const response = await fetch('/api/sub-subjects', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            return
        }

        const data = await response.json()
        if (data.success) {
            for (const subSubject of data.data) {
                if (subSubject.deleted) {
                    await this.db.db.run(
                        'DELETE FROM sub_subjects WHERE id=?;', 
                        [subSubject.id]
                    )
                } else {
                    await this.db.db.run(
                        'INSERT OR REPLACE INTO sub_subjects (id, title, weight, subject_id, synced) VALUES (?, ?, ?, ?, 1);', 
                        [subSubject.id, subSubject.title, subSubject.weight, subSubject.subject_id]
                    )
                }
                
            }
            await this.db.saveToStore('pluspointdb')
            await subSubjectStore.loadSubSubjects()
        } else {
            this._errorCheck(data.msg)
        }
    }

    async pushSubSubjects() {
        const token = localStorage.getItem('access_token')
        const subSubjects = await this.db.getSubSubjects()

        for (const subSubject of subSubjects){
            if (subSubject.synced === 0) {
                const response = await fetch('/api/sub-subjects', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }, 
                    body: JSON.stringify({
                        id: subSubject.id, 
                        title: subSubject.title,
                        weight: subSubject.weight,
                        subject_id: subSubject.subject_id
                    })
                })
                
                if (!response.ok) {
                    continue 
                }

                const data = await response.json()

                if (data.success) {
                    await this.db.db.run(
                        'UPDATE sub_subjects SET synced = 1 WHERE id=?;', 
                        [subSubject.id]
                    )
                } else {
                    this._errorCheck(data.msg)
                }
            }
        }

        await this.db.saveToStore('pluspointdb')
    }

    async pullGrades() {
        const token = localStorage.getItem('access_token')
        const gradeStore = useGradeStore()

        const response = await fetch('/api/grades', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            return
        }

        const data = await response.json()
        if (data.success) {
            for (const grade of data.data) {
                if (grade.deleted) {
                    await this.db.db.run(
                        'DELETE FROM grades WHERE id=?;', 
                        [grade.id]
                    )
                } else {
                    await this.db.db.run(
                        'INSERT OR REPLACE INTO grades (id, title, mark, weight, date, subject_id, synced) VALUES (?, ?, ?, ?, ?, ?, 1);', 
                        [grade.id, grade.title, grade.mark, grade.weight, grade.date, grade.subject_id]
                    )
                }
            }
            await this.db.saveToStore('pluspointdb')
            await gradeStore.loadGrades()
        } else {
            this._errorCheck(data.msg)
        }
    }

    async pushGrades() {
        const token = localStorage.getItem('access_token')
        const grades = await this.db.getGrades()

        for (const grade of grades){
            if (grade.synced === 0) {
                const response = await fetch('/api/grades', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }, 
                    body: JSON.stringify({
                        id: grade.id, 
                        title: grade.title,
                        mark: grade.mark,
                        weight: grade.weight,
                        date: grade.date,
                        subject_id: grade.subject_id
                    })
                })
                
                if (!response.ok) {
                    continue 
                }

                const data = await response.json()

                if (data.success) {
                    await this.db.db.run(
                        'UPDATE grades SET synced = 1 WHERE id=?;', 
                        [grade.id]
                    )
                } else {
                    this._errorCheck(data.msg)
                }
            }
        }

        await this.db.saveToStore('pluspointdb')
    }

    async sync() {
        await this.pullYears()
        await this.pullSubjects()
        await this.pullSubSubjects()
        await this.pullGrades()
        
        await this.pushYears()
        await this.pushSubjects()
        await this.pushSubSubjects()
        await this.pushGrades()
    }
}