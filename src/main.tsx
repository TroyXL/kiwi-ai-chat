import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import routes from '~react-pages'
import { Toaster } from './components/ui/sonner.tsx'

import './i18n'
// geist 字体文件
// eslint-disable-next-line
// @ts-ignore
import '@fontsource-variable/geist'
import { ThemeProvider } from './components/theme-toggle.tsx'
import authController from './controllers/auth-controller.ts'
import './styles/global.css'
import './styles/style.css'

if (authController.isAuthenticated) {
  await authController.checkRedirectUrl()
}

const router = createBrowserRouter(routes)
console.log(routes)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <RouterProvider router={router} />
    <Toaster position="top-right" />
  </ThemeProvider>
)
