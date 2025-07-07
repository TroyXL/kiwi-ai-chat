import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import { themeAdaptor } from './lib/theme-adaptor.ts'

import './i18n' // Import the i18next configuration
import './styles/global.css'
import './styles/style.css'

themeAdaptor()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback="loading...">
      <App />
    </Suspense>
    <Toaster position="top-right" />
  </React.StrictMode>
)
