import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let tempDir: string
let dbPath: string

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'svam-db-test-'))
  dbPath = path.join(tempDir, 'db.json')
  vi.resetModules()
  process.env.JSON_DB_PATH = dbPath
  delete process.env.ADMIN_EMAILS
})

afterEach(async () => {
  delete process.env.JSON_DB_PATH
  delete process.env.ADMIN_EMAILS
  await fs.rm(tempDir, { recursive: true, force: true })
})

describe('database initialization', () => {
  it('seeds a default admin when the database is empty', async () => {
    const { initializeDatabase } = await import('../db')

    await initializeDatabase()

    const store = JSON.parse(await fs.readFile(dbPath, 'utf8')) as {
      users: Array<{ email: string; fullName: string; passwordHash: string; role: string }>
    }

    expect(store.users).toHaveLength(1)
    expect(store.users[0]).toMatchObject({
      email: 'admin@example.com',
      fullName: 'Admin',
      role: 'admin',
    })
    expect(await bcrypt.compare('12345678', store.users[0].passwordHash)).toBe(true)
  })

  it('upgrades an existing admin email to admin role', async () => {
    await fs.writeFile(
      dbPath,
      JSON.stringify(
        {
          users: [
            {
              id: 'user-1',
              fullName: 'Demo User',
              email: 'admin@example.com',
              passwordHash: 'hash',
              role: 'customer',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
          orders: [],
          orderItems: [],
          webhookEvents: [],
        },
        null,
        2,
      ),
    )

    const { initializeDatabase } = await import('../db')

    await initializeDatabase()

    const store = JSON.parse(await fs.readFile(dbPath, 'utf8')) as {
      users: Array<{ email: string; role: string }>
    }

    expect(store.users).toHaveLength(1)
    expect(store.users[0]).toMatchObject({
      email: 'admin@example.com',
      role: 'admin',
    })
  })
})
