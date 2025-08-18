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
        'kiwi-channel': path.resolve(
          __dirname,
          'src/lib/kiwi-channel/for-preview/index.ts'
        ),
      },
      output: {
        entryFileNames: chunkInfo => {
          return chunkInfo.name === 'kiwi-channel'
            ? 'kiwi-channel.js'
            : 'assets/[name]-[hash].js'
        },
      },
    },
  },
  server: {
    fs: {
      // 允许访问项目根目录下的所有文件
      allow: ['.'],
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
    // 添加自定义插件，支持热编译并通过 /kiwi-channel.js 访问
    {
      name: 'kiwi-channel-dev',
      configureServer(server) {
        // 添加中间件处理 /kiwi-channel.js 请求
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/kiwi-channel.js') {
            // 动态导入模块，支持热更新
            try {
              // 清除缓存以确保获取最新版本
              const modulePath = path.resolve(
                __dirname,
                'src/lib/kiwi-channel/for-preview/index.ts'
              )
              // 使用 Vite 的转换功能处理 TypeScript 文件
              const result = await server.transformRequest(modulePath)
              const jsCode =
                result?.code || `alert('Kiwi Channel Compile Failed')`

              res.setHeader('Content-Type', 'application/javascript')
              res.end(jsCode)
            } catch (error: unknown) {
              console.error('Error serving kiwi-channel.js:', error)
              res.statusCode = 500
              res.end(
                `console.error('Error loading kiwi-channel: ${
                  (error as Error).message || 'Unknown error'
                }')`
              )
            }
            return
          }
          next()
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
