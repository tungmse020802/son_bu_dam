import { app } from './index.js'
import { initializeDatabase } from './db.js'

let databaseReady: Promise<void> | null = null

function ensureDatabase() {
  databaseReady ??= initializeDatabase()
  return databaseReady
}

export default async function handler(req: any, res: any) {
  await ensureDatabase()
  return app(req, res)
}
