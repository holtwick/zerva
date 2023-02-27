import { serve, onStop } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { useVite } from "@zerva/vite"
import { Logger, sleep } from "zeed"
import { useCounter } from "./module"

const log = Logger("service")

// const isProduction = process.env.ZERVA_PRODUCTION

useHttp()

useVite()

useCounter()

// onStop(async () => {
//   await sleep(1000)
//   log('Cleanup done')
// })

serve()
