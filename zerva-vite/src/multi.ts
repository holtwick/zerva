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
              // Security: Don't modify URL if it's already been modified
              const originalUrl = req.originalUrl || req.url

              // Security: Validate originalUrl format
              if (!originalUrl || typeof originalUrl !== 'string') {
                next()
                return
              }

              for (const appName in input) {
                // Security: Validate appName to prevent injection
                if (!appName || typeof appName !== 'string' || appName.includes('..') || appName.includes('/')) {
                  continue
                }

                if (originalUrl.startsWith(`/${appName}`)) {
                  // Only modify if not already pointing to index.html
                  if (!req.url.endsWith('/index.html')) {
                    req.url = `/${appName}/index.html`
                  }
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
