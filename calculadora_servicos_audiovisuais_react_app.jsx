export default function AudiovisualCalculator() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-orange-500">
          Calculadora de Serviços Audiovisuais
        </h1>

        <p className="text-zinc-400 mb-10">
          Plataforma premium para cálculo automatizado de serviços audiovisuais.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6">Dados do Projeto</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
                placeholder="Nome do cliente"
              />

              <select className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
                <option>Tipo de Serviço</option>
                <option>Captação de vídeo</option>
                <option>Fotografia</option>
                <option>Edição de vídeo</option>
                <option>Motion Design</option>
                <option>Drone</option>
                <option>Cobertura de Evento</option>
                <option>Podcast</option>
                <option>Comercial/Publicidade</option>
                <option>Videoclipe</option>
                <option>Transmissão ao Vivo</option>
              </select>

              <input
                type="number"
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
                placeholder="Horas de gravação"
              />

              <input
                type="number"
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
                placeholder="Quantidade de diárias"
              />

              <input
                type="number"
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
                placeholder="Número de câmeras"
              />

              <input
                type="number"
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
                placeholder="Quantidade de operadores"
              />

              <input
                type="number"
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
                placeholder="Quantidade de vídeos finais"
              />

              <input
                type="number"
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
                placeholder="Horas de edição"
              />

              <input
                type="number"
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
                placeholder="Quantidade de revisões"
              />

              <input
                type="number"
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
                placeholder="Deslocamento em KM"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <label className="bg-zinc-800 rounded-xl p-4 flex items-center justify-between">
                Drone
                <input type="checkbox" />
              </label>

              <label className="bg-zinc-800 rounded-xl p-4 flex items-center justify-between">
                Locução
                <input type="checkbox" />
              </label>

              <label className="bg-zinc-800 rounded-xl p-4 flex items-center justify-between">
                Design/Thumb
                <input type="checkbox" />
              </label>
            </div>

            <div className="mt-6 bg-zinc-800 border border-zinc-700 rounded-2xl p-5">
              <h3 className="text-lg font-semibold mb-4 text-orange-500">
                Serviço Mobile
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  className="bg-zinc-900 border border-zinc-700 rounded-xl p-4"
                  placeholder="Quantidade de celulares"
                />

                <input
                  type="number"
                  className="bg-zinc-900 border border-zinc-700 rounded-xl p-4"
                  placeholder="Operadores mobile"
                />

                <input
                  type="number"
                  className="bg-zinc-900 border border-zinc-700 rounded-xl p-4"
                  placeholder="Tempo de captação mobile"
                />

                <select className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                  <option>Qualidade da entrega</option>
                  <option>Conteúdo simples</option>
                  <option>Conteúdo premium</option>
                  <option>Conteúdo cinematográfico</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <label className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
                  Captação Vertical
                  <input type="checkbox" />
                </label>

                <label className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
                  Edição para Reels
                  <input type="checkbox" />
                </label>

                <label className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
                  Entrega Rápida
                  <input type="checkbox" />
                </label>
              </div>
            </div>

            <button className="mt-8 bg-orange-500 hover:bg-orange-600 transition-all rounded-2xl px-8 py-4 font-semibold text-lg shadow-lg">
              Calcular Orçamento
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6">Resumo Financeiro</h2>

            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-2xl p-4">
                <p className="text-zinc-400 text-sm">Subtotal</p>
                <h3 className="text-2xl font-bold">R$ 0,00</h3>
              </div>

              <div className="bg-zinc-800 rounded-2xl p-4">
                <p className="text-zinc-400 text-sm">Custo Operacional</p>
                <h3 className="text-2xl font-bold">R$ 0,00</h3>
              </div>

              <div className="bg-zinc-800 rounded-2xl p-4">
                <p className="text-zinc-400 text-sm">Lucro Estimado</p>
                <h3 className="text-2xl font-bold text-green-400">R$ 0,00</h3>
              </div>

              <div className="bg-orange-500 rounded-2xl p-5 text-black">
                <p className="text-sm font-medium">Valor Final</p>
                <h3 className="text-4xl font-bold">R$ 0,00</h3>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button className="w-full bg-white text-black py-4 rounded-2xl font-semibold hover:scale-105 transition-all">
                Gerar PDF
              </button>

              <button className="w-full bg-zinc-700 py-4 rounded-2xl font-semibold hover:bg-zinc-600 transition-all">
                Salvar Orçamento
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard Financeiro</h2>
            <div className="h-40 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">
              Gráfico de Faturamento
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Meta Mensal</h2>
            <div className="h-40 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">
              Simulação de Meta
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Histórico de Clientes</h2>
            <div className="space-y-3">
              <div className="bg-zinc-800 p-4 rounded-xl">
                Cliente Exemplo
              </div>
              <div className="bg-zinc-800 p-4 rounded-xl">
                Projeto Comercial
              </div>
              <div className="bg-zinc-800 p-4 rounded-xl">
                Videoclipe Premium
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
