// Simple demo for node and CommonJS loading

import { on, serve } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { escape } from "node:querystring"
import { Logger, LoggerInterface, uuid, isString, setupEnv, fetchJson, encodeQuery, fetchOptionsJson } from "zeed"
var session = require('express-session')

const log: LoggerInterface = Logger("basic-auth")

log('start')

setupEnv()

useHttp()

const callbackPath = '/auth/callback'

const {
  OAUTH2_URL: urlBase = '',
  OAUTH2_CALLBACK_URL: redirectUri = `http://localhost:8080${callbackPath}`,
  OAUTH2_CLIENT_ID: clientId = '',
  OAUTH2_CLIENT_SECRET: clientSecret = ''
} = process.env ?? {}

// const urlRedirect = `${urlBase}/login/oauth/authorize?client_id=${escape(clientId)}&redirect_uri=${escape(urlCallback)}&response_type=code&state=${uuid()}`
const authorizationUri = `${urlBase}/login/oauth/authorize`
const accessTokenUri = `${urlBase}/login/oauth/access_token`

log('settings', {
  clientId,
  clientSecret,
  accessTokenUri,
  authorizationUri,
  redirectUri
})

on("httpInit", ({ app, get }) => {

  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))

  get(
    "/",
    `<p>
      Not protected.
    </p>
    <p>
      <a href="/protected">But this one is with test:test</a>.
    </p>`
  )

  let authInfo: any

  async function getTokenWithCode(code: string) {
    return await fetchJson(accessTokenUri, fetchOptionsJson({
      "client_id": clientId,
      "client_secret": clientSecret,
      "code": code,
      "grant_type": "authorization_code",
      "redirect_uri": redirectUri
    }))
  }

  get(callbackPath, async ({ req, res }) => {
    log('auth', req.query)
    const { code, state } = req.query
    if (isString(code)) {
      authInfo = await getTokenWithCode(code)
      log('authInfo', authInfo)
      if (authInfo) {
        return res.redirect('/')
      }
    }
    return 'FAIL'
  })

  get('/login', ({ req, res }) => {
    const uri = `${authorizationUri}?client_id=${escape(clientId)}&redirect_uri=${escape(redirectUri)}&response_type=code&state=${uuid()}`
    log('redirect uri', uri)
    res.redirect(301, uri)
  })

  get("/protected",
    ({ req, res }) => {
      if (!authInfo)
        return res.redirect('/login')

      return `<p>
        This should be protected:
      </p>
        User: ${(req as any).user}
      <p>
        <a href="/logout">Logout</a>
      </p>`
    })

})

serve()
