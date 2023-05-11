// Simple demo for node and CommonJS loading

import { escape } from 'node:querystring'
import { on, serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import type { LoggerInterface } from 'zeed'
import { Logger, fetchJson, fetchOptionsJson, isString, setupEnv, uuid } from 'zeed'
import session from 'express-session'
import type { HttpNextFunction, HttpRequest, HttpResponse, zervaHttpInterface } from '@zerva/http'

declare module 'express-session' {
  interface SessionData {
    oauth2: any
  }
}

const log: LoggerInterface = Logger('basic-auth')

log('start')

setupEnv()

useHttp()

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
    secret: 'YLHJyZ&dSxeBn@hcbKcU@6wpDvG9',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  }))

  onGET(
    '/',
    `<p>
      Not protected.
    </p>
    <p>
      <a href="/protected">But this one is with test:test</a>.
    </p>`,
  )

  let authInfo: any

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
      authInfo = await getTokenWithCode(code)
      log('authInfo', authInfo)

      // todo connect with session
      if (authInfo)
        return res.redirect('/')
    }
    return 'FAIL'
  })

  onGET('/login', ({ req, res }) => {
    // https://www.oauth.com/oauth2-servers/accessing-data/authorization-request/
    const uri = `${authorizationUri}?client_id=${escape(clientId)}&redirect_uri=${escape(redirectUri)}&response_type=code&state=${uuid()}`
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

  function oauth2(req: HttpRequest, res: HttpResponse, next: HttpNextFunction) {
    let oauth2 = req.session.oauth2
    if (!oauth2) {
      oauth2 = {
        id: uuid(),
      }
      req.session.oauth2 = oauth2
    }

    if (!authInfo)
      return res.redirect('/login')
  }

  onGET('/protected', oauth2,
    ({ req, res }) => {
      if (!authInfo)
        return res.redirect('/login')

      return `<p>
        This should be protected:
      </p>
        User: ${undefined}
      <p>
        <a href="/logout">Logout</a>
      </p>`
    })
})

void serve()
