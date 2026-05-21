import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { db } from '../firebase/firebase'
import { jsPDF } from 'jspdf'

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const serviceOptions = [
  { value: '200', label: 'Captação de vídeo' },
  { value: '180', label: 'Fotografia' },
  { value: '220', label: 'Edição de vídeo' },
  { value: '230', label: 'Motion Design' },
  { value: '250', label: 'Drone' },
  { value: '210', label: 'Cobertura de Evento' },
  { value: '190', label: 'Podcast' },
  { value: '240', label: 'Comercial/Publicidade' },
  { value: '260', label: 'Videoclipe' },
  { value: '270', label: 'Transmissão ao Vivo' },
]

const mobileQualityOptions = [
  { value: 'simple', label: 'Conteúdo simples' },
  { value: 'premium', label: 'Conteúdo premium' },
  { value: 'cinematic', label: 'Conteúdo cinematográfico' },
]

function formatDate(value) {
  const date = getDateFromValue(value)
  if (!date) return '—'

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getDateFromValue(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  if (value.seconds) return new Date(value.seconds * 1000)
  return new Date(value)
}

function formatChartLabel(value) {
  const [year, month] = value.split('-')
  const monthIndex = Number(month) - 1
  return `${monthNames[monthIndex]}/${String(year).slice(-2)}`
}

function FloatingInput({ label, name, value, onChange, type = 'text', min }) {
  const hasValue = value !== '' && value !== null
  return (
    <label className="relative block">
      <input
        name={name}
        type={type}
        min={min}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white outline-none transition-all focus:border-orange-500"
      />
      <span
        className={`pointer-events-none absolute left-4 z-20 transition-all ${hasValue ? '-top-2 text-xs text-orange-400 translate-y-0 font-bold' : 'top-1/2 -translate-y-1/2 text-base text-white'} peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-orange-400 peer-focus:font-bold`}
      >
        {label}
      </span>
    </label>
  )
}

function FloatingSelect({ label, name, value, onChange, options }) {
  const hasValue = value !== '' && value !== null
  return (
    <label className="relative block">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="peer w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white outline-none transition-all focus:border-orange-500"
      >
        <option value="" disabled hidden />
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span
        className={`pointer-events-none absolute left-4 z-20 transition-all ${hasValue ? '-top-2 text-xs text-orange-400 translate-y-0 font-bold' : 'top-1/2 -translate-y-1/2 text-base text-white'} peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-orange-400 peer-focus:font-bold`}
      >
        {label}
      </span>
    </label>
  )
}

export default function CalculatorPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    cliente: '',
    servico: '',
    horasGravacao: '',
    diarias: '',
    cameras: '',
    operadores: '',
    videosFinais: '',
    horasEdicao: '',
    revisoes: '',
    deslocamento: '',
    desconto: '0',
    drone: false,
    locucao: false,
    design: false,
    mobileCells: '',
    mobileOperators: '',
    mobileHours: '',
    mobileQuality: '',
    mobileVertical: false,
    mobileReels: false,
    mobileExpress: false,
  })

  const [summary, setSummary] = useState({ subtotal: 0, custoOperacional: 0, lucro: 0, desconto: 0, valorFinal: 0 })
  const [errorMessage, setErrorMessage] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [budgets, setBudgets] = useState([])
  const [editingId, setEditingId] = useState(null)
  const topRef = useRef(null)

  const dashboardMetrics = useMemo(() => {
    const clients = new Set()
    let totalRevenue = 0
    let totalProfit = 0

    budgets.forEach((budget) => {
      const revenue = Number(budget.summary?.valorFinal || 0)
      const profit = Number(budget.summary?.lucro || 0)
      totalRevenue += revenue
      totalProfit += profit
      if (budget.cliente) clients.add(budget.cliente)
    })

    return {
      totalRevenue,
      totalProfit,
      activeClients: clients.size,
    }
  }, [budgets])

  const monthlyChartData = useMemo(() => {
    const grouped = {}
    budgets.forEach((budget) => {
      const date = getDateFromValue(budget.createdAt)
      if (!date) return

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      grouped[monthKey] = (grouped[monthKey] || 0) + Number(budget.summary?.valorFinal || 0)
    })

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month: formatChartLabel(month), value }))
  }, [budgets])

  const handleSave = async () => {
    const hasCliente = form.cliente.trim() !== ''
    const hasServico = form.servico !== ''

    if (!hasCliente || !hasServico) {
      setSaveMessage('')
      setErrorMessage('Por favor, preencha o nome do cliente e o tipo de serviço antes de salvar.')
      return
    }

    setErrorMessage('')
    setSaveMessage('')

    if (!db) {
      setErrorMessage('Firebase não está inicializado. Verifique as variáveis de ambiente.')
      return
    }

    try {
      const serviceLabel = serviceOptions.find((option) => option.value === form.servico)?.label || ''
      const budgetDoc = {
        cliente: form.cliente.trim(),
        servico: form.servico,
        servicoLabel: serviceLabel,
        horasGravacao: Number(form.horasGravacao) || 0,
        diarias: Number(form.diarias) || 0,
        cameras: Number(form.cameras) || 0,
        operadores: Number(form.operadores) || 0,
        videosFinais: Number(form.videosFinais) || 0,
        horasEdicao: Number(form.horasEdicao) || 0,
        revisoes: Number(form.revisoes) || 0,
        deslocamento: Number(form.deslocamento) || 0,
        desconto: Number(form.desconto) || 0,
        drone: form.drone,
        locucao: form.locucao,
        design: form.design,
        summary,
        updatedAt: serverTimestamp(),
      }

      if (editingId) {
        const docRef = doc(db, 'orcamentos', editingId)
        await updateDoc(docRef, budgetDoc)
        setSaveMessage('Orçamento atualizado com sucesso!')
        setEditingId(null)
      } else {
        await addDoc(collection(db, 'orcamentos'), {
          ...budgetDoc,
          createdAt: serverTimestamp(),
          userId: user?.uid || null,
          paid: false,
        })
        setSaveMessage('Orçamento salvo com sucesso no Firestore!')
      }
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
      setErrorMessage('Não foi possível salvar o orçamento. Tente novamente.')
    }
  }

  const handleEdit = (budget) => {
    setForm({
      cliente: budget.cliente || '',
      servico: budget.servico || '',
      horasGravacao: String(budget.horasGravacao || 0),
      diarias: String(budget.diarias || 0),
      cameras: String(budget.cameras || 0),
      operadores: String(budget.operadores || 0),
      videosFinais: String(budget.videosFinais || 0),
      horasEdicao: String(budget.horasEdicao || 0),
      revisoes: String(budget.revisoes || 0),
      deslocamento: String(budget.deslocamento || 0),
      desconto: String(budget.desconto || 0),
      drone: budget.drone || false,
      locucao: budget.locucao || false,
      design: budget.design || false,
      mobileCells: String(budget.mobileCells || 0),
      mobileOperators: String(budget.mobileOperators || 0),
      mobileHours: String(budget.mobileHours || 0),
      mobileQuality: budget.mobileQuality || '',
      mobileVertical: budget.mobileVertical || false,
      mobileReels: budget.mobileReels || false,
      mobileExpress: budget.mobileExpress || false,
    })
    setEditingId(budget.id)
    setErrorMessage('')
    setSaveMessage('Carregando orçamento para edição...')
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'orcamentos', id))
      setSaveMessage('Orçamento excluído com sucesso!')
      setErrorMessage('')
      if (editingId === id) {
        setEditingId(null)
      }
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error)
      setErrorMessage('Não foi possível excluir o orçamento. Tente novamente.')
      setSaveMessage('')
    }
  }

  const handlePaidToggle = async (budget) => {
    try {
      await updateDoc(doc(db, 'orcamentos', budget.id), { paid: !budget.paid })
      setSaveMessage('Status de pagamento atualizado!')
      setErrorMessage('')
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error)
      setErrorMessage('Não foi possível atualizar o pagamento. Tente novamente.')
      setSaveMessage('')
    }
  }

  const handleGeneratePdf = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(`Orçamento - ${form.cliente || 'Cliente'}`, 14, 20)
    doc.setFontSize(12)
    let y = 30
    const writeLine = (label, value) => {
      doc.text(`${label}: ${value}`, 14, y)
      y += 8
      if (y > 280) {
        doc.addPage()
        y = 20
      }
    }

    const serviceLabel = serviceOptions.find((o) => o.value === form.servico)?.label || form.servico || '—'

    writeLine('Cliente', form.cliente || '—')
    writeLine('Serviço', serviceLabel)
    writeLine('Horas de gravação', form.horasGravacao || '0')
    writeLine('Diárias', form.diarias || '0')
    writeLine('Câmeras', form.cameras || '0')
    writeLine('Operadores', form.operadores || '0')
    writeLine('Vídeos finais', form.videosFinais || '0')
    writeLine('Horas de edição', form.horasEdicao || '0')
    writeLine('Revisões', form.revisoes || '0')
    writeLine('Deslocamento (KM)', form.deslocamento || '0')
    writeLine('Drone', form.drone ? 'Sim' : 'Não')
    writeLine('Locução', form.locucao ? 'Sim' : 'Não')
    writeLine('Design/Thumb', form.design ? 'Sim' : 'Não')
    writeLine('--- Serviço Mobile ---', '')
    writeLine('Quantidade de celulares', form.mobileCells || '0')
    writeLine('Operadores mobile', form.mobileOperators || '0')
    writeLine('Tempo captação mobile', form.mobileHours || '0')
    writeLine('Qualidade mobile', form.mobileQuality || '—')
    writeLine('Vertical', form.mobileVertical ? 'Sim' : 'Não')
    writeLine('Edição para Reels', form.mobileReels ? 'Sim' : 'Não')
    writeLine('Entrega Rápida', form.mobileExpress ? 'Sim' : 'Não')

    writeLine('')
    writeLine('Subtotal', summary.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    writeLine('Custo Operacional', summary.custoOperacional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    writeLine('Lucro', summary.lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    writeLine('Desconto', summary.desconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    writeLine('Valor Final', summary.valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))

    const fileName = `orcamento_${(form.cliente || 'cliente').replace(/\s+/g, '_')}.pdf`
    doc.save(fileName)
  }

  useEffect(() => {
    if (!user || !db) {
      setBudgets([])
      return
    }

    const budgetsQuery = query(
      collection(db, 'orcamentos'),
      where('userId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(
      budgetsQuery,
      (snapshot) => {
        const loadedBudgets = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => {
            const getTime = (value) => {
              if (!value) return 0
              if (typeof value.toDate === 'function') return value.toDate().getTime()
              if (value.seconds) return value.seconds * 1000
              return new Date(value).getTime()
            }
            return getTime(b.createdAt) - getTime(a.createdAt)
          })

        setBudgets(loadedBudgets)
        setErrorMessage('')
      },
      (error) => {
        console.error('Erro ao carregar orçamentos:', error)
        setErrorMessage('Não foi possível carregar os orçamentos salvos.')
      }
    )

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    const {
      servico,
      horasGravacao,
      diarias,
      cameras,
      operadores,
      videosFinais,
      horasEdicao,
      revisoes,
      deslocamento,
      desconto,
      drone,
      locucao,
      design,
      mobileCells,
      mobileOperators,
      mobileHours,
      mobileQuality,
      mobileVertical,
      mobileReels,
      mobileExpress,
    } = form

    const custoServico = Number(servico)
    const custoHoras = Number(horasGravacao) * 120
    const custoDiarias = Number(diarias) * 420
    const custoCameras = Number(cameras) * 180
    const custoOperadores = Number(operadores) * 150
    const custoVideos = Number(videosFinais) * 250
    const custoEdicao = Number(horasEdicao) * 85
    const custoRevisoes = Number(revisoes) * 45
    const custoDeslocamento = Number(deslocamento) * 2.8
    const custoDrone = drone ? 420 : 0
    const custoLocucao = locucao ? 260 : 0
    const custoDesign = design ? 190 : 0

    const custoMobileCells = Number(mobileCells) * 120
    const custoMobileOperators = Number(mobileOperators) * 110
    const custoMobileHours = Number(mobileHours) * 90
    const custoMobileQuality = mobileQuality === 'premium' ? 180 : mobileQuality === 'cinematic' ? 320 : 0
    const custoMobileVertical = mobileVertical ? 70 : 0
    const custoMobileReels = mobileReels ? 140 : 0
    const custoMobileExpress = mobileExpress ? 220 : 0

    const subtotal =
      custoServico +
      custoHoras +
      custoDiarias +
      custoCameras +
      custoOperadores +
      custoVideos +
      custoEdicao +
      custoRevisoes +
      custoDeslocamento +
      custoDrone +
      custoLocucao +
      custoDesign +
      custoMobileCells +
      custoMobileOperators +
      custoMobileHours +
      custoMobileQuality +
      custoMobileVertical +
      custoMobileReels +
      custoMobileExpress

    const custoOperacional = subtotal * 0.25
    const lucro = subtotal * 0.2
    const valorTotal = subtotal + custoOperacional + lucro
    const descontoValor = Math.max(0, Number(desconto) || 0)
    const valorFinal = Math.max(0, valorTotal - descontoValor)

    setSummary({ subtotal, custoOperacional, lucro, desconto: descontoValor, valorFinal })
  }, [form])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const numericFields = [
      'servico',
      'horasGravacao',
      'diarias',
      'cameras',
      'operadores',
      'videosFinais',
      'horasEdicao',
      'revisoes',
      'deslocamento',
      'desconto',
    ]

    let updatedValue = type === 'checkbox' ? checked : value
    if (numericFields.includes(name)) {
      if (value === '') {
        updatedValue = ''
      } else {
        const numeric = Math.max(0, Number(value) || 0)
        updatedValue = String(numeric)
      }
    }

    setForm((s) => ({ ...s, [name]: updatedValue }))
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div ref={topRef} className="max-w-7xl mx-auto">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-orange-500">Calculadora</h1>
            <p className="text-zinc-400">Usuário: {user?.displayName ?? 'Modo visitante'}</p>
          </div>
          {user ? (
            <button
              className="self-start md:self-auto px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm font-semibold hover:bg-zinc-700"
              onClick={async () => {
                await logout()
                navigate('/')
              }}
            >
              Sair
            </button>
          ) : null}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-semibold mb-6">Dados do Projeto</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Nome do cliente"
                name="cliente"
                value={form.cliente}
                onChange={handleChange}
              />

              <FloatingSelect
                label="Tipo de Serviço"
                name="servico"
                value={form.servico}
                onChange={handleChange}
                options={serviceOptions}
              />

              <FloatingInput
                label="Horas de gravação"
                name="horasGravacao"
                type="number"
                min="0"
                value={form.horasGravacao}
                onChange={handleChange}
              />

              <FloatingInput
                label="Quantidade de diárias"
                name="diarias"
                type="number"
                min="0"
                value={form.diarias}
                onChange={handleChange}
              />

              <FloatingInput
                label="Número de câmeras"
                name="cameras"
                type="number"
                min="0"
                value={form.cameras}
                onChange={handleChange}
              />

              <FloatingInput
                label="Quantidade de operadores"
                name="operadores"
                type="number"
                min="0"
                value={form.operadores}
                onChange={handleChange}
              />

              <FloatingInput
                label="Quantidade de vídeos finais"
                name="videosFinais"
                type="number"
                min="0"
                value={form.videosFinais}
                onChange={handleChange}
              />

              <FloatingInput
                label="Horas de edição"
                name="horasEdicao"
                type="number"
                min="0"
                value={form.horasEdicao}
                onChange={handleChange}
              />

              <FloatingInput
                label="Quantidade de revisões"
                name="revisoes"
                type="number"
                min="0"
                value={form.revisoes}
                onChange={handleChange}
              />

              <FloatingInput
                label="Deslocamento em KM"
                name="deslocamento"
                type="number"
                min="0"
                value={form.deslocamento}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <label className="bg-zinc-800 rounded-xl p-4 flex items-center justify-between">
                Drone
                <input name="drone" type="checkbox" checked={form.drone} onChange={handleChange} />
              </label>

              <label className="bg-zinc-800 rounded-xl p-4 flex items-center justify-between">
                Locução
                <input name="locucao" type="checkbox" checked={form.locucao} onChange={handleChange} />
              </label>

              <label className="bg-zinc-800 rounded-xl p-4 flex items-center justify-between">
                Design/Thumb
                <input name="design" type="checkbox" checked={form.design} onChange={handleChange} />
              </label>
            </div>

            <div className="mt-6 bg-zinc-800 border border-zinc-700 rounded-2xl p-5">
              <h3 className="text-lg font-semibold mb-4 text-orange-500">Serviço Mobile</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput
                  label="Quantidade de celulares"
                  name="mobileCells"
                  type="number"
                  min="0"
                  value={form.mobileCells}
                  onChange={handleChange}
                />

                <FloatingInput
                  label="Operadores mobile"
                  name="mobileOperators"
                  type="number"
                  min="0"
                  value={form.mobileOperators}
                  onChange={handleChange}
                />

                <FloatingInput
                  label="Tempo de captação mobile"
                  name="mobileHours"
                  type="number"
                  min="0"
                  value={form.mobileHours}
                  onChange={handleChange}
                />

                <FloatingSelect
                  label="Qualidade da entrega"
                  name="mobileQuality"
                  value={form.mobileQuality}
                  onChange={handleChange}
                  options={mobileQualityOptions}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <label className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
                  Captação Vertical
                  <input name="mobileVertical" type="checkbox" checked={form.mobileVertical} onChange={handleChange} />
                </label>

                <label className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
                  Edição para Reels
                  <input name="mobileReels" type="checkbox" checked={form.mobileReels} onChange={handleChange} />
                </label>

                <label className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
                  Entrega Rápida
                  <input name="mobileExpress" type="checkbox" checked={form.mobileExpress} onChange={handleChange} />
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={form.cliente.trim() === '' || form.servico === ''}
              className={`mt-8 rounded-2xl px-8 py-4 font-semibold text-lg shadow-lg transition-all ${form.cliente.trim() !== '' && form.servico !== '' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-zinc-700 cursor-not-allowed opacity-60'}`}
            >
              {editingId ? 'Atualizar Orçamento' : 'Salvar Orçamento'}
            </button>
            {(errorMessage || saveMessage) && (
              <p className={`mt-4 text-sm ${errorMessage ? 'text-red-400' : 'text-green-400'}`}>
                {errorMessage || saveMessage}
              </p>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6">Resumo Financeiro</h2>

            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-2xl p-4">
                <p className="text-zinc-400 text-sm">Subtotal</p>
                <h3 className="text-2xl font-bold">{summary.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
              </div>

              <div className="bg-zinc-800 rounded-2xl p-4">
                <p className="text-zinc-400 text-sm">Custo Operacional</p>
                <h3 className="text-2xl font-bold">{summary.custoOperacional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
              </div>

              <div className="bg-zinc-800 rounded-2xl p-4">
                <p className="text-zinc-400 text-sm">Lucro Estimado</p>
                <h3 className="text-2xl font-bold text-green-400">{summary.lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
              </div>

              <div className="bg-zinc-800 rounded-2xl p-4">
                <p className="text-zinc-400 text-sm">Desconto</p>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
                  <input
                    name="desconto"
                    type="number"
                    min="0"
                    step="10"
                    value={form.desconto}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 py-3 pl-12 pr-4 text-white outline-none transition-all focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="bg-orange-500 rounded-2xl p-5 text-black">
                <p className="text-sm font-medium">Valor Final</p>
                <h3 className="text-4xl font-bold">{summary.valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button type="button" onClick={handleGeneratePdf} className="w-full bg-white text-black py-4 rounded-2xl font-semibold hover:scale-105 transition-all">Gerar PDF</button>

              <button className="w-full bg-zinc-700 py-4 rounded-2xl font-semibold hover:bg-zinc-600 transition-all">Salvar Orçamento</button>
            </div>
          </div>
        </div>

        {user ? (
          <section className="mt-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-orange-500">Dashboard</h2>
                <p className="text-zinc-400">Visão financeira rápida do seu perfil.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <p className="text-zinc-400 text-sm">Faturamento estimado</p>
                <h3 className="text-3xl font-bold">{dashboardMetrics.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <p className="text-zinc-400 text-sm">Lucro</p>
                <h3 className="text-3xl font-bold text-green-400">{dashboardMetrics.totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <p className="text-zinc-400 text-sm">Clientes ativos</p>
                <h3 className="text-3xl font-bold">{dashboardMetrics.activeClients}</h3>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <h3 className="text-xl font-semibold mb-4">Tendência mensal</h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={monthlyChartData.length > 0 ? monthlyChartData : [{ month: formatChartLabel(new Date().toISOString().slice(0, 7)), value: 0 }] }>
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <Line type="monotone" dataKey="value" stroke="#fb923c" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-semibold">Orçamentos Salvos</h3>
                  <p className="text-zinc-400 text-sm">Acompanhe orçamentos, marque como pago e edite ou exclua rapidamente.</p>
                </div>
              </div>

              {budgets.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-700 p-6 text-zinc-400 text-center">
                  Nenhum orçamento salvo ainda.
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.map((budget) => (
                    <div key={budget.id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 md:p-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-zinc-400 text-sm">Cliente</p>
                          <p className="text-lg font-semibold">{budget.cliente}</p>
                          <p className="text-zinc-400 text-sm mt-2">Serviço</p>
                          <p className="text-lg font-semibold">{budget.servicoLabel || budget.servico}</p>
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <p className="text-zinc-400 text-sm">Valor Final</p>
                              <p className="text-lg font-semibold text-green-300">
                                {(budget.summary?.valorFinal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-zinc-400 text-sm">Lucro</p>
                              <p className="text-lg font-semibold text-emerald-300">
                                {(budget.summary?.lucro || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-col gap-1">
                            <p className="text-zinc-400 text-sm">Criado em</p>
                            <p className="text-sm text-zinc-300">{formatDate(budget.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-sm text-zinc-300">
                            <input
                              type="checkbox"
                              checked={Boolean(budget.paid)}
                              onChange={() => handlePaidToggle(budget)}
                              className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-orange-500 focus:ring-orange-500"
                            />
                            Pago
                          </label>
                          <button
                            type="button"
                            onClick={() => handleEdit(budget)}
                            className="rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:border-orange-500 hover:text-orange-400"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(budget.id)}
                            className="rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:border-red-500 hover:text-red-400"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
