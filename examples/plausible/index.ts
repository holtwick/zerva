// Simple demo for node and CommonJS loading

import process from 'node:process'
import { emit, on, serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { usePlausible } from '@zerva/plausible'
import { Logger, setupEnv, suid, valueToInteger } from 'zeed'

setupEnv()

const log = Logger('app')

useHttp({
  port: valueToInteger(process.env.PORT, 8080),
})

usePlausible({
  apiEventUrl: process.env.PLAUSIBLE_API_EVENT_URL!,
  websiteId: process.env.PLAUSIBLE_WEBSITE_ID!,
})

on('httpInit', ({ get }) => {
  get(
    '/',
    '<a href="/trackEvent">trackEvent</a><br><a href="/trackPageView">trackPageView</a>',
  )

  const event = suid()

  get('/trackEvent', ({ req }) => {
    void emit(
      'trackEvent',
      req,
      'sample',
      { event: 'event', os: event },
    )
    return event
  })

  get('/trackPageView', ({ req }) => {
    void emit('trackPageView', req, `/${event}`)
    return event
  })
})

void serve()
