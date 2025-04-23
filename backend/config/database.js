//configurações do banco de dados SQLite3
const sqlite3 = require('sqlite3').verbose();

const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, '../../database/gastos.db'));

db.run(`
    CREATE TABLE IF NOT EXISTS gastos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    valor REAL,
    categoria TEXT,
    descricao TEXT,
    data TEXT,
    tipo TEXT,
    forma_pagamento TEXT,
    recorrente INTEGER,
    observacao TEXT,
    usuario_id INTEGER
    )
`);

//permite exporatar o banco de dados para outros arquivos
module.exports = db;



