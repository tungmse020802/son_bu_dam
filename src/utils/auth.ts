import { API_BASE_URL, getApiMessage, readApiJson } from './api'
import type { AuthUser } from '../types/app'

const AUTH_USER_KEY = 'svam-auth-user'

function loadLocalUser() {
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function saveLocalUser(user: AuthUser) {
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ ...user, role: user.role ?? 'customer' }))
}

function clearLocalUser() {
  window.localStorage.removeItem(AUTH_USER_KEY)
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth-me`, {
    credentials: 'include',
  })

  if (response.status === 401) {
    return loadLocalUser()
  }

  const data = await readApiJson<{ user?: AuthUser; message?: string }>(response)
  if (!response.ok) {
    throw new Error(getApiMessage(data) ?? 'Không tải được phiên đăng nhập.')
  }

  if (!data?.user) {
    return loadLocalUser()
  }

  const user = { ...data.user, role: data.user.role ?? 'customer' }
  saveLocalUser(user)
  return user
}

export async function registerUser(input: { fullName: string; email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/api/auth-register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  const data = await readApiJson<{ user?: AuthUser; message?: string }>(response)
  if (!response.ok) {
    throw new Error(getApiMessage(data) ?? 'Không thể tạo tài khoản.')
  }
  if (!data?.user) {
    throw new Error('Phản hồi từ máy chủ không hợp lệ.')
  }

  const user = { ...data.user, role: data.user.role ?? 'customer' }
  saveLocalUser(user)
  return user
}

export async function loginUser(input: { email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/api/auth-login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  const data = await readApiJson<{ user?: AuthUser; message?: string }>(response)
  if (!response.ok) {
    throw new Error(getApiMessage(data) ?? 'Đăng nhập thất bại.')
  }
  if (!data?.user) {
    throw new Error('Phản hồi từ máy chủ không hợp lệ.')
  }

  const user = { ...data.user, role: data.user.role ?? 'customer' }
  saveLocalUser(user)
  return user
}

export async function logoutUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth-logout`, {
      method: 'POST',
      credentials: 'include',
    })

    const data = await readApiJson<{ message?: string }>(response)
    if (!response.ok) {
      throw new Error(getApiMessage(data) ?? 'Đăng xuất thất bại.')
    }
  } finally {
    clearLocalUser()
  }
}
