import { expect, test } from '@playwright/test'

test.describe('Catalog -> Cart -> Checkout -> Order', () => {
  test('customer can complete full flow with mocked order API', async ({ page }) => {
    let orderApiCalled = false

    await page.route('**/api/checkout/csrf', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          csrfToken: 'e2e-csrf'
        })
      })
    })

    await page.route('**/api/order', async (route) => {
      orderApiCalled = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orderId: 'OSF-000001',
          trackToken: 'track-e2e-token',
          message: 'ok'
        })
      })
    })

    await page.goto('/catalog')
    await expect(page.locator('.product-card').first()).toBeVisible()
    await page.evaluate(() => {
      localStorage.setItem(
        'osf_shop_state_v1',
        JSON.stringify({
          cart: [
            {
              id: 'white-halfzip-osf',
              title: 'Свитер полузамок белый OSF',
              price: 699,
              image: '/halfzip-white.png',
              description: 'E2E',
              quantity: 1,
              selectedSize: 'M'
            }
          ],
          wishlist: [],
          cartTouchedAt: new Date().toISOString()
        })
      )
    })

    await page.goto('/cart')
    await expect(page.locator('.cart-card')).toHaveCount(1)
    await page.getByRole('link', { name: /оформлению|checkout/i }).click()

    await expect(page).toHaveURL(/\/checkout/)

    await page.locator('input[autocomplete="name"]').fill('Тест Клиент')
    await page.locator('input[autocomplete="tel-national"]').fill('68123456')
    await page.locator('input[autocomplete="address-level2"]').fill('Chișinău')
    await page.locator('input[autocomplete="street-address"]').fill('Stefan cel Mare')
    await page.locator('input[autocomplete="address-line1"]').fill('10')

    await page.locator('#checkoutForm').evaluate((form) => {
      ;(form as HTMLFormElement).requestSubmit()
    })

    await expect.poll(() => orderApiCalled).toBeTruthy()
    await expect(page.locator('.empty-box')).toBeVisible()
  })
})
