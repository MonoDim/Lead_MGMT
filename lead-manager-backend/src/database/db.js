const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../leads.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Erro ao conectar no banco:', err.message);
  else console.log('Conectado ao banco SQLite.');
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      email TEXT,
      empresa TEXT,
      origem TEXT,
      observacoes TEXT,
      data_cadastro TEXT
    )
  `);
});

module.exports = db;
