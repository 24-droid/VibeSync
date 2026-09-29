// In-memory data store fallback when MongoDB Atlas or local MongoDB is unavailable.
// Ensures zero-downtime for college presentation demos.

const crypto = require('crypto')

const generateId = () => crypto.randomBytes(12).toString('hex')

class MemoryStore {
  constructor() {
    this.users = []
    this.analyses = []
    this.collections = []
    this.analyticsEvents = []
    this.analyticsSessions = []
  }

  // Users
  async findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  }

  async findUserByUsername(username) {
    return this.users.find(u => u.username.toLowerCase() === username.toLowerCase())
  }

  async findUserById(id) {
    return this.users.find(u => u._id === id || u.id === id)
  }

  async createUser(userData) {
    const user = {
      _id: generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    user.toJSON = function () {
      const copy = { ...this }
      delete copy.password
      return copy
    }
    this.users.push(user)
    return user
  }

  // Analysis / History
  async createAnalysis(data) {
    const record = {
      _id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.analyses.push(record)
    return record
  }

  async getAnalysesByUser(userId) {
    return this.analyses
      .filter(a => String(a.userId) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // Collections
  async createCollection(data) {
    const col = {
      _id: generateId(),
      songs: [],
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.collections.push(col)
    return col
  }

  async getCollectionsByUser(userId) {
    return this.collections
      .filter(c => String(c.userId) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  async getCollectionById(id) {
    return this.collections.find(c => String(c._id) === String(id))
  }

  async updateCollection(id, updateData) {
    const index = this.collections.findIndex(c => String(c._id) === String(id))
    if (index !== -1) {
      this.collections[index] = { ...this.collections[index], ...updateData, updatedAt: new Date() }
      return this.collections[index]
    }
    return null
  }

  async deleteCollection(id) {
    const index = this.collections.findIndex(c => String(c._id) === String(id))
    if (index !== -1) {
      const deleted = this.collections.splice(index, 1)
      return deleted[0]
    }
    return null
  }

  // Analytics Events & Sessions
  async recordEvent(eventData) {
    const event = {
      _id: generateId(),
      timestamp: new Date(),
      ...eventData
    }
    this.analyticsEvents.push(event)

    // Update or create session
    if (eventData.sessionId) {
      let session = this.analyticsSessions.find(s => s.sessionId === eventData.sessionId)
      if (!session) {
        session = {
          _id: generateId(),
          sessionId: eventData.sessionId,
          userId: eventData.userId || null,
          startTime: new Date(),
          lastPing: new Date(),
          durationSeconds: 0,
          eventCount: 1,
          device: eventData.device || {},
          entryPage: eventData.path || '/home',
          isActive: true
        }
        this.analyticsSessions.push(session)
      } else {
        session.eventCount += 1
        session.lastPing = new Date()
        session.durationSeconds = Math.max(0, Math.floor((new Date() - new Date(session.startTime)) / 1000))
        if (eventData.userId) session.userId = eventData.userId
      }
    }
    return event
  }

  async getEvents(filter = {}) {
    let result = [...this.analyticsEvents]
    if (filter.startDate) {
      result = result.filter(e => new Date(e.timestamp) >= new Date(filter.startDate))
    }
    if (filter.endDate) {
      result = result.filter(e => new Date(e.timestamp) <= new Date(filter.endDate))
    }
    if (filter.eventType) {
      result = result.filter(e => e.eventType === filter.eventType)
    }
    return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  async getSessions(filter = {}) {
    let result = [...this.analyticsSessions]
    if (filter.startDate) {
      result = result.filter(s => new Date(s.startTime) >= new Date(filter.startDate))
    }
    return result
  }

  async clearAnalytics() {
    this.analyticsEvents = []
    this.analyticsSessions = []
  }
}

const memoryStore = new MemoryStore()
module.exports = memoryStore
