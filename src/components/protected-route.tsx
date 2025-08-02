// src/components/ProtectedRoute.tsx
import authController from '@/controllers/auth-controller'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Navigate } from 'react-router'

export const ProtectedRoute = observer(
  ({ children }: { children: React.ReactNode }) => {
    if (!authController.isAuthenticated) {
      return <Navigate to="/login" replace />
    }

    return <>{children}</>
  }
)
