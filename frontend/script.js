document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('expense-form');

  form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const valor = parseFloat(document.getElementById('amount').value);
      const descricao = document.getElementById('description').value;
      const categoria = document.getElementById('category').value;
      const data = document.getElementById('date').value;
      const forma_pagamento = document.getElementById('payment-method').value;
      const tipo = document.getElementById('tipo').value;

      const novaDespesa = {
          valor,
          descricao,
          categoria,
          data,
          tipo,
          forma_pagamento,
          recorrente: 0,
          observacao: '',
          usuario_id: 1
      };

      try {
          const resposta = await fetch('http://localhost:5500/api/gastos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(novaDespesa)
          });

          const resultado = await resposta.json();
          console.log('Despesa adicionada:', resultado);

          form.reset();
          carregarGastos();
      } catch (erro) {
          console.error('Erro ao adicionar despesa:', erro);
      }
  });

  carregarGastos();

  const anoAtual = new Date().getFullYear();
  const filtroAno = document.getElementById('filtro-ano');

  const definirAnoPadrao = () => {
      for (let i = 0; i < filtroAno.options.length; i++) {
          if (parseInt(filtroAno.options[i].value) === anoAtual) {
              filtroAno.selectedIndex = i;
              break;
          }
      }
  };
});

document.getElementById('filtro-ano').addEventListener('change', carregarGastos);

async function carregarGastos() {
  const container = document.getElementById('tabela-gastos');
  const selectAno = document.getElementById('filtro-ano');
  const graficoContainer = document.getElementById('grafico-categorias-container');

  if (selectAno.options.length === 1) {
    for (let ano = 2025; ano <= 2030; ano++) {
      const opt = document.createElement('option');
      opt.value = ano;
      opt.textContent = ano;
      selectAno.appendChild(opt);
    }
  }

  const anoSelecionado = selectAno.value;

  if (!anoSelecionado) {
    container.innerHTML = '';
    atualizarGraficoPizza([]);
    if (graficoContainer) graficoContainer.style.display = 'none';
    return;
  }

  try {
    const resposta = await fetch('http://localhost:5500/api/gastos');
    const json = await resposta.json();

    const meses = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const dadosAgrupados = {};
    const totaisPorMes = Array(12).fill(0);

    const dadosFiltrados = json.data.filter(gasto => {
      const ano = new Date(gasto.data).getFullYear();
      return parseInt(anoSelecionado) === ano;
    });

    dadosFiltrados.forEach(gasto => {
      const data = new Date(gasto.data);
      const mesIndex = data.getMonth();
      const chave = `${gasto.categoria}|${gasto.tipo}`;

      if (!dadosAgrupados[chave]) {
        dadosAgrupados[chave] = Array(12).fill(0);
      }

      const valor = gasto.tipo === 'saida' ? -gasto.valor : gasto.valor;
      dadosAgrupados[chave][mesIndex] += valor;
      totaisPorMes[mesIndex] += valor;
    });

    let html = '<table border="1" cellpadding="5"><thead><tr><th>Categoria</th><th>Tipo</th>';
    meses.forEach(mes => html += `<th>${mes.charAt(0).toUpperCase() + mes.slice(1)}</th>`);
    html += '</tr></thead><tbody>';

    Object.entries(dadosAgrupados).forEach(([chave, valoresMes]) => {
      const [categoria, tipo] = chave.split('|');
      let linha = `<tr><td>${categoria}</td><td>${tipo === 'entrada' ? 'Receita' : 'Despesa'}</td>`;

      valoresMes.forEach(valor => {
        linha += `<td>${valor === 0 ? '-' : `R$ ${valor.toFixed(2)}`}</td>`;
      });

      linha += '</tr>';
      html += linha;
    });

    html += '<tr class="linha-total"><td colspan="2"><strong>Total do Mês</strong></td>';
    totaisPorMes.forEach(total => {
      const classe = total < 0 ? 'negativo' : 'positivo';
      const texto = total === 0 ? '-' : `R$ ${total.toFixed(2)}`;
      html += `<td class="${classe}"><strong>${texto}</strong></td>`;
    });
    html += '</tr></tbody></table>';

    container.innerHTML = html;

    atualizarGraficoPizza(dadosFiltrados);
    if (graficoContainer) graficoContainer.style.display = 'block';

  } catch (erro) {
    console.error('Erro ao carregar gastos:', erro);
  }
}

atualizarCategorias();

function atualizarCategorias() {
  const tipo = document.getElementById('tipo').value;
  const selectCategoria = document.getElementById('category');

  selectCategoria.innerHTML = '';

  let opcoes = [];

  if (tipo === 'entrada') {
      opcoes = ['Salário', 'Investimentos', 'Outros'];
  } else {
      opcoes = ['Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Outros'];
  }

  opcoes.forEach(valor => {
      const opt = document.createElement('option');
      opt.value = valor.toLowerCase();
      opt.textContent = valor;
      selectCategoria.appendChild(opt);
  });
}

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight === 0 ? 0 : scrollTop / docHeight;
  const bgPosition = 100 * scrollPercent;
  document.body.style.backgroundPosition = `0% ${bgPosition}%`;
});

let graficoPizza = null;
let graficoCategorias = null;
let tipoGraficoAtual = 'pie';

function atualizarGraficoPizza(dados) {
    const canvas = document.getElementById('grafico-categorias');
    if (!canvas) return;

    const despesas = dados.filter(g => g.tipo === 'saida');
    const totaisPorCategoria = {};

    despesas.forEach(gasto => {
        if (!totaisPorCategoria[gasto.categoria]) {
            totaisPorCategoria[gasto.categoria] = 0;
        }
        totaisPorCategoria[gasto.categoria] += gasto.valor;
    });

    const labels = Object.keys(totaisPorCategoria);
    const valores = Object.values(totaisPorCategoria);

    if (graficoCategorias) {
        graficoCategorias.destroy();
    }

    graficoCategorias = new Chart(canvas, {
        type: tipoGraficoAtual,
        data: {
            labels: labels,
            datasets: [{
                label: 'Despesas por Categoria',
                data: valores,
                backgroundColor: [
                    '#f94144', '#f3722c', '#f8961e', '#f9c74f',
                    '#90be6d', '#43aa8b', '#577590', '#277da1'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: tipoGraficoAtual === 'bar' ? {
                y: { beginAtZero: true }
            } : {}
        }
    });
}

function alternarTipoGrafico(tipo) {
    tipoGraficoAtual = tipo;
    carregarGastos();
}