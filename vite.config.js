import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import { pages } from './src/data/seo.js'

function staticPagePreview() {
  return {
    name: 'static-page-preview',
    configurePreviewServer(server) {
      // Serve the same page files a static production host should serve.
      // Vite's default SPA fallback otherwise returns the homepage for /about.
      server.middlewares.use(async (req, res, next) => {
        if (!['GET', 'HEAD'].includes(req.method)) return next()
        const url = new URL(req.url, 'http://localhost')
        const route = pages.find((page) => page.path === (url.pathname.replace(/\/$/, '') || '/'))
        if (route) {
          req.url = `${route.path === '/' ? '' : route.path}/index.html${url.search}`
          return next()
        }
        const root = resolve(server.config.root, server.config.build.outDir)
        let file
        try {
          file = resolve(root, `.${decodeURIComponent(url.pathname)}`)
          if (file.startsWith(root + sep) && (await stat(file)).isFile()) return next()
        } catch {
          // Missing and invalid paths are handled by the static 404 below.
        }
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        if (req.method === 'HEAD') return res.end()
        createReadStream(resolve(root, '404.html')).on('error', () => res.end()).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), staticPagePreview()],
})
