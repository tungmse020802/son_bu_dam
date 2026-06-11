import { expect, test } from '@playwright/test'

test('user can register, stay logged in, and see account info', async ({ page }) => {
  const email = `user${Date.now()}@example.com`

  await page.goto('/account')
  await page.getByRole('button', { name: /Tạo tài khoản/i }).first().click()
  await page.getByPlaceholder('Nguyễn Văn A').fill('Nguyễn Văn Test')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Tối thiểu 8 ký tự').fill('12345678')
  await page.getByPlaceholder('Nhập lại mật khẩu').fill('12345678')
  await page.locator('form.auth-card button[type="submit"]').click()

  await expect(page.getByRole('heading', { name: 'Nguyễn Văn Test' })).toBeVisible()
  await expect(page.getByText(email)).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Nguyễn Văn Test' })).toBeVisible()

  await page.getByLabel('Đăng xuất').click()
  await expect(page.getByRole('link', { name: /Đăng nhập/i })).toBeVisible()
})
