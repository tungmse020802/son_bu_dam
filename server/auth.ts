import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import type { Request, Response } from 'express'
import type { UserRole } from '../src/types/app.js'
import { resolveUserRole } from './admin.js'
import {
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  findValidPasswordReset,
  insertGoogleUser,
  insertPasswordResetToken,
  insertUser,
  linkGoogleId,
  markPasswordResetUsed,
  updateUserPassword,
  type StoredUser,
} from './db.js'
import { sendPasswordResetEmail } from './email.js'

const SESSION_COOKIE_NAME = 'svam_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'svam-dev-session-secret'
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30

export type AuthUser = {
  id: string
  fullName: string
  email: string
  role: UserRole
}

function createId() {
  return crypto.randomUUID()
}

function mapUser(row: Pick<StoredUser, 'id' | 'fullName' | 'email'> & Partial<Pick<StoredUser, 'role'>>): AuthUser {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    role: resolveUserRole(row.email, row.role),
  }
}

function signSessionPayload(payload: string) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
}

function signSession(user: AuthUser, expiresAt: number) {
  const payload = Buffer.from(
    JSON.stringify({
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      role: resolveUserRole(user.email, user.role),
      expiresAt,
    }),
  ).toString('base64url')
  const signature = signSessionPayload(payload)
  return `v2.${payload}.${signature}`
}

function signLegacySession(userId: string, expiresAt: number) {
  const payload = `${userId}.${expiresAt}`
  const signature = signSessionPayload(payload)
  return `${payload}.${signature}`
}

function parseSessionValue(value: string) {
  if (value.startsWith('v2.')) {
    const [, payload, signature] = value.split('.')
    if (!payload || !signature) return null

    const expectedSignature = signSessionPayload(payload)
    if (signature !== expectedSignature) return null

    try {
      const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
        userId?: string
        fullName?: string
        email?: string
        role?: UserRole
        expiresAt?: number
      }

      if (!parsed.userId || !parsed.fullName || !parsed.email || !parsed.expiresAt) return null
      if (!Number.isFinite(parsed.expiresAt) || Date.now() > parsed.expiresAt) return null

      return {
        userId: parsed.userId,
        expiresAt: parsed.expiresAt,
        user: {
          id: parsed.userId,
          fullName: parsed.fullName,
          email: parsed.email,
          role: resolveUserRole(parsed.email, parsed.role),
        } satisfies AuthUser,
      }
    } catch {
      return null
    }
  }

  const [userId, expiresAtRaw, signature] = value.split('.')
  if (!userId || !expiresAtRaw || !signature) return null

  const payload = `${userId}.${expiresAtRaw}`
  const expectedSignature = signSessionPayload(payload)
  if (signature !== expectedSignature) return null

  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null

  return { userId, expiresAt }
}

export function setAuthSession(res: Response, userId: string) {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const sessionValue = signLegacySession(userId, expiresAt)

  res.cookie(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(expiresAt),
    path: '/',
  })
}

export function setUserAuthSession(res: Response, user: AuthUser) {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const sessionValue = signSession(user, expiresAt)

  res.cookie(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(expiresAt),
    path: '/',
  })
}

export function clearAuthSession(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}

export async function createUser(input: { fullName: string; email: string; password: string }) {
  const fullName = input.fullName.trim()
  const email = input.email.trim().toLowerCase()
  const password = input.password.trim()

  if (!fullName || !email || !password) {
    throw new Error('Vui lòng nhập đầy đủ họ tên, email và mật khẩu.')
  }

  if (password.length < 8) {
    throw new Error('Mật khẩu cần ít nhất 8 ký tự.')
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    throw new Error('Email này đã được sử dụng.')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await insertUser({ id: createId(), fullName, email, passwordHash, role: resolveUserRole(email) })

  return mapUser(user)
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase()
  const password = input.password

  if (!email || !password) {
    throw new Error('Vui lòng nhập email và mật khẩu.')
  }

  const user = await findUserByEmail(email)
  if (!user) {
    throw new Error('Email hoặc mật khẩu không đúng.')
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    throw new Error('Email hoặc mật khẩu không đúng.')
  }

  return mapUser(user)
}

export async function getUserById(userId: string) {
  const user = await findUserById(userId)
  return user ? mapUser(user) : null
}

export async function getAuthUserFromRequest(req: Request) {
  const sessionValue = req.cookies?.[SESSION_COOKIE_NAME]
  if (!sessionValue || typeof sessionValue !== 'string') {
    return null
  }

  const parsed = parseSessionValue(sessionValue)
  if (!parsed) {
    return null
  }

  const user = await getUserById(parsed.userId)
  return user ?? parsed.user ?? null
}

// --- GOOGLE AUTHENTICATION & PASSWORD RESET MANAGEMENT ---

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null

export async function loginWithGoogle(idToken: string) {
  if (!googleClient || !googleClientId) {
    throw new Error('Đăng nhập Google chưa được cấu hình trên máy chủ.')
  }
  if (!idToken) {
    throw new Error('Thiếu mã xác thực Google Credential.')
  }

  const ticket = await googleClient.verifyIdToken({ idToken, audience: googleClientId })
  const payload = ticket.getPayload()

  if (!payload?.email) {
    throw new Error('Không lấy được thông tin email từ Google.')
  }

  const email = payload.email.trim().toLowerCase()
  const fullName = payload.name?.trim() || email.split('@')[0]
  const googleId = payload.sub

  const existingByGoogle = await findUserByGoogleId(googleId)
  if (existingByGoogle) {
    return mapUser(existingByGoogle)
  }

  const existingByEmail = await findUserByEmail(email)
  if (existingByEmail) {
    const linked = await linkGoogleId(existingByEmail.id, googleId)
    const updatedUser = await findUserById(existingByEmail.id)
    if (!updatedUser) throw new Error('Không thể liên kết tài khoản Google.')
    return mapUser(updatedUser)
  }

  const randomPassword = crypto.randomBytes(24).toString('hex')
  const passwordHash = await bcrypt.hash(randomPassword, 10)
  const created = await insertGoogleUser({
    id: createId(),
    fullName,
    email,
    googleId,
    passwordHash,
    role: resolveUserRole(email),
  })

  return mapUser(created)
}

function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    throw new Error('Vui lòng nhập email.')
  }

  const user = await findUserByEmail(normalizedEmail)
  if (!user) {
    return
  }

  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashResetToken(rawToken)
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString()

  await insertPasswordResetToken({ id: createId(), userId: user.id, tokenHash, expiresAt })

  const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:5173'
  const resetUrl = `${appBaseUrl}/reset-password?token=${rawToken}`

  await sendPasswordResetEmail(user.email, resetUrl)
}

export async function resetPassword(token: string, newPassword: string) {
  if (!token) {
    throw new Error('Liên kết đặt lại mật khẩu không hợp lệ.')
  }
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Mật khẩu mới cần ít nhất 8 ký tự.')
  }

  const tokenHash = hashResetToken(token)
  const record = await findValidPasswordReset(tokenHash)
  if (!record) {
    throw new Error('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.')
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await updateUserPassword(record.userId, passwordHash)
  await markPasswordResetUsed(record.id)
}