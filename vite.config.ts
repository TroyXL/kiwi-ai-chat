import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig, build } from 'vite'
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
            try {
              const modulePath = path.resolve(
                __dirname,
                'src/lib/kiwi-channel/for-preview/index.ts'
              )
              
              // 使用 vite build API 动态构建 UMD 格式
              const result = await build({
                configFile: false,
                build: {
                  lib: {
                    entry: modulePath,
                    name: 'KiwiChannel',
                    formats: ['umd'],
                    fileName: () => 'kiwi-channel.js'
                  },
                  write: false,
                  rollupOptions: {
                    external: [],
                    output: {
                      globals: {}
                    }
                  }
                },
                define: {
                  'process.env.NODE_ENV': '"development"'
                }
              })
              
              // 获取构建结果
              const output = Array.isArray(result) ? result[0] : result
              if ('output' in output && output.output.length > 0) {
                const chunk = output.output[0]
                if ('code' in chunk) {
                  res.setHeader('Content-Type', 'application/javascript')
                  res.end(chunk.code)
                  return
                }
              }
              
              throw new Error('Failed to generate UMD bundle')
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
