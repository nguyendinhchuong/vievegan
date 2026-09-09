import { expect, test } from '@playwright/test'

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

for (const viewport of viewports) {
  test(`${viewport.name} layout is visible and free of horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('.hero-media img')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Order pickup' }).first()).toBeVisible()

    await page.screenshot({ path: `/tmp/vie-vegan-${viewport.name}-hero.png` })

    const reveals = page.locator('.dish, #story, .service-panel, #visit')
    for (let index = 0; index < await reveals.count(); index += 1) {
      await reveals.nth(index).scrollIntoViewIfNeeded()
      await page.waitForTimeout(700)
    }

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)

    await page.screenshot({ path: `/tmp/vie-vegan-${viewport.name}.png`, fullPage: true })
  })
}

for (const viewport of viewports) {
  test(`404 page is visible and responsive on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/nothing-on-this-plate')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Phở-oh!')
    await expect(page.getByRole('img', { name: /empty phở bowl/i })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back home' })).toHaveAttribute('href', '/')
    await expect(page.getByRole('link', { name: 'See the menu' })).toHaveAttribute('href', '/menu')

    if (viewport.name === 'desktop') {
      const authoredTop = await page.locator('.not-found-art').evaluate(() => {
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules) {
              if (rule.selectorText === '.not-found-art') return rule.style.top
            }
          } catch {
            // Cross-origin stylesheets are not inspectable and do not contain this local rule.
          }
        }
        return null
      })
      expect(authoredTop).toBe('')
    }

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)

    await page.screenshot({ path: `/tmp/vie-vegan-404-${viewport.name}.png`, fullPage: true })
  })
}

test('mobile menu is usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Visit' })).toBeVisible()
  await page.waitForTimeout(600)
  await page.screenshot({ path: '/tmp/vie-vegan-mobile-menu.png' })
})

test('food images move with layered parallax while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const image = page.locator('.dish-parallax-image').first()
  await expect(image).toBeAttached()
  await image.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  const translateBefore = await image.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42)

  await page.mouse.wheel(0, 420)
  await page.waitForTimeout(400)
  const translateAfter = await image.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42)

  expect(Math.abs(translateAfter - translateBefore)).toBeGreaterThanOrEqual(60)
})

test('house favourites uses an aligned seven-five editorial grid', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const dishes = page.locator('.dish')
  await expect(dishes).toHaveCount(4)
  const boxes = await dishes.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().toJSON()))

  expect(boxes[0].width / boxes[1].width).toBeCloseTo(7 / 5, 1)
  expect(boxes[3].width / boxes[2].width).toBeCloseTo(7 / 5, 1)
  expect(Math.abs(boxes[0].left - boxes[2].left)).toBeLessThanOrEqual(2)
  expect(Math.abs(boxes[1].right - boxes[3].right)).toBeLessThanOrEqual(2)
})

for (const viewport of viewports) {
  test(`menu page is complete and responsive on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/menu')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Vietnamese favourites')
    await expect(page.getByRole('navigation', { name: 'Menu categories' })).toBeVisible()
    await expect(page.locator('.menu-category')).toHaveCount(8)

    const reveals = page.locator('.menu-category, .menu-photo-band, .menu-order-cta')
    for (let index = 0; index < await reveals.count(); index += 1) {
      await reveals.nth(index).scrollIntoViewIfNeeded()
      await page.waitForTimeout(350)
    }

    const menuPhotos = page.locator('.menu-photo-band img')
    await expect(menuPhotos).toHaveCount(4)
    for (let index = 0; index < await menuPhotos.count(); index += 1) {
      await expect(menuPhotos.nth(index)).toBeVisible()
    }

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)

    if (viewport.name === 'mobile') {
      await expect(page.locator('.menu-mobile-order')).toBeVisible()
    }

    await page.screenshot({ path: `/tmp/vie-vegan-menu-${viewport.name}.png`, fullPage: true })
  })
}
