import { fromBase64String } from "zeed"

var CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/
var USER_PASS_REGEXP = /^([^:]*):(.*)$/


/**
 * Get the Authorization header from request object.
 */
function getAuthorization(req: any) {
  return req.headers.authorization
}

/**
 * Parse basic auth to object.
 */
export function parse(string: string) {

  // parse header
  var match = CREDENTIALS_REGEXP.exec(string)

  if (!match) {
    return undefined
  }

  // decode user pass
  var userPass = USER_PASS_REGEXP.exec(fromBase64String(match[1]))

  if (!userPass) {
    return undefined
  }

  // return credentials object
  return {
    user: userPass[1],
    password: userPass[2]
  }
}

/**
 * Parse the Authorization header field of a request.
 */
export function auth(req: any) {
  // get header
  var header = getAuthorization(req)

  // parse header
  return parse(header)
}

