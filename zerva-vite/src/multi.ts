// https://github.com/vitejs/vite/issues/4042
export function zervaMultiPageAppIndexRouting() {
  return {
    name: 'zerva-multi-page-routing',
    configureServer(server: any) {
      return () => {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          for (const appName in server.config.build.rollupOptions.input) {
            if (req.originalUrl.startsWith(`/${appName}`)) {
              req.url = `/${appName}/index.html`
              break
            }
          }
          next()
        })
      }
    },
  }
}
