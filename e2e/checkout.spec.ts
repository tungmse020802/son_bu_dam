import { expect, test } from '@playwright/test'

test('user can create a mock payment order and confirm it', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Sản phẩm/i }).click()
  await page.getByRole('button', { name: /Thêm vào giỏ hàng/i }).first().click()
  await page.getByRole('link', { name: /Giỏ hàng/i }).click()

  await page.getByPlaceholder('Nguyễn Văn A').fill('Lê Minh An')
  await page.getByPlaceholder('you@example.com').fill('an@example.com')
  await page.getByPlaceholder('Số nhà, đường, quận/huyện, tỉnh/thành').fill('Hà Nội')
  await page.getByRole('combobox').selectOption('bank')
  await page.getByRole('button', { name: /Hoàn tất thanh toán/i }).click()

  await expect(page).toHaveURL(/checkout\/success/)
  await expect(page.getByText('Đơn chuyển khoản đã được tạo')).toBeVisible()
})

test('user can create a COD order without payment redirect', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Sản phẩm/i }).click()
  await page.getByRole('button', { name: /Thêm vào giỏ hàng/i }).first().click()
  await page.getByRole('link', { name: /Giỏ hàng/i }).click()

  await page.getByPlaceholder('Nguyễn Văn A').fill('Lê Minh An')
  await page.getByPlaceholder('you@example.com').fill('an@example.com')
  await page.getByPlaceholder('Số nhà, đường, quận/huyện, tỉnh/thành').fill('Hà Nội')
  await page.getByRole('combobox').selectOption('cod')
  await page.getByRole('button', { name: /Hoàn tất thanh toán/i }).click()

  await expect(page).toHaveURL(/checkout\/success/)
  await expect(page.getByText('Đơn COD đã được ghi nhận')).toBeVisible()
})
