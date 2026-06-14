export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function readApiJson<T>(response: Response): Promise<T | null> {
  const raw = await response.text()
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function getApiMessage(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null
  const message = (payload as { message?: unknown }).message
  return typeof message === 'string' && message.trim() ? message : null
}
