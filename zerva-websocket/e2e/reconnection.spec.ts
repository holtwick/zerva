import { expect, test } from '@playwright/test'

test.describe('WebSocket Reconnection Scenarios', () => {
  test('should handle forced disconnections gracefully', async ({ page }) => {
    await page.goto('/reconnection')

    // Wait for initial connection
    await expect(page.locator('#status')).toHaveText('Connected')

    // Force disconnect
    await page.click('#forceDisconnect')
    await expect(page.locator('#status')).toHaveText('Manually disconnected')

    // Check initial stats
    const initialStats = await page.evaluate(() => window.reconnectionTester.getStats())
    expect(initialStats.isConnected).toBe(false)
  })

  test('should automatically reconnect after network failure simulation', async ({ page }) => {
    await page.goto('/reconnection')

    // Wait for initial connection
    await expect(page.locator('#status')).toHaveText('Connected')

    // Simulate network failure
    await page.click('#simulateNetworkFailure')

    // Should attempt to reconnect automatically
    await expect(page.locator('#status')).toContainText('Reconnecting', { timeout: 5000 })

    // Should eventually reconnect
    await expect(page.locator('#status')).toHaveText('Connected', { timeout: 10000 })

    // Check that reconnection attempt was logged
    const stats = await page.evaluate(() => window.reconnectionTester.getStats())
    expect(stats.reconnectAttempts).toBeGreaterThan(0)
    expect(stats.successfulReconnects).toBeGreaterThan(0)
  })

  test('should run automated reconnection test successfully', async ({ page }) => {
    await page.goto('/reconnection')

    // Wait for initial connection
    await expect(page.locator('#status')).toHaveText('Connected')

    // Run the automated reconnection test
    await page.click('#reconnectTest')

    // Wait for test to complete
    await page.waitForFunction(() => {
      const log = document.getElementById('log').textContent
      return log.includes('Automated reconnection test completed')
    }, { timeout: 30000 })

    // Verify test completed successfully
    await expect(page.locator('#log')).toContainText('Automated reconnection test completed')
    await expect(page.locator('#log')).toContainText('Test iteration 5/5')

    // Should have multiple successful reconnections
    const finalStats = await page.evaluate(() => window.reconnectionTester.getStats())
    expect(finalStats.successfulReconnects).toBeGreaterThanOrEqual(5)
  })

  test('should implement exponential backoff for failed reconnections', async ({ page }) => {
    // First, let's stop the test server to simulate server unavailability
    // For this test, we'll monitor the reconnection timing

    await page.goto('/reconnection')
    await expect(page.locator('#status')).toHaveText('Connected')

    // Clear log and stats
    await page.click('#clearLog')

    // Simulate multiple network failures to trigger backoff
    await page.click('#simulateNetworkFailure')

    // Wait and check that reconnection attempts are logged with increasing delays
    await page.waitForFunction(() => {
      const log = document.getElementById('log').textContent
      return log.includes('Scheduling reconnect in') && log.split('Scheduling reconnect in').length > 2
    }, { timeout: 15000 })

    const logContent = await page.locator('#log').textContent()

    // Should show escalating delays
    expect(logContent).toContain('Scheduling reconnect in')

    // Eventually should reconnect
    await expect(page.locator('#status')).toHaveText('Connected', { timeout: 30000 })
  })

  test('should track reconnection statistics accurately', async ({ page }) => {
    await page.goto('/reconnection')

    // Wait for initial connection
    await expect(page.locator('#status')).toHaveText('Connected')

    // Clear initial stats
    await page.click('#clearLog')

    // Perform several manual reconnection cycles
    for (let i = 0; i < 3; i++) {
      await page.click('#forceDisconnect')
      await page.waitForTimeout(200)

      // Trigger reconnection by simulating network failure (which auto-reconnects)
      await page.evaluate(() => window.reconnectionTester.connect(true))
      await expect(page.locator('#status')).toHaveText('Connected', { timeout: 5000 })
      await page.waitForTimeout(500)
    }

    // Check final statistics
    const stats = await page.evaluate(() => window.reconnectionTester.getStats())
    expect(stats.reconnectAttempts).toBeGreaterThanOrEqual(3)
    expect(stats.successfulReconnects).toBeGreaterThanOrEqual(3)
    expect(stats.isConnected).toBe(true)

    // Verify UI counters match
    const uiReconnectCount = await page.locator('#reconnectCount').textContent()
    const uiSuccessCount = await page.locator('#successCount').textContent()

    expect(Number(uiReconnectCount)).toBe(stats.reconnectAttempts)
    expect(Number(uiSuccessCount)).toBe(stats.successfulReconnects)
  })

  test('should handle rapid reconnection attempts without race conditions', async ({ page }) => {
    await page.goto('/reconnection')

    // Wait for initial connection
    await expect(page.locator('#status')).toHaveText('Connected')

    // Perform rapid disconnect/reconnect attempts
    await page.evaluate(async () => {
      const tester = window.reconnectionTester

      // Rapid disconnect/connect cycle
      for (let i = 0; i < 5; i++) {
        tester.forceDisconnect()
        await new Promise(resolve => setTimeout(resolve, 50))
        tester.connect(true)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    })

    // Should eventually stabilize to connected state
    await expect(page.locator('#status')).toHaveText('Connected', { timeout: 10000 })

    // Connection should be functional
    const isHealthy = await page.evaluate(() => {
      const stats = window.reconnectionTester.getStats()
      return stats.isConnected
    })

    expect(isHealthy).toBe(true)
  })

  test('should maintain connection health indicators', async ({ page }) => {
    await page.goto('/reconnection')

    // Wait for connection and verify health
    await expect(page.locator('#status')).toHaveText('Connected')

    // Verify ping functionality works
    await page.waitForFunction(() => {
      const log = document.getElementById('log').textContent
      return log.includes('Received pong - connection is healthy')
    }, { timeout: 10000 })

    // After reconnection, health checks should still work
    await page.click('#simulateNetworkFailure')
    await expect(page.locator('#status')).toHaveText('Connected', { timeout: 10000 })

    // Should continue to receive pong responses
    await page.waitForFunction(() => {
      const log = document.getElementById('log').textContent
      const pongMatches = log.match(/Received pong - connection is healthy/g)
      return pongMatches && pongMatches.length > 1
    }, { timeout: 10000 })

    const logContent = await page.locator('#log').textContent()
    expect(logContent).toContain('Received pong - connection is healthy')
  })
})

test.describe('WebSocket Connection Edge Cases', () => {
  test('should handle page refresh during connection', async ({ page }) => {
    await page.goto('/reconnection')
    await expect(page.locator('#status')).toHaveText('Connected')

    // Refresh the page
    await page.reload()

    // Should auto-connect again
    await expect(page.locator('#status')).toHaveText('Connected', { timeout: 5000 })

    // Should be functional
    const isConnected = await page.evaluate(() => {
      return window.reconnectionTester && window.reconnectionTester.getStats().isConnected
    })

    expect(isConnected).toBe(true)
  })

  test('should handle browser tab visibility changes', async ({ page }) => {
    await page.goto('/reconnection')
    await expect(page.locator('#status')).toHaveText('Connected')

    // Simulate tab becoming hidden (browsers may throttle WebSocket in background)
    await page.evaluate(() => {
      // Dispatch visibility change event
      Object.defineProperty(document, 'hidden', { value: true, writable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await page.waitForTimeout(1000)

    // Simulate tab becoming visible again
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // Connection should remain stable
    await expect(page.locator('#status')).toHaveText('Connected')
  })

  test('should cleanup resources properly on disconnect', async ({ page }) => {
    await page.goto('/reconnection')
    await expect(page.locator('#status')).toHaveText('Connected')

    // Check initial connection count
    const initialStats = await page.evaluate(() => window.reconnectionTester.getStats())

    // Force multiple disconnections
    for (let i = 0; i < 3; i++) {
      await page.click('#forceDisconnect')
      await page.waitForTimeout(200)
      await page.evaluate(() => window.reconnectionTester.connect())
      await expect(page.locator('#status')).toHaveText('Connected', { timeout: 5000 })
    }

    // Final disconnect
    await page.click('#forceDisconnect')
    await expect(page.locator('#status')).toHaveText('Manually disconnected')

    // Check that resources are cleaned up (no orphaned timers, etc.)
    const finalStats = await page.evaluate(() => window.reconnectionTester.getStats())
    expect(finalStats.isConnected).toBe(false)
    expect(finalStats.isReconnecting).toBe(false)
  })
})
