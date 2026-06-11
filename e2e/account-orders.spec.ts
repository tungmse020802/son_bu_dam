import { expect, test } from '@playwright/test'

test('user can register, create a COD order, and see it in account', async ({ page }) => {
  const email = `buyer${Date.now()}@example.com`

  await page.goto('/account')
  await page.getByRole('button', { name: /Tạo tài khoản/i }).first().click()
  await page.getByPlaceholder('Nguyễn Văn A').fill('Nguyễn Văn Buyer')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Tối thiểu 8 ký tự').fill('12345678')
  await page.getByPlaceholder('Nhập lại mật khẩu').fill('12345678')
  await page.locator('form.auth-card button[type="submit"]').click()

  await page.getByRole('link', { name: /Sản phẩm/i }).click()
  await page.getByRole('button', { name: /Thêm vào giỏ hàng/i }).first().click()
  await page.getByRole('link', { name: /Giỏ hàng/i }).click()
  await page.getByPlaceholder('Số nhà, đường, quận/huyện, tỉnh/thành').fill('Hà Nội')
  await page.getByRole('combobox').selectOption('cod')
  await page.getByRole('button', { name: /Hoàn tất thanh toán/i }).click()

  await expect(page).toHaveURL(/checkout\/success/)
  await page.goto('/account')
  await expect(page.getByText(/DH-/)).toBeVisible()
  await expect(page.getByText('Đồng bộ từ đơn hàng thật của tài khoản')).toBeVisible()
})
