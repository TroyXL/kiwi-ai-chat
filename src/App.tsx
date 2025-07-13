// src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router'
import routes from '~react-pages'
import { AuthProvider } from './contexts/AuthContext'

const router = createBrowserRouter(routes)

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
