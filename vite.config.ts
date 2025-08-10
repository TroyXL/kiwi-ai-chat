import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import pages from 'vite-plugin-pages'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        'kiwi-channel': path.resolve(__dirname, 'src/lib/kiwi-channel/for-preview/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'kiwi-channel' ? 'kiwi-channel.js' : 'assets/[name]-[hash].js';
        },
      },
    },
  },
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
