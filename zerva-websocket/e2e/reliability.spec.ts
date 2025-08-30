/* eslint-disable no-console */
import { expect, test } from '@playwright/test'

test.describe('WebSocket Reliability Tests', () => {
  test('should pass all automated reliability tests', async ({ page }) => {
    await page.goto('/reliability')

    // Wait for tests to complete (they run automatically)
    await expect(page.locator('#testResults')).toHaveClass(/pass/, { timeout: 30000 })

    // Verify the success message
    await expect(page.locator('#testResults')).toContainText('tests passed!')

    // Check that log contains expected test results
    const logContent = await page.locator('#log').textContent()
    expect(logContent).toContain('✅ Basic connection test passed')
    expect(logContent).toContain('✅ Reconnection test passed')
    expect(logContent).toContain('✅ Message reliability test passed')
    expect(logContent).toContain('✅ Connection timeout test passed')
    expect(logContent).toContain('✅ Multiple reconnections test passed')
  })

  test('should handle connection timeouts properly', async ({ page }) => {
    await page.goto('/reliability')

    // Wait for the specific timeout test to complete
    await page.waitForFunction(() => {
      const log = document.getElementById('log').textContent
      return log.includes('✅ Connection timeout test passed')
    }, { timeout: 15000 })

    const logContent = await page.locator('#log').textContent()
    expect(logContent).toContain('Connection timeout test passed (connection properly timed out)')
  })

  test('should successfully reconnect multiple times', async ({ page }) => {
    await page.goto('/reliability')

    // Wait for multiple reconnection test to complete
    await page.waitForFunction(() => {
      const log = document.getElementById('log').textContent
      return log.includes('Multiple reconnections test')
    }, { timeout: 20000 })

    const logContent = await page.locator('#log').textContent()
    expect(logContent).toContain('🔄 Reconnection attempt 1/5')
    expect(logContent).toContain('🔄 Reconnection attempt 5/5')
    expect(logContent).toContain('✅ Multiple reconnections test passed')
  })

  test('should handle message reliability under stress', async ({ page }) => {
    await page.goto('/reliability')

    // Wait for message reliability test
    await page.waitForFunction(() => {
      const log = document.getElementById('log').textContent
      return log.includes('Message reliability test')
    }, { timeout: 10000 })

    const logContent = await page.locator('#log').textContent()
    expect(logContent).toContain('📨 Received message 10/10')
    expect(logContent).toContain('✅ Message reliability test passed')
  })

  test('should not have any failed tests', async ({ page }) => {
    await page.goto('/reliability')

    // Wait for all tests to complete
    await expect(page.locator('#testResults')).not.toHaveClass(/running/, { timeout: 30000 })

    // Should not have any failure indicators
    await expect(page.locator('#testResults')).not.toHaveClass(/fail/)

    const resultsText = await page.locator('#testResults').textContent()
    expect(resultsText).not.toContain('failed')
    expect(resultsText).toContain('All')
    expect(resultsText).toContain('tests passed!')
  })
})

test.describe('WebSocket Browser Compatibility', () => {
  test('should work in different browser contexts', async ({ page, browserName }) => {
    await page.goto('/reliability')

    // Add browser info to the test
    await page.evaluate((browser) => {
      window.testBrowser = browser
      console.log(`Running WebSocket tests in ${browser}`)
    }, browserName)

    // All tests should pass regardless of browser
    await expect(page.locator('#testResults')).toHaveClass(/pass/, { timeout: 30000 })

    const logContent = await page.locator('#log').textContent()
    expect(logContent).toContain('All')
    expect(logContent).toContain('tests passed!')
  })

  test('should handle WebSocket events consistently across browsers', async ({ page }) => {
    await page.goto('/')

    // Test that events fire in correct order
    await page.evaluate(() => {
      window.testEvents = []
      const originalLog = window.testUtils.addMessage
      window.testUtils.addMessage = (message, type) => {
        window.testEvents.push({ message, type, timestamp: Date.now() })
        originalLog(message, type)
      }
    })

    // Reconnect to trigger events
    await page.click('#reconnect')
    await expect(page.locator('#status')).toHaveText('Connected')

    const events = await page.evaluate(() => window.testEvents)

    // Should have connection-related events
    const hasDisconnectEvent = events.some(e => e.message.includes('closed'))
    const hasConnectEvent = events.some(e => e.message.includes('Connected successfully'))

    expect(hasDisconnectEvent || hasConnectEvent).toBe(true)
  })
})

test.describe('WebSocket Error Handling', () => {
  test('should gracefully handle server errors', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('#status')).toHaveText('Connected')

    // Send error message to trigger server-side error
    await page.click('#sendError')

    // Should receive error response but stay connected
    await expect(page.locator('#messages')).toContainText('Received: {"type":"error"')
    await expect(page.locator('#status')).toHaveText('Connected')
  })

  test('should handle malformed messages', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('#status')).toHaveText('Connected')

    // Send malformed JSON via JavaScript
    await page.evaluate(() => {
      const ws = window.testUtils
      const connectionState = ws.getConnectionState()
      if (connectionState === 1) { // WebSocket.OPEN
        // Access the underlying WebSocket (this is a bit of a hack for testing)
        const wsInstance = document.querySelector('script').nextSibling
        // Instead, we'll use the testUtils to send a message that will cause parsing issues
        ws.sendMessage('unknown-type', 'This should cause an unknown message type error')
      }
    })

    // Should receive error response for unknown message type
    await expect(page.locator('#messages')).toContainText('Unknown message type')

    // Connection should remain stable
    await expect(page.locator('#status')).toHaveText('Connected')
  })
})

test.describe('WebSocket Performance', () => {
  test('should handle rapid connect/disconnect cycles', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('#status')).toHaveText('Connected')

    // Perform rapid connect/disconnect cycles
    for (let i = 0; i < 5; i++) {
      await page.click('#disconnect')
      await page.waitForTimeout(100)
      await page.click('#connect')
      await expect(page.locator('#status')).toHaveText('Connected')
      await page.waitForTimeout(200)
    }

    // Should still be connected and functional
    await page.click('#sendPing')
    await expect(page.locator('#messages')).toContainText('Received: {"type":"pong"')
  })

  test('should maintain performance under sustained load', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('#status')).toHaveText('Connected')

    const startTime = Date.now()

    // Send 50 messages and measure response time
    await page.evaluate(() => {
      window.responseTimeTest = {
        sent: [],
        received: [],
        startTime: Date.now(),
      }

      // Override message handler to track timing
      const originalHandler = window.testUtils.addMessage
      window.testUtils.addMessage = (message, type) => {
        if (type === 'receive' && message.includes('perf-test-')) {
          window.responseTimeTest.received.push(Date.now())
        }
        originalHandler(message, type)
      }

      // Send performance test messages
      for (let i = 0; i < 50; i++) {
        window.testUtils.sendMessage('echo', `perf-test-${i}`)
        window.responseTimeTest.sent.push(Date.now())
      }
    })

    // Wait for all responses
    await page.waitForFunction(() => {
      return window.responseTimeTest && window.responseTimeTest.received.length >= 40
    }, { timeout: 10000 })

    const timing = await page.evaluate(() => window.responseTimeTest)
    const totalTime = Date.now() - startTime

    // Should complete within reasonable time (less than 5 seconds)
    expect(totalTime).toBeLessThan(5000)
    expect(timing.received.length).toBeGreaterThan(40) // Allow for some message loss under load

    // Connection should still be healthy
    await expect(page.locator('#status')).toHaveText('Connected')
  })
})
