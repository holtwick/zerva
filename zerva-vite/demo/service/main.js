import { serve, useHttp } from "@zerva/core"
import { useVite } from "zerva-vite"

useHttp({
  port: 8080,
})

useVite({
  root: "..",
})

serve()
