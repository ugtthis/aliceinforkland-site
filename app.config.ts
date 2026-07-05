import { defineConfig } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    preset: 'static',
    prerender: {
      routes: ['/', '/compare', '/404.html'],
      crawlLinks: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
