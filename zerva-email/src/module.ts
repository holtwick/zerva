// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { on, register } from '@zerva/core'
import nodemailer from 'nodemailer'
import type { LogConfig } from 'zeed'
import { LogLevelInfo, LoggerFromConfig } from 'zeed'
import type { ZEmailConfig } from './types'

const moduleName = 'email'

export function useEmail(config: ZEmailConfig & { log?: LogConfig }) {
  const log = LoggerFromConfig(config?.log, moduleName, LogLevelInfo)
  const { transport } = config
  log.info(`use ${moduleName}`)
  register(moduleName)
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
