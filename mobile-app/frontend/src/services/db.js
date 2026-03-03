import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
import { SyncService } from './sync'

class DBService {
  constructor() {
    this.sync = new SyncService(this)
  }

  _errorCheck(msg) {
    switch(msg) {
      case 'permissionDenied': 
        console.log('Permission denied.')
        break
      case 'invalidInput': 
        console.log('Input invalid.')
        break
      default: 
        console.log('An error occured')
        break
      }
  }

  async init() {
    if (this.db) return

    this.sqlite = new SQLiteConnection(CapacitorSQLite)

    await this.sqlite.initWebStore() 

    this.db = await this.sqlite.createConnection('pluspointdb', false, 'no-encryption', 1, false)

    await this.db.open()

    await this.createTables()
  }

  async _saveToStore() {
    await this.sqlite.saveToStore('pluspointdb')
  }

  async createTables() {
    await this.db.execute(`CREATE TABLE IF NOT EXISTS years (id TEXT PRIMARY KEY, title TEXT, synced INTEGER DEFAULT 0);`)
    await this.db.execute(`CREATE TABLE IF NOT EXISTS subjects (id TEXT PRIMARY KEY, year_id TEXT FOREIN KEY, title TEXT, weight REAL, has_sub_subjects BOOLEAN, synced INTEGER DEFAULT 0);`)
    await this.db.execute(`CREATE TABLE IF NOT EXISTS sub_subjects (id TEXT PRIMARY KEY, subject_id TEXT FOREIN KEY, title TEXT, weight REAL, synced INTEGER DEFAULT 0);`)
    await this.db.execute(`CREATE TABLE IF NOT EXISTS grades (id TEXT PRIMARY KEY, subject_id TEXT FOREIN KEY, title TEXT, mark REAL, weight REAL, date TEXT, synced INTEGER DEFAULT 0);`)
  }

  async addYear(id, title) {
    await this.db.run(`INSERT INTO years (id, title) VALUES (?, ?);`, [id, title])
    await this._saveToStore()
    await this.sync.pushYears()
  }

  async addSubject(id, title, weight, yearId, hasSubSubjects) {
    await this.db.run(`INSERT INTO subjects (id, year_id, title, weight, has_sub_subjects) VALUES (?, ?, ?, ?, ?);`, [id, yearId, title, weight, hasSubSubjects])
    await this._saveToStore()
    await this.sync.pushSubjects()
  }

  async addSubSubject(id, title, weight, subjectId) {
    await this.db.run(`INSERT INTO sub_subjects (id, subject_id, title, weight) VALUES (?, ?, ?, ?);`, [id, subjectId, title, weight])
    await this._saveToStore()
    await this.sync.pushSubSubjects()
  }

  async addGrade(id, title, mark, weight, date, subjectId) {
    await this.db.run(`INSERT INTO grades (id, subject_id, title, mark, weight, date) VALUES (?, ?, ?, ?, ?, ?);`, [id, subjectId, title, mark, weight, date])
    await this._saveToStore()
    await this.sync.pushGrades()
  }

  async removeElements(ids, route) {
    const TABLES = {'years': 'years', 'subjects': 'subjects', 'subSubjects': 'sub_subjects', 'grades': 'grades'}

    if (!TABLES[route]) {
      this._errorCheck('invalidInput')
      return
    }
    
    // local
    for (const id of ids) {
      await this.db.run(`DELETE FROM ${TABLES[route]} WHERE id=?`, [id])
    }
    await this._saveToStore()

    // cloud
    const token = localStorage.getItem('access_token')
    const response = await fetch(`/api/${TABLES[route].replace('_', '-')}`, {
      method: 'DELETE', 
      headers: {
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
      }, 
      body: JSON.stringify({'ids': Array.from(ids)})
    })

    if (!response.ok) {
      
    }

    const data = await response.json()

    if (!data.success) {
      this._errorCheck(data.msg)
    }

  }

  async getYears() {
    const res = await this.db.query(`SELECT * FROM years;`)
    return res.values || []
  }

  async getSubjects() {
    const res = await this.db.query(`SELECT * FROM subjects;`)
    return res.values || []
  }

  async getSubSubjects() {
    const res = await this.db.query(`SELECT * FROM sub_subjects;`)
    return res.values || []
  }

  async getGrades() {
    const res = await this.db.query(`SELECT * FROM grades;`)
    return res.values || []
  }
}

export default new DBService()
