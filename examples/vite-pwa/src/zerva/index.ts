import { serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { useVite } from '@zerva/vite'
import { Logger } from 'zeed'
import { useCounter } from './module'

const log = Logger('service')

// const isProduction = process.env.ZERVA_PRODUCTION

useHttp()

useVite()

useCounter()

void serve()
