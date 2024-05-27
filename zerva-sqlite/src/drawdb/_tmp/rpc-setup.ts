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
    addPerson(item) {
      const id = table.insert(item as any)
      if (id && handleChange)
        handleChange(id)
    },
    updatePerson(item) {
      const id = item.id
      table.update(id, item)
      if (handleChange)
        handleChange(id)
    },
    removePerson(id) {
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
    addPoint(item) {
      const id = table.insert(item as any)
      if (id && handleChange)
        handleChange(id)
    },
    updatePoint(item) {
      const id = item.id
      table.update(id, item)
      if (handleChange)
        handleChange(id)
    },
    removePoint(id) {
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
    addEvent(item) {
      const id = table.insert(item as any)
      if (id && handleChange)
        handleChange(id)
    },
    updateEvent(item) {
      const id = item.id
      table.update(id, item)
      if (handleChange)
        handleChange(id)
    },
    removeEvent(id) {
      table.delete(id)
      if (handleChange)
        handleChange(id)
    }
  }
}

