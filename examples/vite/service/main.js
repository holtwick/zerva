import { serve, useHttp } from "zerva"
import { useVite } from "zerva-vite"

useHttp({
  port: 8080,
})

useVite({
  root: "..",
})

serve()
