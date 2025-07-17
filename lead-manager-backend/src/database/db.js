// lead-manager-backend/src/database/db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

require('dotenv').config();

const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../../leads.db');

let db;

function connectDb() {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error(`[DB Error] Erro ao conectar ao banco de dados em ${DB_PATH}:`, err.message);
        return reject(err);
      }
      console.log(`[DB Success] Conectado ao banco de dados SQLite em ${DB_PATH}.`);

      db.serialize(() => {
        // ATENÇÃO: Se você já tem dados na tabela 'leads' com 'telefone' e 'email',
        // você precisará migrar esses dados manualmente para as novas tabelas
        // 'lead_emails' e 'lead_phones' ANTES de remover essas colunas da 'leads'.
        // Ou, para simplificar e se for um banco de dados de desenvolvimento,
        // você pode deletar o arquivo leads.db e ele será recriado com o novo esquema.

        // 1. Criar ou verificar a tabela 'leads' (sem telefone e email diretos)
        db.run(`
          CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            empresa TEXT,
            origem TEXT,
            observacoes TEXT,
            data_cadastro TEXT NOT NULL
          )
        `, (err) => {
          if (err) {
            console.error('[DB Error] Erro ao criar/verificar a tabela leads:', err.message);
            return reject(err);
          }
          console.log('[DB Success] Tabela "leads" verificada/criada com sucesso (esquema atualizado).');

          // 2. Criar ou verificar a tabela 'lead_emails'
          db.run(`
            CREATE TABLE IF NOT EXISTS lead_emails (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              lead_id INTEGER NOT NULL,
              email TEXT NOT NULL,
              is_primary INTEGER DEFAULT 0, -- 0 para false, 1 para true
              FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
            )
          `, (err) => {
            if (err) {
              console.error('[DB Error] Erro ao criar/verificar a tabela lead_emails:', err.message);
              return reject(err);
            }
            console.log('[DB Success] Tabela "lead_emails" verificada/criada com sucesso.');

            // 3. Criar ou verificar a tabela 'lead_phones'
            db.run(`
              CREATE TABLE IF NOT EXISTS lead_phones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lead_id INTEGER NOT NULL,
                phone_number TEXT NOT NULL,
                is_whatsapp INTEGER DEFAULT 0, -- 0 para false, 1 para true
                is_primary INTEGER DEFAULT 0,  -- 0 para false, 1 para true
                FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
              )
            `, (err) => {
              if (err) {
                console.error('[DB Error] Erro ao criar/verificar a tabela lead_phones:', err.message);
                return reject(err);
              }
              console.log('[DB Success] Tabela "lead_phones" verificada/criada com sucesso.');
              resolve(db);
            });
          });
        });
      });
    });
  });
}

module.exports = { connectDb };