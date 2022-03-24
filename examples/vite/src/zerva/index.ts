import { serve } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { useVite } from "@zerva/vite"
import { Logger, toPath } from "zeed"
import { useCounter } from "./module"

const log = Logger("service")

const isProduction = process.env.ZERVA_PRODUCTION

useHttp({
  port: 8080,
})

useVite({
  root: toPath("."),
  www: toPath("www"),
})

useCounter()

serve()
