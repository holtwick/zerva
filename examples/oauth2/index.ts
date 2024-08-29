// Simple demo for node and CommonJS loading

import process from 'node:process'
import { on, serve } from '@zerva/core'
import type { NextFunction, Request, Response } from '@zerva/http'
import { useHttp } from '@zerva/http'
import session from 'express-session'
import type { LoggerInterface } from 'zeed'
import { Logger, encodeQuery, fetchJson, fetchOptionsJson, getTimestamp, isString, setupEnv, uuid } from 'zeed'

interface AuthInfo {
  // uuid?: string
  // state?: string
  timestamp?: number

  access_token?: string

  refresh_token?: string

  /** The “expires_in” value is the number of seconds that the access token will be valid. */
  expires_in?: number

  token_type?: string
}

declare module 'express-session' {
  interface SessionData {
    authInfo: AuthInfo
    state: string
    lastUrl: string
    // uuid?: string
    views?: any
  }
}

const log: LoggerInterface = Logger('basic-auth')

log('start')

setupEnv()

useHttp({
  // noExtras: true,
})

on('serveStop', () => log('done'))

const callbackPath = '/auth/callback'

// e.g. https://docs.gitea.io/en-us/development/oauth2-provider/

const {
  OAUTH2_URL: urlBase = '',
  OAUTH2_CALLBACK_URL: redirectUri = `http://localhost:8080${callbackPath}`,
  OAUTH2_CLIENT_ID: clientId = '',
  OAUTH2_CLIENT_SECRET: clientSecret = '',
  OAUTH2_SCOPE: scope = 'user',
} = process.env ?? {}

const authorizationUri = `${urlBase}/login/oauth/authorize`
const accessTokenUri = `${urlBase}/login/oauth/access_token`

log('settings', {
  clientId,
  clientSecret,
  accessTokenUri,
  authorizationUri,
  redirectUri,
})

async function getTokenWithCode(code: string) {
  // https://www.oauth.com/oauth2-servers/accessing-data/obtaining-an-access-token/
  return await fetchJson(accessTokenUri, fetchOptionsJson({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  }))
}

async function getTokenRefresh(refresh_token: string) {
  // https://www.oauth.com/oauth2-servers/making-authenticated-requests/refreshing-an-access-token/
  return await fetchJson(accessTokenUri, fetchOptionsJson({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    refresh_token,
  }))
}

/** Middleware for oauth2 */
function oauth2(req: Request, res: Response, next: NextFunction) {
  log.info('middleware oauth', req.url)
  if (!req.session.authInfo?.access_token) {
    log('requires login')
    req.session.lastUrl = req.url
    res.redirect(307, '/login')
  }
  next()
}

on('httpInit', (info) => {
  const { app, onGET } = info

  app.set('trust proxy', 1) // trust first proxy

  app.use(session({
    name: 'app',
    secret: 'YLHJyZdSxeBnhcbKcUwpDvG',
    resave: false,
    saveUninitialized: true,
  }))

  // app.use((req, res, next) => {
  //   log('init session', req.session.authInfo)
  //   // if (!req.session.uuid)
  //   //   req.session.uuid = uuid()
  //   // if (!req.session.authInfo)
  //   //   req.session.authInfo = { uuid: uuid() }
  //   next()
  // })

  onGET(
    '/',
    req => `<p>
      Not protected.
    </p>
    <p>
      <a href="/protected">But this one requires authentication.</a>.
      <pre>${JSON.stringify(req.session.authInfo, null, 2)}</pre>
    </p>`,
  )

  onGET(callbackPath, async ({ req, res }) => {
    log('auth', req.query)
    const { code, state } = req.query

    if (req.session.state !== state)
      return `different states ${req.session.state} !== ${state}`

    if (!isString(code))
      return 'no code'

    const authResponse = await getTokenWithCode(code)
    log('authInfo', authResponse)
    if (!authResponse)
      return 'no response'

    req.session.authInfo = {
      ...authResponse as any,
      timestamp: getTimestamp(),
    }

    // log.info('redirect', req.url, req.session.lastUrl)

    res.redirect(307, req.session.lastUrl || '/')
  })

  /** Authorize */
  onGET('/login', ({ req, res }) => {
    // https://www.oauth.com/oauth2-servers/accessing-data/authorization-request/

    const state = uuid()
    req.session.state = state

    const query = encodeQuery({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope,
    })

    const uri = `${authorizationUri}?${query}`
    log('redirect uri', uri)
    res.redirect(307, uri)
  })

  /** Forget about the authorization */
  onGET('/logout', ({ req, res }) => {
    req.session.authInfo = undefined
    res.redirect(307, '/')
  })

  onGET('/protected',
    oauth2,
    async ({ req }) => {
      log('/protected')
      let user: any = ''

      if (req.session.authInfo?.access_token)
        user = await fetchJson(`${urlBase}/api/v1/user?access_token=${req.session.authInfo?.access_token}`)

      return `<p>
        This should be protected:
      </p>
      AuthInfo
      <pre>${JSON.stringify(req.session.authInfo, null, 2)}</pre>
        User: 
        <pre>${JSON.stringify(user, null, 2)}</pre>
      <p>
        <a href="/logout">Logout</a>
      </p>
       
      `
    },
  )
})

void serve()
