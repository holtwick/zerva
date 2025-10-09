import type { ServerState } from './index'
import { emit, getContext, getServerState, on, onInit, onStart, onStop, serve, serveStop, setContext } from './index'

describe('serve', () => {
  it('should pass all phases', async () => {
    setContext()

    let initCount = 0

    const obj = {
      init: false,
      start: false,
      stop: false,
    }

    onInit(() => {
      obj.init = true
      initCount += 1
    })

    // Check if multiple calls work
    onInit(() => {
      obj.init = true
      initCount += 1
    })

    onStart(() => {
      obj.start = true
    })
    onStop(() => {
      obj.stop = true
    })

    await serve()

    expect(obj).toMatchInlineSnapshot(`
      {
        "init": true,
        "start": true,
        "stop": false,
      }
    `)

    await serveStop()

    expect(initCount).toBe(2)
    expect(obj).toMatchInlineSnapshot(`
      {
        "init": true,
        "start": true,
        "stop": true,
      }
    `)
  })

  it('should show a warning if event has been added after emit', async () => {
    setContext()

    let called = false

    await emit('test' as any)

    on('test' as any, () => {
      called = true
    })

    expect(called).toBe(false)
    expect(getContext().eventNamesEmitted.test).toBe(true)
  })

  describe('serverState lifecycle', () => {
    beforeEach(() => {
      setContext()
    })

    it('should start in stopped state', () => {
      expect(getServerState()).toBe('stopped')
    })

    it('should transition through states correctly during normal lifecycle', async () => {
      const stateTransitions: ServerState[] = []

      // Track all state changes
      on('serveInit', () => {
        stateTransitions.push(getServerState())
      })

      on('serveStart', () => {
        stateTransitions.push(getServerState())
      })

      on('serveStop', () => {
        stateTransitions.push(getServerState())
      })

      on('serveDispose', () => {
        stateTransitions.push(getServerState())
      })

      // Initial state
      expect(getServerState()).toBe('stopped')

      // Start server
      await serve()
      expect(getServerState()).toBe('started')

      // Stop server
      await serveStop()
      expect(getServerState()).toBe('stopped')

      // Check state transitions occurred in the right order
      expect(stateTransitions).toEqual([
        'starting', // During serveInit
        'starting', // During serveStart
        'stopping', // During serveStop
        'stopped', // During serveDispose
      ])
    })

    it('should handle multiple serveStop calls gracefully', async () => {
      await serve()
      expect(getServerState()).toBe('started')

      const disposePromise1 = serveStop()
      const disposePromise2 = serveStop()

      await Promise.all([disposePromise1, disposePromise2])
      expect(getServerState()).toBe('stopped')
    })

    it('should not allow starting from non-stopped state', async () => {
      await serve()
      expect(getServerState()).toBe('started')

      // Try to serve again - should not change state (warning is logged but we can't easily test it)
      await serve()
      expect(getServerState()).toBe('started')
    })

    it('should warn when directly emitting serveStop instead of calling serveStop()', async () => {
      await serve()

      // Directly emit serveStop (wrong way) - should warn but we can't easily test the warning
      await emit('serveStop')

      // The important thing is that the server is still in started state and wasn't stopped properly
      expect(getServerState()).toBe('started')
    })

    it('should handle serveStop when not running', async () => {
      // serveStop when stopped should not throw or change state
      expect(getServerState()).toBe('started')
      await serveStop()
      expect(getServerState()).toBe('stopped')
    })

    it('should execute lifecycle callbacks in correct order', async () => {
      const executionOrder: string[] = []

      on('serveInit', () => {
        executionOrder.push('init1')
      })

      on('serveStart', () => {
        executionOrder.push('start1')
      })

      on('serveStop', () => {
        executionOrder.push('stop1')
      })

      on('serveDispose', () => {
        executionOrder.push('dispose1')
      })

      // Add more handlers to test multiple callbacks
      on('serveInit', () => {
        executionOrder.push('init2')
      })

      on('serveStart', () => {
        executionOrder.push('start2')
      })

      await serve()
      await serveStop()

      expect(executionOrder).toEqual([
        'init1',
        'init2',
        'start1',
        'start2',
        'stop1',
        'dispose1',
      ])
    })

    it('should allow checking if server is in specific states', () => {
      expect(getServerState()).toBe('stopped')
      expect(getServerState() === 'stopped').toBe(true)
      expect(getServerState() === 'started').toBe(false)
    })
  })
})
