// Simple demo for node and CommonJS loading

import { on, serve } from '@zerva/core'
import type { NextFunction, Request, Response, zervaHttpInterface } from '@zerva/http'
import { useHttp } from '@zerva/http'
import session from 'express-session'
import type { LoggerInterface } from 'zeed'
import { Logger, fetchJson, fetchOptionsJson, isString, setupEnv, uuid } from 'zeed'

interface AuthInfo {
  uuid?: string
  state?: string
  timestamp?: number
  access_token?: string

  /** The “expires_in” value is the number of seconds that the access token will be valid. */
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

declare module 'express-session' {
  interface SessionData {
    authInfo: AuthInfo
    uuid?: string
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
} = process.env ?? {}

// const urlRedirect = `${urlBase}/login/oauth/authorize?client_id=${escape(clientId)}&redirect_uri=${escape(urlCallback)}&response_type=code&state=${uuid()}`
const authorizationUri = `${urlBase}/login/oauth/authorize`
const accessTokenUri = `${urlBase}/login/oauth/access_token`

log('settings', {
  clientId,
  clientSecret,
  accessTokenUri,
  authorizationUri,
  redirectUri,
})

on('httpInit', (info) => {
  const { app, onGET } = info as zervaHttpInterface

  app.set('trust proxy', 1) // trust first proxy

  app.use(session({
    name: 'app',
    secret: 'YLHJyZdSxeBnhcbKcUwpDvG',
    resave: false,
    saveUninitialized: true,
  }))

  app.use((req, res, next) => {
    log('init session', req.session.authInfo)
    // if (!req.session.uuid)
    //   req.session.uuid = uuid()
    if (!req.session.authInfo)
      req.session.authInfo = { uuid: uuid() }
    next()
  })

  onGET(
    '/',
    req => `<p>
      Not protected.
    </p>
    <p>
      <a href="/protected">But this one is with test:test</a>.
      <pre>${JSON.stringify(req.session.authInfo, null, 2)}</pre>
    </p>`,
  )

  async function getTokenWithCode(code: string) {
    // https://www.oauth.com/oauth2-servers/accessing-data/obtaining-an-access-token/
    return await fetchJson(accessTokenUri, fetchOptionsJson({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }))
  }

  async function getTokenRefresh(token: string) {
    // https://www.oauth.com/oauth2-servers/making-authenticated-requests/refreshing-an-access-token/
    return await fetchJson(accessTokenUri, fetchOptionsJson({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      refresh_token: token,
    }))
  }

  onGET(callbackPath, async ({ req, res }) => {
    log('auth', req.query)
    const { code, state } = req.query
    if (isString(code)) {
      const authResponse = await getTokenWithCode(code)
      log('authInfo', authResponse)
      if (authResponse) {
        if (req.session.authInfo?.state === state) {
          Object.assign(req.session.authInfo!, authResponse)
          return res.redirect('/')
        }
        else {
          return `different states ${req.session.authInfo?.state} !== ${state}`
        }
      }
      else {
        return 'no response'
      }
    }
    else {
      return 'no code'
    }
  })

  onGET('/login', ({ req, res }) => {
    // https://www.oauth.com/oauth2-servers/accessing-data/authorization-request/

    const state = uuid()
    req.session.authInfo!.state = state
    const uri = `${authorizationUri}?client_id=${escape(clientId)}&redirect_uri=${escape(redirectUri)}&response_type=code&state=${state}`
    log('redirect uri', uri)
    res.redirect(301, uri)
  })

  onGET('/logout', ({ req, res }) => {
    // todo
    // // https://www.oauth.com/oauth2-servers/accessing-data/authorization-request/
    // const uri = `${authorizationUri}?client_id=${escape(clientId)}&redirect_uri=${escape(redirectUri)}&response_type=code&state=${uuid()}`
    // log('redirect uri', uri)
    // res.redirect(301, uri)
  })

  function oauth2(req: Request, res: Response, next: NextFunction) {
    log('middleware oauth')
    if (req.session.authInfo?.access_token)
      next()
    res.redirect('/login')
  }

  onGET('/protected',
    oauth2,
    ({ req }) => `<p>
        This should be protected:
      </p>
        User: ${req.session.authInfo}
      <p>
        <a href="/logout">Logout</a>
      </p>`,
  )
})

void serve()
