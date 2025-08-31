# 🌱 Zerva useHttp

> Express web server.

Emits `httpInit` before the server starts. Use this to set up custom routes. The custom helpers `get`, `post` and `addStatic` help to make this a concise operation. You also have access to `http` and `app` to get the full power of Express and attach e.g. WebSocket servers. See [zerva-websocket](https://github.com/holtwick/zerva-websocket) for demos.

`httpRunning` is emitted after the web server is listening.

On `httpStop` you can do some optional cleanup for your web server.

## Minimal Example

Will serve on `http://localhost:8080`:

```ts
import { serve } from '@zerva/core'
import { useHttp } from '@zerva/http'

useHttp()
serve()
```

## Config

```ts
interface Config {
  host?: string
  port?: number // default: 8080
  sslCrt?: string
  sslKey?: string
}
```
