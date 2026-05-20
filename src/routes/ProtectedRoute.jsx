import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, authError } = useAuth()
  if (loading) return <div className="p-8">Carregando...</div>
  if (authError) return <div className="p-8 text-red-200">{authError.message}</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}
