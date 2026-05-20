import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const sample = [
  { month: 'Jan', value: 1200 },
  { month: 'Feb', value: 2100 },
  { month: 'Mar', value: 800 },
  { month: 'Apr', value: 1600 },
  { month: 'May', value: 2000 },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-orange-500">Dashboard</h1>
            <p className="text-zinc-400">Bem-vindo, {user?.displayName}</p>
          </div>
          <div>
            <button className="px-4 py-2 bg-zinc-800 rounded-md" onClick={() => logout()}>
              Sair
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Faturamento (exemplo)</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={sample}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#fb923c" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <aside className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-xl font-semibold mb-4">Resumo</h3>
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-2xl p-4">Clientes: 12</div>
              <div className="bg-zinc-800 rounded-2xl p-4">Projetos: 8</div>
              <div className="bg-zinc-800 rounded-2xl p-4">Meta: R$ 12.000</div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}
