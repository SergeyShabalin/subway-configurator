export abstract class BaseService {
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }

  protected handleError(error: unknown, context: string): never {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[${context}] Error:`, error)
    throw new Error(`${context}: ${message}`)
  }
}
