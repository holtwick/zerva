import { hassComponent } from './homeassistant'

describe('hass-mqtt.spec', () => {
  it('should do something', async () => {
    const comp = hassComponent('comp1')
    const v1 = comp('val1', {
      name: 'Just some value',
      unit_of_measurement: 'ms',
    })
    expect(v1.info).toMatchInlineSnapshot(`
      {
        "device": {
          "identifiers": [
            "comp1",
          ],
          "manufacturer": "comp1",
          "model": "comp1",
          "name": "comp1",
          "sw_version": "1.0.0",
        },
        "icon": "mdi:lightning-bolt-circle",
        "name": "Just some value",
        "object_id": "comp1_val1",
        "state_class": "measurement",
        "state_topic": "~/val1",
        "unique_id": "comp1_val1",
        "unit_of_measurement": "ms",
        "~": "comp1",
      }
    `)
  })
})
