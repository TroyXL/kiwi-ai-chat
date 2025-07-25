import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import routes from '~react-pages'
import { Toaster } from './components/ui/sonner.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { themeAdaptor } from './lib/theme-adaptor.ts'

import './i18n' // Import the i18next configuration
import './styles/global.css'
import './styles/style.css'

themeAdaptor()
const router = createBrowserRouter(routes)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
    <Toaster position="top-right" />
  </>
)
