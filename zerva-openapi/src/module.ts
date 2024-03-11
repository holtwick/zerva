// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { on, register } from '@zerva/core'
import '@zerva/http'
import { Logger } from 'zeed'

// @ts-ignore 
import indexCss from './static/index.css.txt'
// @ts-ignore 
import swaggerUiBundle from './static/swagger-ui-bundle.js.txt'
// @ts-ignore 
import swaggerUiPreset from './static/swagger-ui-standalone-preset.js.txt'
// @ts-ignore 
import swaggerUiCss from './static/swagger-ui.css.txt'

const name = 'openapi'
const log = Logger(`zerva:${name}`)

interface Config {
  path: string
  data: object
}

export function useOpenApi(config: Config) {
  log.info(`use ${name}`)
  register(name)

  const { path = '/api-docs', data } = config

  on('httpInit', ({ app, get }) => {
    get(`${path}/swagger.json`, data)

    get(`${path}/index.css`, indexCss)
    get(`${path}/swagger-ui.css`, swaggerUiCss)
    get(`${path}/swagger-ui-bundle.js`, swaggerUiBundle)
    get(`${path}/swagger-ui-standalone-preset.js`, swaggerUiPreset)

    get(
      `${path}`,
      () => `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>API Docs</title>
          <link rel="stylesheet" type="text/css" href="${path}/swagger-ui.css" />
          <link rel="stylesheet" type="text/css" href="${path}/index.css" /> 
        </head>
      
        <body>
          <div id="swagger-ui"></div>
          <script src="${path}/swagger-ui-bundle.js" charset="UTF-8"> </script>
          <script src="${path}/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>  
          <script>
          window.onload = function() {            
            window.ui = SwaggerUIBundle({
              url: "${path}/swagger.json",
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout"
            });
          };
          </script>          
        </body>
      </html>
       `,
    )
  })
}
