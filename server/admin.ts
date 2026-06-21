import type { UserRole } from '../src/types/app.js'

const DEFAULT_ADMIN_EMAIL = 'admin@example.com'

function parseAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? DEFAULT_ADMIN_EMAIL)
      .split(/[\s,;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function getAdminEmails() {
  return parseAdminEmails()
}

export function isAdminEmail(email: string) {
  return getAdminEmails().has(email.trim().toLowerCase())
}

export function resolveUserRole(email: string, storedRole?: UserRole): UserRole {
  if (isAdminEmail(email)) return 'admin'
  return storedRole ?? 'customer'
}

