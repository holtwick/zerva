export {}
import { SendMailOptions } from "nodemailer"

// https://nodemailer.com/smtp/
export interface ZEmailConfig extends Record<string, any> {}

// https://nodemailer.com/message/
export interface ZEmailMessage extends SendMailOptions {
  to: string
}

declare global {
  interface ZContextEvents {
    emailSend(msg: ZEmailMessage): Promise<string>
  }
}
