// lead-manager-backend/src/database/db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Carregar variáveis de ambiente (se você tiver DB_PATH no .env)
require('dotenv').config();

// Define o caminho do banco de dados.
// Prefira usar uma variável de ambiente se o caminho puder variar em produção.
// Caso contrário, path.resolve é adequado.
const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../../leads.db');

let db;

/**
 * Conecta ao banco de dados SQLite e cria a tabela 'leads' se ela não existir.
 * @returns {Promise<sqlite3.Database>} Uma Promise que resolve com a instância do banco de dados.
 */
function connectDb() {
  return new Promise((resolve, reject) => {
    // Se a conexão já existe, retorna-a para evitar múltiplas conexões.
    if (db) {
      return resolve(db);
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error(`[DB Error] Erro ao conectar ao banco de dados em ${DB_PATH}:`, err.message);
        // Em um ambiente de produção, considere um mecanismo de retry ou encerramento da aplicação.
        return reject(err);
      }
      console.log(`[DB Success] Conectado ao banco de dados SQLite em ${DB_PATH}.`);

      // Serializa as operações para garantir que a criação da tabela ocorra antes de outras queries
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
            data_cadastro TEXT NOT NULL
          )
        `, (err) => {
          if (err) {
            console.error('[DB Error] Erro ao criar a tabela leads:', err.message);
            return reject(err);
          }
          console.log('[DB Success] Tabela "leads" verificada/criada com sucesso.');
          resolve(db);
        });
      });
    });
  });
}

// Exporta uma função para obter a instância do banco de dados,
// garantindo que a conexão e a criação da tabela aconteçam uma única vez.
module.exports = {
  connectDb,
  getDb: () => db // Permite obter a instância da DB após a conexão
};