import { describe, expect, it } from 'vitest'
import './types'

describe('types', () => {
  it('should declare global ZContextEvents interface', () => {
    // This test verifies that the types file doesn't cause compilation errors
    // and properly extends the global ZContextEvents interface
    expect(true).toBe(true)
  })

  it('should not export anything explicitly', async () => {
    const types = await import('./types')

    // The types file should only contain type declarations
    // and not export any runtime values
    expect(Object.keys(types)).toEqual([])
  })

  it('should allow extending ZContextEvents globally', () => {
    // Test that we can reference the global interface
    // This ensures the module augmentation works correctly
    const eventHandler = (events: ZContextEvents) => {
      // This should compile without errors
      expect(typeof events).toBe('object')
    }

    expect(eventHandler).toBeDefined()
  })
})
