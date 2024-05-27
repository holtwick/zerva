import type { UseSqliteTable } from '@zerva/sqlite'
import type { HealthEvent, HealthPerson, HealthPoint } from './types'
import type { RpcHealthEvent, RpcHealthPerson, RpcHealthPoint } from './rpc-types'

/** Person details and sensor provider login */
export function setupRpcHealthPerson(table: UseSqliteTable<HealthPerson>, handleChange?: (id:number) => void):RpcHealthPerson {
  return {
    getPerson(id) {
      return table.get(id)
    },
    getPersonList() {
      return table.all() 
    },
    async addPerson(item) {
      const id = table.insert(item)
      if (id && handleChange)
        handleChange(id)
    },
    async updatePerson(item) {
      const id = item.id
      table.update(id, item)
      if (handleChange)
        handleChange(id)
    },
    async removePerson(id) {
      table.delete(id)
      if (handleChange)
        handleChange(id)
    }
  }
}


/** The CGM values over time */
export function setupRpcHealthPoint(table: UseSqliteTable<HealthPoint>, handleChange?: (id:number) => void):RpcHealthPoint {
  return {
    getPoint(id) {
      return table.get(id)
    },
    getPointList() {
      return table.all() 
    },
    async addPoint(item) {
      const id = table.insert(item)
      if (id && handleChange)
        handleChange(id)
    },
    async updatePoint(item) {
      const id = item.id
      table.update(id, item)
      if (handleChange)
        handleChange(id)
    },
    async removePoint(id) {
      table.delete(id)
      if (handleChange)
        handleChange(id)
    }
  }
}


/** Events like meals over time */
export function setupRpcHealthEvent(table: UseSqliteTable<HealthEvent>, handleChange?: (id:number) => void):RpcHealthEvent {
  return {
    getEvent(id) {
      return table.get(id)
    },
    getEventList() {
      return table.all() 
    },
    async addEvent(item) {
      const id = table.insert(item)
      if (id && handleChange)
        handleChange(id)
    },
    async updateEvent(item) {
      const id = item.id
      table.update(id, item)
      if (handleChange)
        handleChange(id)
    },
    async removeEvent(id) {
      table.delete(id)
      if (handleChange)
        handleChange(id)
    }
  }
}

