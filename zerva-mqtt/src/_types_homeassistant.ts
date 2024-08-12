/// https://github.com/home-assistant/core/blob/d7ac4bd65379e11461c7ce0893d3533d8d8b8cbf/homeassistant/const.py#L379
export type HassUnitOfMeasurement = 'W' | 'kW' | 'V' | 'Wh' | 'kWh' | 'A' | 'VA' | '°' | '€' | '$' | '¢' | '°C' | '°F' | 'K' | 'μs' | 'ms' | 's' | 'min' | 'h' | 'd' | 'w' | 'm' | 'y' | 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft' | 'yd' | 'mi' | 'Hz' | 'GHz' | 'Pa' | 'hPa' | 'bar' | 'mbar' | 'inHg' | 'psi' | 'L' | 'mL' | 'm³' | 'ft³' | 'gal' | 'fl. oz.' | 'm³/h' | 'ft³/m' | 'm²' | 'g' | 'kg' | 'mg' | 'µg' | 'oz' | 'lb' | 'µS/cm' | 'lx' | 'UV index' | '%' | 'W/m²' | 'mm/h' | 'µg/m³' | 'mg/m³' | 'p/m³' | 'ppm' | 'ppb' | 'mm/d' | 'in/d' | 'm/s' | 'in/h' | 'km/h' | 'mph' | 'dB' | 'dBm' | 'bit' | 'kbit' | 'Mbit' | 'Gbit' | 'B' | 'kB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB' | 'ZB' | 'YB' | 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB' | 'EiB' | 'ZiB' | 'YiB' | 'bit/s' | 'kbit/s' | 'Mbit/s' | 'Gbit/s' | 'B/s' | 'kB/s' | 'MB/s' | 'GB/s' | 'KiB/s' | 'MiB/s' | 'GiB/s'

export type HassDeviceClass = 'battery' | 'carbon_monoxide' | 'carbon_dioxide' | 'humidity' | 'illuminance' | 'signal_strength' | 'temperature' | 'timestamp' | 'pressure' | 'power' | 'current' | 'energy' | 'power_factor' | 'voltage'

/**
   * - `measurement`, the state represents a measurement in present time, for example a temperature, electric power, etc.
   *   For supported sensors, statistics of min, max and average sensor readings are updated periodically.
   * - `total`, the state represents a total amount that can both increase and decrease, e.g. a net energy meter.
   *   When supported, the accumulated growth or decline of the sensor's value since it was first added is updated periodically.
   * - `total_increasing`, a monotonically increasing total, e.g. an amount of consumed gas, water or energy. When supported,
   *   the accumulated growth of the sensor's value since it was first added is updated periodically.
   *
   * https://developers.home-assistant.io/blog/2021/09/20/state_class_total/
   */
export type HassStateClass = 'total_increasing' | 'total' | 'measurement'

export interface HassEntityBase {
  unit_of_measurement?: HassUnitOfMeasurement
  // unit_of_meas?: HassUnitOfMeasurement
  device_class?: HassDeviceClass
}

export interface HassEntity extends HassEntityBase {
  '~': string
  unique_id: string
  object_id: string
  name: string
  icon: string
  state_topic: string
  state_class: HassStateClass
  device: any
}
