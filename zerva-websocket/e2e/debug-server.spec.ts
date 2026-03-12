/* eslint-disable no-console */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { expect, test } from '@playwright/test'

test.describe('Debug Server Routes', () => {
  let testServer: any

  test.beforeEach(async () => {
    // Start the test server

    testServer = spawn('node', ['e2e/test-server.js'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
    })

    // Give the server time to start
    await new Promise(resolve => setTimeout(resolve, 3000))
  })

  test.afterEach(async () => {
    if (testServer) {
      testServer.kill()
    }
  })

  test('should serve the main page', async ({ page }) => {
    await page.goto('http://localhost:3000/')

    const title = await page.title()
    console.log('Page title:', title)

    await expect(page).toHaveTitle(/WebSocket E2E Test Page/)
  })

  test('should serve the WebSocket client bundle', async ({ page }) => {
    // Try to fetch the JavaScript bundle directly
    const response = await page.goto('http://localhost:3000/websocket-client.js') as any

    console.log('Response status:', response.status())
    console.log('Response headers:', await response.allHeaders())

    if (response.status() === 200) {
      const content = await response.text()
      console.log('Bundle content length:', content.length)
      console.log('Bundle starts with:', content.substring(0, 200))
    }

    expect(response.status()).toBe(200)
  })
})
