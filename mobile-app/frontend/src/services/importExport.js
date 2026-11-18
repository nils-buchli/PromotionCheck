import { v4 as uuidv4} from 'uuid'
import { SyncService } from "./sync"
import db from "./db"

class ImportExportService {
    constructor() {
        this.sync = new SyncService(db)
    }

    _parseDict(dictNode) {
        const result   = {}
        const children = [...dictNode.childNodes].filter(n => n.nodeType === 1)
        for (let i = 0; i < children.length; i += 2) {
            if (!children[i + 1]) throw new Error('Invalid <dict> structure.')
            result[children[i].textContent] = this._parseValue(children[i + 1])
        }
        return result
    }

    _parseArray(arrayNode) {
        return [...arrayNode.childNodes].filter(n => n.nodeType === 1).map(n => this._parseValue(n))
    }

    _parseValue(node) {
        switch (node.nodeName) {
            case 'dict':    return this._parseDict(node)
            case 'array':   return this._parseArray(node)
            case 'string':  return node.textContent
            case 'real':    return parseFloat(node.textContent)
            case 'integer': return parseInt(node.textContent)
            default:        return node.textContent
        }
    }

    _parseDate(raw) {
        if (raw == null || isNaN(raw)) throw new Error(`Date value invalid: ${raw}`)
        const d = new Date(raw)   // raw ist bereits ms seit Epoch
        if (isNaN(d.getTime()))   throw new Error(`Could not parse date value: ${raw}`)
        const dd   = String(d.getDate()).padStart(2, '0')
        const mm   = String(d.getMonth() + 1).padStart(2, '0')
        const yyyy = d.getFullYear()
        return `${dd}.${mm}.${yyyy}`
    }

    _require(value, label) {
        if (value == null || value === '' || (typeof value === 'number' && isNaN(value)))
            throw new Error(`Required field not existing or invalid: ${label}`)
        return value
    }

    _escapeXml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
    }

    _examNode(grade) {
        const [dd, mm, yyyy] = grade.date.split('.')
        const ts = new Date(`${yyyy}-${mm}-${dd}`).getTime()

        return `
                <dict>
                    <key>class</key><string>Exam</string>
                    <key>name</key><string>${this._escapeXml(grade.title)}</string>
                    <key>counted</key><integer>1</integer>
                    <key>mark</key><real>${grade.mark.toFixed(6)}</real>
                    <key>weight</key><string>${grade.weight}</string>
                    <key>dAtEaTtr:date</key><real>${ts}.000000</real>
                    <key>has_subexams</key><integer>0</integer>
                </dict>`
    }

    async importFromPlist(xmlString) {        
        let plistData
        try {
            // vonvert xmlStirng to DOM
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(xmlString, 'application/xml')

            const parseErr = xmlDoc.querySelector('parsererror')
            if (parseErr) throw new Error(`XML-Error: ${parseErr.textContent}`)

            const rootDict = xmlDoc.querySelector('plist > dict')
            if (!rootDict)  throw new Error('Document structure invalid')

            plistData = this._parseDict(rootDict)
        } catch (e) {
            console.log(`IMPORT ERROR: ${e.message}`)
            return false
        }

        try {
            const semester  = this._require(plistData['data'],    'data')
            const yearTitle = this._require(semester['name'],     'data.name')
            const subjects  = semester['subjects'] ?? []

            // validate all data before writing to db
            for (const subject of subjects) {
            this._require(subject['name'],   'subject.name')
            this._require(subject['weight'], 'subject.weight')

            const hasSubSubjects = (subject['exams'] ?? []).some(e => e['has_subexams'] === 1)

            for (const exam of subject['exams'] ?? []) {
                this._require(exam['name'],   'exam.name')
                this._require(exam['weight'], 'exam.weight')

                if (exam['has_subexams'] === 1) {
                    for (const subExam of exam['exams'] ?? []) {
                        this._require(subExam['name'],            'subExam.name')
                        this._require(subExam['weight'],          'subExam.weight')
                        this._require(subExam['mark'],            'subExam.mark')
                        this._parseDate(subExam['dAtEaTtr:date'])
                    }
                } else if (!hasSubSubjects) {
                    this._require(exam['mark'],          'exam.mark')
                    this._parseDate(exam['dAtEaTtr:date'])
                } else {
                    this._require(exam['mark'],          'exam.mark')
                    this._parseDate(exam['dAtEaTtr:date'])
                }
            }
        }

            // Write to db
            try {
                const yearId = uuidv4()
                await db.db.run(
                    `INSERT INTO years (id, title) VALUES (?, ?);`,
                    [yearId, yearTitle]
                )

                for (const subject of subjects) {
                const subjectId      = uuidv4()
                const hasSubSubjects = (subject['exams'] ?? []).some(e => e['has_subexams'] === 1)

                await db.db.run(
                    `INSERT INTO subjects (id, year_id, title, weight, has_sub_subjects) VALUES (?, ?, ?, ?, ?);`,
                    [subjectId, yearId, subject['name'], parseFloat(subject['weight']), hasSubSubjects ? 1 : 0]
                )

                if (hasSubSubjects) {
                    const plainExams = (subject['exams'] ?? []).filter(e => e['has_subexams'] !== 1)
                    const subGroups  = (subject['exams'] ?? []).filter(e => e['has_subexams'] === 1)

                    let firstSubSubjectId = null

                    for (const exam of subGroups) {
                        const subSubjectId = uuidv4()
                        if (!firstSubSubjectId) firstSubSubjectId = subSubjectId  // ersten merken

                        await db.db.run(
                            `INSERT INTO sub_subjects (id, subject_id, title, weight) VALUES (?, ?, ?, ?);`,
                            [subSubjectId, subjectId, exam['name'], parseFloat(exam['weight'])]
                        )
                        for (const subExam of exam['exams'] ?? []) {
                            await db.db.run(
                                `INSERT INTO grades (id, subject_id, title, mark, weight, date) VALUES (?, ?, ?, ?, ?, ?);`,
                                [uuidv4(), subSubjectId, subExam['name'], subExam['mark'],
                                parseFloat(subExam['weight']), this._parseDate(subExam['dAtEaTtr:date'])]
                            )
                        }
                    }
                    for (const exam of plainExams) {
                        await db.db.run(
                            `INSERT INTO grades (id, subject_id, title, mark, weight, date) VALUES (?, ?, ?, ?, ?, ?);`,
                            [uuidv4(), firstSubSubjectId, exam['name'], exam['mark'],
                            parseFloat(exam['weight']), this._parseDate(exam['dAtEaTtr:date'])]
                        )
                    }
                } else {
                for (const exam of subject['exams'] ?? []) {
                    await db.db.run(
                        `INSERT INTO grades (id, subject_id, title, mark, weight, date) VALUES (?, ?, ?, ?, ?, ?);`,
                        [uuidv4(), subjectId, exam['name'], exam['mark'],
                        parseFloat(exam['weight']), this._parseDate(exam['dAtEaTtr:date'])]
                    )
                }
                }
            }

                await db._saveToStore()

                await this.sync.sync()

                return true

            } catch (dbErr) {
                throw dbErr  
            }

        } catch (e) {
            console.log(`IMPORT ERROR: ${e.message}`)
            return false
        }
    }

    async exportYearToPlist(yearId) {
        const yearsRes      = await db.db.query(`SELECT * FROM years WHERE id=?`, [yearId])
        const year          = yearsRes.values?.[0]
        if (!year) return null

        const subjectsRes   = await db.db.query(`SELECT * FROM subjects WHERE year_id=?`, [yearId])
        const subjects      = subjectsRes.values ?? []

        let subjectsXml = ''

        for (const subject of subjects) {
            const subSubjectsRes = await db.db.query(`SELECT * FROM sub_subjects WHERE subject_id=?`, [subject.id])
            const subSubjects    = subSubjectsRes.values ?? []

            const gradesRes      = await db.db.query(`SELECT * FROM grades WHERE subject_id=?`, [subject.id])
            const directGrades   = gradesRes.values ?? []

            let examsXml = ''

            for (const sub of subSubjects) {
                const subGradesRes = await db.db.query(`SELECT * FROM grades WHERE subject_id=?`, [sub.id])
                const subGrades    = subGradesRes.values ?? []

                const ts = new Date().getTime()
                examsXml += `
                        <dict>
                            <key>class</key><string>Exam</string>
                            <key>name</key><string>${this._escapeXml(sub.title)}</string>
                            <key>counted</key><integer>1</integer>
                            <key>mark</key><real>0.000000</real>
                            <key>weight</key><string>${sub.weight}</string>
                            <key>dAtEaTtr:date</key><real>${ts}.000000</real>
                            <key>has_subexams</key><integer>1</integer>
                            <key>exams</key>
                            <array>${subGrades.map(g => this._examNode(g)).join('')}
                            </array>
                        </dict>`
            }

            for (const grade of directGrades) {
                examsXml += this._examNode(grade)
            }

            subjectsXml += `
                    <dict>
                        <key>class</key><string>Subject</string>
                        <key>name</key><string>${this._escapeXml(subject.title)}</string>
                        <key>counted</key><integer>1</integer>
                        <key>weight</key><string>${subject.weight}</string>
                        <key>exams</key>
                        <array>${examsXml}
                        </array>
                    </dict>`
        }

        return `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
        <dict>
            <key>data</key>
            <dict>
                <key>class</key><string>Semester</string>
                <key>name</key><string>${this._escapeXml(year.title)}</string>
                <key>subjects</key>
                <array>${subjectsXml}
                </array>
            </dict>
            <key>version</key>
            <string></string>
        </dict>
    </plist>`
  }
}

export default new ImportExportService()