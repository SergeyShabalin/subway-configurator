import { importMetroData } from '@/src/lib/indexeddb/migrations/importData'

async function migrate() {
  console.log('Starting IndexedDB migration...')
  try {
    await importMetroData()
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()
