import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import pages from 'vite-plugin-pages'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    pages({
      dirs: 'src/pages',
      exclude: ['**/components/**/*'],
      extensions: ['tsx'],
      importMode: 'async',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
