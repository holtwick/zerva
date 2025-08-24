// https://github.com/vitejs/vite/issues/4042

/**
 * Vite plugin for multi-page app routing
 * Maps requests to appropriate index.html files based on app name
 */
export function zervaMultiPageAppIndexRouting() {
  return {
    name: 'zerva-multi-page-routing',
    configureServer(server: any) {
      return () => {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          try {
            const input = server.config?.build?.rollupOptions?.input
            if (input && typeof input === 'object') {
              for (const appName in input) {
                if (req.originalUrl.startsWith(`/${appName}`)) {
                  req.url = `/${appName}/index.html`
                  break
                }
              }
            }
          }
          catch (err) {
            // Continue with original URL if routing fails
            console.warn('Multi-page routing error:', err)
          }
          next()
        })
      }
    },
  }
}
