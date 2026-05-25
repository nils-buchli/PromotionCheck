import { Capacitor } from '@capacitor/core'
import { SyncService } from './sync'
import { useUserStore } from '../stores/userStore'
import { API_BASE } from '../config'


class DBService {
  constructor() {
    this.sync = new SyncService(this)
    this.userStore = null
    this.TABLES = {'years': 'years', 'subjects': 'subjects', 'subSubjects': 'sub_subjects', 'grades': 'grades'}
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

    const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite')

    this.sqlite = new SQLiteConnection(CapacitorSQLite)

    if (Capacitor.getPlatform() === 'web') {
      await this.sqlite.initWebStore() 
    }

    const ret = (await this.sqlite.checkConnectionsConsistency()).result
    const isConn = (await this.sqlite.isConnection('pluspointdb', false)).result

    if (ret && isConn) {
      this.db = await this.sqlite.retrieveConnection('pluspointdb', false)
    } else {
      this.db = await this.sqlite.createConnection(
        'pluspointdb', false, 'no-encryption', 1, false
      )
    }

    await this.db.open()

    await this.createTables()
    await this.initTables()

    this.userStore = useUserStore()

  }

  async saveToStore() {
    if (Capacitor.getPlatform() === 'web') {
      await this.sqlite.saveToStore('pluspointdb')
    }
  }

  async createTables() {
    await this.db.execute(`CREATE TABLE IF NOT EXISTS years (id TEXT PRIMARY KEY, title TEXT, synced INTEGER DEFAULT 0);`)
    await this.db.execute(`CREATE TABLE IF NOT EXISTS subjects (id TEXT PRIMARY KEY, year_id TEXT FOREIN KEY, title TEXT, weight REAL, has_sub_subjects BOOLEAN, synced INTEGER DEFAULT 0);`)
    await this.db.execute(`CREATE TABLE IF NOT EXISTS sub_subjects (id TEXT PRIMARY KEY, subject_id TEXT FOREIN KEY, title TEXT, weight REAL, synced INTEGER DEFAULT 0);`)
    await this.db.execute(`CREATE TABLE IF NOT EXISTS grades (id TEXT PRIMARY KEY, subject_id TEXT FOREIN KEY, title TEXT, mark REAL, weight REAL, date TEXT, synced INTEGER DEFAULT 0);`)
    await this.db.execute(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);`)
  }

  async initTables() {
    await this.db.run(`INSERT OR IGNORE INTO settings (key) VALUES ('round_to_ths');`)
    await this.db.run(`INSERT OR IGNORE INTO settings (key) VALUES ('double_compensation');`)
    await this.db.run(`INSERT OR IGNORE INTO settings (key) VALUES ('show_pluspoints');`)
    await this.db.run(`INSERT OR IGNORE INTO settings (key) VALUES ('coloring');`)
    await this.db.run(`INSERT OR IGNORE INTO settings (key) VALUES ('sorting');`)
  }

  async addYear(id, title) {
    await this.db.run(`INSERT INTO years (id, title) VALUES (?, ?);`, [id, title])
    await this.saveToStore()
    if (this.userStore.isLoggedIn) {
      await this.sync.pushYears()
    }
  }

  async addSubject(id, title, weight, yearId, hasSubSubjects) {
    await this.db.run(`INSERT INTO subjects (id, year_id, title, weight, has_sub_subjects) VALUES (?, ?, ?, ?, ?);`, [id, yearId, title, weight, hasSubSubjects])
    await this.saveToStore()
    if (this.userStore.isLoggedIn) {
      await this.sync.pushSubjects()
    }
  }

  async addSubSubject(id, title, weight, subjectId) {
    await this.db.run(`INSERT INTO sub_subjects (id, subject_id, title, weight) VALUES (?, ?, ?, ?);`, [id, subjectId, title, weight])
    await this.saveToStore()
    if (this.userStore.isLoggedIn) {
      await this.sync.pushSubSubjects()
    }
  }

  async addGrade(id, title, mark, weight, date, subjectId) {
    await this.db.run(`INSERT INTO grades (id, subject_id, title, mark, weight, date) VALUES (?, ?, ?, ?, ?, ?);`, [id, subjectId, title, mark, weight, date])
    await this.saveToStore()
    if (this.userStore.isLoggedIn) {
      await this.sync.pushGrades()
    }
    
  }

  async removeElements(ids, route) {

    if (!this.TABLES[route]) {
      this._errorCheck('invalidInput')
      return
    }
    
    // local
    for (const id of ids) {
      await this.db.run(`DELETE FROM ${this.TABLES[route]} WHERE id=?`, [id])
    }
    await this.saveToStore()

    // cloud
    if (this.userStore.isLoggedIn) {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE}/api/${this.TABLES[route].replace('_', '-')}`, {
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

  }

  async editElement(id, data, route) {
    if (!this.TABLES[route]) {
      this._errorCheck('invalidInput')
      return
    }

    switch (this.TABLES[route]) {
      case 'years': 
        await this.db.run(`UPDATE ${this.TABLES[route]} SET title=? WHERE id=?`, [data.title, id])
        break
      case 'grades': 
        await this.db.run(`UPDATE ${this.TABLES[route]} SET title=?, mark=?, weight=?, date=? WHERE id=?`, [data.title, data.mark, data.weight, data.date, id])
        break
      default: 
        await this.db.run(`UPDATE ${this.TABLES[route]} SET title=?, weight=? WHERE id=?`, [data.title, data.weight, id])
    }

    await this.saveToStore()

    if (this.userStore.isLoggedIn) {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE}/api/${this.TABLES[route].replace('_', '-')}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify({'ids': [id], 'data': data})
      })

      if (!response.ok) {

      }

      const server_data = await response.json()
      
      if (!server_data.success) {
        console.log(`${data.msg}`)
        this._errorCheck(data.msg)
      }
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

  // Possible keys for settings table: round_to_ths, double_compensation, show_pluspoints, coloring, sorting
  async changeSetting(key, new_value) {
    await this.db.run(`UPDATE settings SET value=? WHERE key=?;`, [new_value, key])
    await this.saveToStore()
  }

  async getSetting(key) {
    const res = await this.db.query(`SELECT value FROM settings WHERE key=?`, [key])
    return res.values[0]?.value || null
  }

  async clearData() {
    await this.db.run(`DELETE FROM grades;`)
    await this.db.run(`DELETE FROM subjects;`)
    await this.db.run(`DELETE FROM sub_subjects;`)
    await this.db.run(`DELETE FROM years;`)
    this.saveToStore()
  }
}

export default new DBService()
