/* eslint-disable no-console */
import process from 'node:process'
import { Logger } from 'zeed'
// @ts-expect-error xxx
import readme from '../README.md'
import data from './data.yml'

console.log('test via console', readme.length, data)
const log = Logger('test8')
log.info('test via zeed')
log.info('dump ZEED =', process.env.ZEED)
log.info('dump ZERVA =', globalThis.ZERVA)

if (TEST)
  console.log('test')
else
  console.log('no test')

function catchSome() {
  throw new Error('fake')
}
