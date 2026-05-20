function formatMoeda(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function calcularOrcamento() {
  const servico = Number(document.getElementById('servico').value);
  const horasGravacao = Number(document.getElementById('horasGravacao').value);
  const diarias = Number(document.getElementById('diarias').value);
  const cameras = Number(document.getElementById('cameras').value);
  const operadores = Number(document.getElementById('operadores').value);
  const videosFinais = Number(document.getElementById('videosFinais').value);
  const horasEdicao = Number(document.getElementById('horasEdicao').value);
  const revisoes = Number(document.getElementById('revisoes').value);
  const deslocamento = Number(document.getElementById('deslocamento').value);
  const drone = document.getElementById('drone').checked;
  const locucao = document.getElementById('locucao').checked;
  const design = document.getElementById('design').checked;
  const celulares = Number(document.getElementById('celulares').value);
  const operadoresMobile = Number(document.getElementById('operadoresMobile').value);
  const tempoMobile = Number(document.getElementById('tempoMobile').value);
  const qualidadeMobile = Number(document.getElementById('qualidadeMobile').value);
  const vertical = document.getElementById('vertical').checked;
  const reels = document.getElementById('reels').checked;
  const entregaRapida = document.getElementById('entregaRapida').checked;

  const custoServico = servico;
  const custoHoras = horasGravacao * 120;
  const custoDiarias = diarias * 420;
  const custoCameras = cameras * 180;
  const custoOperadores = operadores * 150;
  const custoVideos = videosFinais * 250;
  const custoEdicao = horasEdicao * 85;
  const custoRevisoes = revisoes * 45;
  const custoDeslocamento = deslocamento * 2.8;
  const custoDrone = drone ? 420 : 0;
  const custoLocucao = locucao ? 260 : 0;
  const custoDesign = design ? 190 : 0;

  const custoMobile = (celulares * 80 + operadoresMobile * 120 + tempoMobile * 90) * qualidadeMobile;
  const taxaVertical = vertical ? 120 : 0;
  const taxaReels = reels ? 150 : 0;
  const taxaRapida = entregaRapida ? 220 : 0;

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
    custoMobile +
    taxaVertical +
    taxaReels +
    taxaRapida;

  const custoOperacional = subtotal * 0.25;
  const lucro = subtotal * 0.2;
  const valorFinal = subtotal + custoOperacional + lucro;

  document.getElementById('subtotal').textContent = formatMoeda(subtotal);
  document.getElementById('custoOperacional').textContent = formatMoeda(custoOperacional);
  document.getElementById('lucro').textContent = formatMoeda(lucro);
  document.getElementById('valorFinal').textContent = formatMoeda(valorFinal);
}

const calcularBtn = document.getElementById('calcularBtn');
calcularBtn.addEventListener('click', calcularOrcamento);

const campos = document.querySelectorAll('#calculator input, #calculator select');
for (const campo of campos) {
  campo.addEventListener('change', calcularOrcamento);
}

calcularOrcamento();
