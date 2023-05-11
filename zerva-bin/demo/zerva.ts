// @ts-expect-error
import { Logger } from 'zeed'
import readme from '../README.md'

// @ts-expect-error
import data from './data.yml'

console.log('test via console', readme.length, data)
const log = Logger('test8')
log.info('test via zeed')

if (TEST)
  console.log('test')
else
  console.log('no test')

function catchSome() {
  throw new Error('fake')
}

// test
// catchSome()
