export class IndexedDB {
  private db: IDBDatabase | null = null
  private readonly DB_NAME = 'MetroDB'
  private readonly VERSION = 1
  private isInitialized = false

  async open(): Promise<IDBDatabase> {
    if (this.db && this.isInitialized) {
      return this.db
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        this.createStores(db)
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        this.isInitialized = true
        resolve(this.db)
      }

      request.onerror = () => {
        reject(new Error(`IndexedDB error: ${request.error?.message}`))
      }
    })
  }

  private createStores(db: IDBDatabase) {
    // Lines
    if (!db.objectStoreNames.contains('lines')) {
      const store = db.createObjectStore('lines', { keyPath: 'id' })
      store.createIndex('name', 'name', { unique: false })
    }

    // Stations
    if (!db.objectStoreNames.contains('stations')) {
      const store = db.createObjectStore('stations', { keyPath: 'id' })
      store.createIndex('line_id', 'line_id', { unique: false })
    }

    // Visuals
    if (!db.objectStoreNames.contains('visuals')) {
      const store = db.createObjectStore('visuals', { keyPath: 'id' })
      store.createIndex('is_transfer', 'is_transfer', { unique: false })
    }

    // Visual-Station Links
    if (!db.objectStoreNames.contains('visual_station_links')) {
      const store = db.createObjectStore('visual_station_links', {
        keyPath: ['visual_id', 'station_id'],
      })
      store.createIndex('visual_id', 'visual_id', { unique: false })
      store.createIndex('station_id', 'station_id', { unique: false })
    }

    // Segments
    if (!db.objectStoreNames.contains('segments')) {
      const store = db.createObjectStore('segments', { keyPath: 'id' })
      store.createIndex('from_station_id', 'from_station_id', { unique: false })
      store.createIndex('to_station_id', 'to_station_id', { unique: false })
    }
  }

  // Получить все записи
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Получить одну запись по ID
  async getById<T>(storeName: string, id: string): Promise<T | undefined> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Добавить или обновить запись
  async put<T>(storeName: string, data: T): Promise<void> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Массовое добавление
  async bulkPut<T>(storeName: string, items: T[]): Promise<void> {
    if (items.length === 0) return

    const db = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)

      let completed = 0
      let hasError = false

      for (const item of items) {
        const request = store.put(item)
        request.onsuccess = () => {
          completed++
          if (completed === items.length && !hasError) {
            resolve()
          }
        }
        request.onerror = () => {
          if (!hasError) {
            hasError = true
            reject(request.error)
          }
        }
      }
    })
  }

  // Обновить конкретное поле
  async update<T extends Record<string, any>>(
    storeName: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    const existing = await this.getById<T>(storeName, id)
    if (!existing) {
      throw new Error(`Record with id ${id} not found in ${storeName}`)
    }

    const updated = { ...existing, ...data }
    await this.put(storeName, updated)
  }

  // Удалить запись
  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Очистить store
  async clear(storeName: string): Promise<void> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async isEmpty(storeName: string): Promise<boolean> {
    try {
      const items = await this.getAll(storeName)
      return items.length === 0
    } catch (error) {
      console.error(`[IndexedDB] isEmpty(${storeName}) error:`, error)
      throw error
    }
  }
}

// Экспортируем синглтон
export const db = new IndexedDB()
