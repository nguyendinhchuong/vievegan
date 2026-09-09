import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Render deployment configuration', () => {
  it('serves the Vite entry point for every client-side route', () => {
    const config = readFileSync(resolve(process.cwd(), 'render.yaml'), 'utf8')

    expect(config).toMatch(/runtime:\s+static/)
    expect(config).toMatch(/staticPublishPath:\s+\.\/dist/)
    expect(config).toMatch(/type:\s+rewrite\s+source:\s+\/\*\s+destination:\s+\/index\.html/s)
  })
})
