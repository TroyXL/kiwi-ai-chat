import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import routes from '~react-pages'
import { Spinner } from './components/spinner.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { themeAdaptor } from './lib/theme-adaptor.ts'

import './i18n' // Import the i18next configuration
import './styles/global.css'
import './styles/style.css'

themeAdaptor()
const router = createBrowserRouter(routes)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<Spinner className="fixed-center" />}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Suspense>
    <Toaster position="top-right" />
  </React.StrictMode>
)
