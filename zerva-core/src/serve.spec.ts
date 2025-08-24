import { emit, getContext, getServerState, on, onInit, onStart, onStop, resetServerState, serve, ServerState, serveStop, setContext } from './index'

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
      resetServerState()
    })

    it('should start in IDLE state', () => {
      expect(getServerState()).toBe(ServerState.IDLE)
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
      expect(getServerState()).toBe(ServerState.IDLE)

      // Start server
      await serve()
      expect(getServerState()).toBe(ServerState.RUNNING)

      // Stop server
      await serveStop()
      expect(getServerState()).toBe(ServerState.DISPOSED)

      // Check state transitions occurred in the right order
      expect(stateTransitions).toEqual([
        ServerState.STARTED, // During serveInit (before RUNNING state is set)
        ServerState.STARTED, // During serveStart (before RUNNING state is set)
        ServerState.STOPPING, // During serveStop
        ServerState.DISPOSED, // During serveDispose
      ])
    })

    it('should handle multiple serveStop calls gracefully', async () => {
      await serve()
      expect(getServerState()).toBe(ServerState.RUNNING)

      const disposePromise1 = serveStop()
      const disposePromise2 = serveStop()

      await Promise.all([disposePromise1, disposePromise2])
      expect(getServerState()).toBe(ServerState.DISPOSED)
    })

    it('should not allow starting from non-IDLE state', async () => {
      await serve()
      expect(getServerState()).toBe(ServerState.RUNNING)

      // Try to serve again - should not change state (warning is logged but we can't easily test it)
      await serve()
      expect(getServerState()).toBe(ServerState.RUNNING)
    })

    it('should warn when directly emitting serveStop instead of calling serveStop()', async () => {
      await serve()

      // Directly emit serveStop (wrong way) - should warn but we can't easily test the warning
      await emit('serveStop')

      // The important thing is that the server is still in RUNNING state and wasn't stopped properly
      expect(getServerState()).toBe(ServerState.RUNNING)
    })

    it('should handle serveStop when not running', async () => {
      // serveStop when IDLE should not throw or change state
      expect(getServerState()).toBe(ServerState.IDLE)
      await serveStop()
      expect(getServerState()).toBe(ServerState.IDLE)
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
      expect(getServerState()).toBe(ServerState.IDLE)
      expect(getServerState() === ServerState.IDLE).toBe(true)
      expect(getServerState() === ServerState.RUNNING).toBe(false)
    })
  })
})
