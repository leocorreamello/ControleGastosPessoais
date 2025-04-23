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
    const container = document.getElementById('lista-gastos') || criarContainer();
    
    try {
        const resposta = await fetch('http://localhost:5500/api/gastos');
        const json = await resposta.json();
        
        container.innerHTML = ''; // limpa antes de listar
        json.data.forEach(gasto => {
            const item = document.createElement('p');
            item.textContent = `${gasto.data} - ${gasto.descricao} - R$ ${gasto.valor.toFixed(2)}`;
            container.appendChild(item);
        });
        } catch (erro) {
            console.error('Erro ao carregar gastos:', erro);
        }
}

function criarContainer() {
    const novo = document.createElement('div');
    novo.id = 'lista-gastos';
    document.body.appendChild(novo);
    return novo;
}