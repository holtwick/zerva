import type { LoggerInterface } from 'zeed'
import { Logger } from 'zeed'
import { emit } from '@zerva/core'
import type { HassEntity } from './_types_homeassistant'

const log: LoggerInterface = Logger('hass-mqtt')

const DISCOVERY_PREFIX = 'homeassistant'

export function hassValue(
  component: string,
  id: string,
  entity?: Partial<HassEntity>,
) {
  const object_id = `${component}_${id}`

  // https://www.home-assistant.io/docs/energy/faq/
  const payload: HassEntity = {
    '~': component,
    'unique_id': object_id,
    object_id,
    'name': id,
    'icon': 'mdi:lightning-bolt-circle',
    'state_topic': `~/${id}`,
    'state_class': 'measurement',

    // 'entity_category': 'diagnostic',
    // 'availability_topic': '~/connection',
    // 'payload_available': 'connected',
    // 'payload_not_available': 'connection lost',

    'device': {
      identifiers: [component],
      name: component,
      model: component, // 'Meter Digitizer',
      manufacturer: component, // 'AI on the Edge Device',
      sw_version: '1.0.0', // 'v13.0.8',
      // configuration_url: 'http://192.168.0.171',
    },

    ...entity,
  }

  // log.info('Device:', payload)

  let ctr = 0

  return {
    info: payload,
    send(value: any) {
      try {
        emit('mqttPublish',
          `${component}/${id}`,
          JSON.stringify(value),
        )

        if (ctr++ % 60) {
          emit('mqttPublish',
            `${DISCOVERY_PREFIX}/sensor/${component}/${id}/config`,
            JSON.stringify(payload),
          )
        }
      }
      catch (err) {
        log.error('error', id, value, err)
      }
      return value
    },
  }
}

export function hassComponent(id: string) {
  return hassValue.bind(null, id)
}
