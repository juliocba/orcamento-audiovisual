import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { signInWithGoogle, user, authError } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/calculator', { replace: true })
    }
  }, [user, navigate])

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
      navigate('/calculator', { replace: true })
    } catch (err) {
      console.error(err)
      alert(`Erro ao fazer login: ${err.message}`)
    }
  }

  if (user) return <div>Você já está logado. Redirecionando...</div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-8">
      <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-4 text-orange-400">Entrar</h1>
        <p className="mb-6 text-zinc-400">Use sua conta Google para acessar a Plataforma SaaS.</p>
        {authError ? (
          <div className="rounded-xl border border-red-500 bg-red-950 p-4 mb-4 text-sm text-red-200">
            {authError.message}
          </div>
        ) : null}
        <button
          className="w-full py-3 rounded-lg bg-white text-black font-semibold"
          onClick={handleGoogle}
          disabled={!!authError}
        >
          Entrar com Google
        </button>
        <button
          className="w-full mt-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800 text-white font-semibold"
          onClick={() => navigate('/calculator')}
        >
          Continuar sem login
        </button>
      </div>
    </div>
  )
}
