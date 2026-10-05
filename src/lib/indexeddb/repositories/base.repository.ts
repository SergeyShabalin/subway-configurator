import { db } from '../db'

export interface IRepository<T> {
  getAll(): Promise<Array<T>>
  getById(id: string): Promise<T | undefined>
  save(entity: T): Promise<void>
  saveMany(entities: Array<T>): Promise<void>
  update(id: string, data: Partial<T>): Promise<void>
  delete(id: string): Promise<void>
  clear(): Promise<void>
  isEmpty(): Promise<boolean>
}

export abstract class BaseRepository<T extends { id: string }> implements IRepository<T> {
  protected abstract storeName: string

  async getAll(): Promise<Array<T>> {
    return db.getAll<T>(this.storeName)
  }

  async getById(id: string): Promise<T | undefined> {
    return db.getById<T>(this.storeName, id)
  }

  async save(entity: T): Promise<void> {
    return db.put<T>(this.storeName, entity)
  }

  async saveMany(entities: Array<T>): Promise<void> {
    return db.bulkPut<T>(this.storeName, entities)
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    return db.update<T>(this.storeName, id, data)
  }

  async delete(id: string): Promise<void> {
    return db.delete(this.storeName, id)
  }

  async clear(): Promise<void> {
    return db.clear(this.storeName)
  }

  async isEmpty(): Promise<boolean> {
    try {
      return await db.isEmpty(this.storeName)
    } catch (error) {
      console.error(` [${this.storeName}] isEmpty error:`, error)
      return true
    }
  }
}
