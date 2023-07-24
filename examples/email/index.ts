import process from 'node:process'
import { emit } from '@zerva/core'
import { useEmail } from '@zerva/email'
import { Logger, setupEnv, valueToInteger, valueToString } from 'zeed'

setupEnv()

const log = Logger('app')
log.info('app')

const transport = {
  host: valueToString(process.env.EMAIL_HOST),
  port: valueToInteger(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: valueToString(process.env.EMAIL_USER),
    pass: valueToString(process.env.EMAIL_PASS),
  },
}

log.info('email transport', JSON.stringify(transport, null, 2))

useEmail({ transport })

void emit('emailSend', {
  to: valueToString(process.env.EMAIL_TO, 'example@example.com'),
})

// serve()
