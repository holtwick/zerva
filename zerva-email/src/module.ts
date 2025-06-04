import type { LogConfig } from 'zeed'
import type { ZEmailConfig } from './types'
import { on, registerModule } from '@zerva/core'
import nodemailer from 'nodemailer'
import { LogLevelInfo } from 'zeed'

const moduleName = 'email'

export function useEmail(config: ZEmailConfig & { log?: LogConfig }) {
  const { log } = registerModule(moduleName, {
    log: config.log,
    logLevel: LogLevelInfo,
  })

  const { transport } = config

  on('emailSend', async (info) => {
    const {
      to,
      from = 'zerva@holtwick.de',
      subject = 'Zerva Email',
      text = 'Message from Zerva',
      ...others
    } = info
    log.info(`will send to ${to}`)

    return new Promise((resolve, reject) => {
      const transporter = nodemailer.createTransport(transport)
      transporter.sendMail(
        {
          to,
          from,
          subject,
          text,
          ...others,
        },
        (error, info) => {
          if (error) {
            log.error(error)
            reject(error)
          }
          else {
            log.info(`Email sent to ${to}: ${info.response}`)
            resolve(info.response)
          }
        },
      )
    })
  })
}
