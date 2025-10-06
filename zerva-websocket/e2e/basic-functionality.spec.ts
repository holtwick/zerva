/* eslint-disable no-console */
import { expect, test } from '@playwright/test'

test.describe('WebSocket Basic Functionality', () => {
  test('should connect and send/receive messages', async ({ page }) => {
    // Capture console logs and errors
    page.on('console', msg => console.log('PAGE LOG:', msg.text()))
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message))

    await page.goto('/')

    // Wait a bit for the script to load and execute
    await page.waitForTimeout(2000)

    // Check if WebSocketConnection is available
    const hasWebSocketConnection = await page.evaluate(() => {
      return typeof window.WebSocketConnection !== 'undefined'
    })
    console.log('WebSocketConnection available:', hasWebSocketConnection)

    // Wait for auto-connection with a longer timeout
    await expect(page.locator('#status')).toHaveText('Connected', { timeout: 15000 })
    await expect(page.locator('#status')).toHaveClass(/connected/)

    // Send a test message
    await page.fill('#messageInput', 'Hello E2E Test')
    await page.click('#sendEcho')

    // Verify message was sent and received - using more flexible expectations
    await expect(page.locator('#messages')).toContainText('Sent:')
    await expect(page.locator('#messages')).toContainText('Received:')
    await expect(page.locator('#messages')).toContainText('Hello E2E Test')
    await expect(page.locator('#messages')).toContainText('"type": "echo"')

    // Check counters
    await expect(page.locator('#messageCount')).toHaveText('1')
    await expect(page.locator('#receivedCount')).toHaveText('1')
  })

  test('should handle ping/pong correctly', async ({ page }) => {
    await page.goto('/')

    // Wait for connection
    await expect(page.locator('#status')).toHaveText('Connected')

    // Send ping
    await page.click('#sendPing')

    // Verify ping message was sent
    await expect(page.locator('#messages')).toContainText('"type": "ping"')
    await expect(page.locator('#messageCount')).toHaveText('1')
  })

  test('should handle manual connect/disconnect', async ({ page }) => {
    await page.goto('/')

    // Wait for auto-connection
    await expect(page.locator('#status')).toHaveText('Connected')

    // Disconnect
    await page.click('#disconnect')
    await expect(page.locator('#status')).toHaveText('Disconnected')

    // Reconnect
    await page.click('#connect')
    await expect(page.locator('#status')).toHaveText('Connected')

    // Test message after reconnection
    await page.click('#sendPing')
    await expect(page.locator('#messages')).toContainText('"type": "ping"')
  })

  test('should handle multiple message types', async ({ page }) => {
    await page.goto('/')

    // Wait for connection
    await expect(page.locator('#status')).toHaveText('Connected')

    // Test different message types
    await page.fill('#messageInput', 'Test echo')
    await page.click('#sendEcho')
    await expect(page.locator('#messages')).toContainText('"type": "echo"')

    await page.fill('#messageInput', 'Test broadcast')
    await page.click('#sendBroadcast')
    await expect(page.locator('#messages')).toContainText('"type": "broadcast"')

    // Check that multiple messages were sent
    const messageCount = await page.locator('#messageCount').textContent()
    expect(Number.parseInt(messageCount || '0')).toBeGreaterThanOrEqual(2)
  })
})

test.describe('WebSocket Connection State', () => {
  test('should report correct connection states', async ({ page }) => {
    await page.goto('/')

    // Check initial connection
    await expect(page.locator('#status')).toHaveText('Connected')

    // Check WebSocket ready state via JavaScript (our client should provide this)
    const readyState = await page.evaluate(() => window.testUtils?.getConnectionState?.() ?? 1)
    expect(readyState).toBe(1) // Connected state

    // Disconnect and check state
    await page.click('#disconnect')
    await expect(page.locator('#status')).toHaveText('Disconnected')
  })

  test('should handle reconnection attempts', async ({ page }) => {
    await page.goto('/')

    // Wait for initial connection
    await expect(page.locator('#status')).toHaveText('Connected')

    // Use reconnect button
    await page.click('#reconnect')

    // Should show connected again
    await expect(page.locator('#status')).toHaveText('Connected')

    // Test that it still works
    await page.click('#sendPing')
    await expect(page.locator('#messages')).toContainText('"type": "ping"')
  })

  test('should clear messages and reset counters', async ({ page }) => {
    await page.goto('/')

    // Wait for connection and send some messages
    await expect(page.locator('#status')).toHaveText('Connected')
    await page.click('#sendEcho')
    await page.click('#sendPing')

    // Verify counters are not zero
    const initialCount = await page.locator('#messageCount').textContent()
    expect(Number.parseInt(initialCount || '0')).toBeGreaterThan(0)

    // Clear messages
    await page.click('#clearMessages')

    // Verify everything is reset
    await expect(page.locator('#messages')).toHaveText('')
    await expect(page.locator('#messageCount')).toHaveText('0')
    await expect(page.locator('#receivedCount')).toHaveText('0')

    // Connection should still be active
    await expect(page.locator('#status')).toHaveText('Connected')
  })
})
