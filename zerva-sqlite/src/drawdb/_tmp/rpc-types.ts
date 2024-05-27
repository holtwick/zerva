import type { HealthEvent, HealthPerson, HealthPoint } from './types'

/** Person details and sensor provider login */
export interface RpcHealthPerson {
  getPersonList: () => HealthPerson[]
  addPerson: (item: Omit<HealthPerson, 'id' | 'created' | 'updated'>) => Promise<HealthPerson | undefined>
  updatePerson: (item: Partial<HealthPerson> & {id: number}) => Promise<void>
  removePerson: (id: number) => Promise<undefined>
}

/** The CGM values over time */
export interface RpcHealthPoint {
  getPointList: () => HealthPoint[]
  addPoint: (item: Omit<HealthPoint, 'id' | 'created' | 'updated'>) => Promise<HealthPoint | undefined>
  updatePoint: (item: Partial<HealthPoint> & {id: number}) => Promise<void>
  removePoint: (id: number) => Promise<undefined>
}

/** Events like meals over time */
export interface RpcHealthEvent {
  getEventList: () => HealthEvent[]
  addEvent: (item: Omit<HealthEvent, 'id' | 'created' | 'updated'>) => Promise<HealthEvent | undefined>
  updateEvent: (item: Partial<HealthEvent> & {id: number}) => Promise<void>
  removeEvent: (id: number) => Promise<undefined>
}

export type RpcHealth = RpcHealthEvent | RpcHealthPerson | RpcHealthPoint
