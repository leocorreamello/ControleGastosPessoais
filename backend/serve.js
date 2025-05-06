const db = require('./config/database.js');

const PORT = 5500;

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.get('/', (req, res) => {
    res.send("Servidor rodando");
});

app.get('/api/gastos', (req, res) => {
    db.all("SELECT * FROM gastos", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "Gastos recebidos com sucesso",
            data: rows
        });
    });
});

app.post('/api/gastos', (req, res) => {
    const { valor, categoria, descricao, data, tipo, forma_pagamento, recorrente, observacao, usuario_id } = req.body;

    db.run(`
        INSERT INTO gastos 
        (valor, categoria, descricao, data, tipo, forma_pagamento, recorrente, observacao, usuario_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [valor, categoria, descricao, data, tipo, forma_pagamento, recorrente, observacao, usuario_id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ message: 'Despesa adicionada', id: this.lastID });
    });
});

app.put('/api/gastos/:id', (req, res) => {
    const { id } = req.params;
    const { valor, categoria, descricao, data, tipo, forma_pagamento, recorrente, observacao, usuario_id } = req.body;

    db.run(`
        UPDATE gastos SET 
        valor = ?, 
        categoria = ?, 
        descricao = ?, 
        data = ?, 
        tipo = ?, 
        forma_pagamento = ?, 
        recorrente = ?, 
        observacao = ?, 
        usuario_id = ? 
        WHERE id = ?
    `, [valor, categoria, descricao, data, tipo, forma_pagamento, recorrente, observacao, usuario_id, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ message: 'Despesa atualizada', id: this.lastID });
    });
});

app.delete('/api/gastos/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM gastos WHERE id = ?`, [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Despesa deletada' });
    });
});