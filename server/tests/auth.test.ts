import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockFindUserByEmail = vi.fn()
const mockFindUserById = vi.fn()
const mockInsertUser = vi.fn()

vi.mock('../db', () => ({
  findUserByEmail: mockFindUserByEmail,
  findUserById: mockFindUserById,
  insertUser: mockInsertUser,
}))

describe('auth service', () => {
  beforeEach(() => {
    mockFindUserByEmail.mockReset()
    mockFindUserById.mockReset()
    mockInsertUser.mockReset()
    vi.resetModules()
  })

  it('creates user with normalized email', async () => {
    mockFindUserByEmail.mockResolvedValueOnce(null)
    mockInsertUser.mockResolvedValueOnce({
      id: 'user-1',
      fullName: 'Nguyễn Văn A',
      email: 'a@example.com',
      passwordHash: 'hashed',
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const { createUser } = await import('../auth')
    const user = await createUser({ fullName: 'Nguyễn Văn A', email: ' A@Example.com ', password: '12345678' })

    expect(user).toEqual({ id: 'user-1', fullName: 'Nguyễn Văn A', email: 'a@example.com', role: 'customer' })
    expect(mockFindUserByEmail).toHaveBeenCalledWith('a@example.com')
    expect(mockInsertUser).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Nguyễn Văn A',
        email: 'a@example.com',
        role: 'customer',
      }),
    )
  })

  it('rejects duplicate email on register', async () => {
    mockFindUserByEmail.mockResolvedValueOnce({ id: 'user-1' })

    const { createUser } = await import('../auth')
    await expect(
      createUser({ fullName: 'Nguyễn Văn A', email: 'a@example.com', password: '12345678' }),
    ).rejects.toThrow('Email này đã được sử dụng.')
  })

  it('rejects wrong password on login', async () => {
    mockFindUserByEmail.mockResolvedValueOnce({
      id: 'user-1',
      fullName: 'Nguyễn Văn A',
      email: 'a@example.com',
      passwordHash: '$2b$10$6b2ipA2Q9vJ4Ajl2Wc0wUOw6Q5TjAs7Z6tSOvDq3PcM8T2D1Y4M7W',
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const { loginUser } = await import('../auth')
    await expect(loginUser({ email: 'a@example.com', password: 'wrongpass' })).rejects.toThrow(
      'Email hoặc mật khẩu không đúng.',
    )
  })
})
