import { fromBase64String } from "zeed"

const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/
const USER_PASS_REGEXP = /^([^:]*):(.*)$/

export function getAuthorization(req: any) {
  return req.headers.authorization
}

export function parse(string: string) {

  // parse header
  const match = CREDENTIALS_REGEXP.exec(string)

  if (match) {
    const userPass = USER_PASS_REGEXP.exec(fromBase64String(match[1]))

    if (userPass) {
      return {
        user: userPass[1],
        password: userPass[2]
      }
    }
  }
}

export function auth(req: any) {
  return parse(getAuthorization(req))
}

