document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('expense-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Pega os valores dos campos
        const valor = parseFloat(document.getElementById('amount').value);
        const descricao = document.getElementById('description').value;
        const categoria = document.getElementById('category').value;
        const data = document.getElementById('date').value;
        const forma_pagamento = document.getElementById('payment-method').value;
        const tipo = document.getElementById('tipo').value;

        // Objeto com os dados para enviar
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
    
        // Envia via POST
        try {
            const resposta = await fetch('http://localhost:5500/api/gastos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novaDespesa)
            });
            
            const resultado = await resposta.json();
            console.log('Despesa adicionada:', resultado);
            
            // Limpar o form
            form.reset();
            
            // Atualiza a lista
            carregarGastos();
            
        } catch (erro) {
            console.error('Erro ao adicionar despesa:', erro);
        }
    });
    
    // Chama a listagem ao carregar a página
    carregarGastos();
});

async function carregarGastos() {
    const container = document.getElementById('tabela-gastos');
  
    try {
      const resposta = await fetch('http://localhost:5500/api/gastos');
      const json = await resposta.json();
  
      const meses = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
      const dadosAgrupados = {};
      const totaisPorMes = Array(12).fill(0);
  
      json.data.forEach(gasto => {
        const data = new Date(gasto.data);
        const mesIndex = data.getMonth();
        const mes = meses[mesIndex];
        const chave = `${gasto.categoria}|${gasto.tipo}`;
  
        if (!dadosAgrupados[chave]) {
          dadosAgrupados[chave] = Array(12).fill(0);
        }
  
        dadosAgrupados[chave][mesIndex] += gasto.tipo === 'saida' ? -gasto.valor : gasto.valor;
        totaisPorMes[mesIndex] += gasto.tipo === 'saida' ? -gasto.valor : gasto.valor;
      });
  
      // Montar a tabela
      let html = '<table border="1" cellpadding="5"><thead><tr><th>Categoria</th><th>Tipo</th>';
      meses.forEach(mes => html += `<th>${mes.charAt(0).toUpperCase() + mes.slice(1)}</th>`);
      html += '</tr></thead><tbody>';
  
      Object.entries(dadosAgrupados).forEach(([chave, valoresMes]) => {
        const [categoria, tipo] = chave.split('|');
        let linha = `<tr><td>${categoria}</td><td>${tipo === 'entrada' ? 'Receita' : 'Despesa'}</td>`;
  
        valoresMes.forEach(valor => {
          const valorFormatado = valor === 0 ? '-' : `R$ ${valor.toFixed(2)}`;
          linha += `<td>${valorFormatado}</td>`;
        });
  
        linha += '</tr>';
        html += linha;
      });
  
        // Adiciona linha do total
        html += '<tr class="linha-total"><td colspan="2"><strong>Total do Mês</strong></td>';
        totaisPorMes.forEach(total => {
        const classe = total < 0 ? 'negativo' : 'positivo';
        const valorFormatado = total === 0 ? '-' : `R$ ${total.toFixed(2)}`;
        html += `<td class="${classe}"><strong>${valorFormatado}</strong></td>`;
        });
        html += '</tr>';

  
      html += '</tbody></table>';
      container.innerHTML = html;
  
    } catch (erro) {
      console.error('Erro ao carregar gastos:', erro);
    }
}

atualizarCategorias(); // carrega opções padrão conforme tipo

function atualizarCategorias() {
    const tipo = document.getElementById('tipo').value;
    const selectCategoria = document.getElementById('category');

    // Limpar opções existentes
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
  
    // Calcula a posição do gradiente com base no scroll
    const bgPosition = 100 * scrollPercent;
  
    document.body.style.backgroundPosition = `0% ${bgPosition}%`;
});
  