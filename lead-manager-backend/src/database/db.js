// lead-manager-backend/src/database/db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

require('dotenv').config();

// Define o caminho para o arquivo do banco de dados
const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../../leads.db');

let db; // Variável para armazenar a instância do banco de dados

/**
 * Função auxiliar para executar uma instrução SQL de escrita (INSERT, UPDATE, DELETE)
 * e retornar uma Promise.
 * @param {sqlite3.Database} dbInstance - A instância do banco de dados.
 * @param {string} sql - A instrução SQL a ser executada.
 * @param {Array} params - Os parâmetros para a instrução SQL.
 * @returns {Promise<Object>} Uma Promise que resolve com o objeto Statement.
 */
function runSql(dbInstance, sql, params = []) {
  return new Promise((resolve, reject) => {
    dbInstance.run(sql, params, function(err) {
      if (err) {
        return reject(err);
      }
      resolve(this); // Retorna o objeto Statement para acessar lastID/changes
    });
  });
}

/**
 * Função auxiliar para executar uma instrução SQL de leitura (SELECT)
 * e retornar uma Promise.
 * @param {sqlite3.Database} dbInstance - A instância do banco de dados.
 * @param {string} sql - A instrução SQL a ser executada.
 * @param {Array} params - Os parâmetros para a instrução SQL.
 * @returns {Promise<Array>} Uma Promise que resolve com as linhas retornadas.
 */
function allSql(dbInstance, sql, params = []) {
  return new Promise((resolve, reject) => {
    dbInstance.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

/**
 * Conecta ao banco de dados SQLite e inicializa as tabelas se não existirem.
 * Garante que a instância do DB seja resolvida apenas após toda a configuração.
 * @returns {Promise<sqlite3.Database>} Uma Promise que resolve com a instância do banco de dados.
 */
async function connectDb() {
  // Se a conexão já existe, retorna-a
  if (db) {
    return db;
  }

  return new Promise((resolve, reject) => {
    // Cria uma nova instância do banco de dados
    db = new sqlite3.Database(DB_PATH, async (err) => { // Callback assíncrono
      if (err) {
        console.error(`[DB Error] Erro ao conectar ao banco de dados em ${DB_PATH}:`, err.message);
        return reject(err);
      }
      console.log(`[DB Success] Conectado ao banco de dados SQLite em ${DB_PATH}.`);

      try {
        // NOVO: Ativar chaves estrangeiras para esta conexão
        await runSql(db, `PRAGMA foreign_keys = ON;`);
        console.log('[DB Success] Chaves estrangeiras habilitadas.');

        // Usa db.serialize para garantir que as operações de criação de tabela ocorram em ordem
        // O callback de serialize também é assíncrono para permitir await
        db.serialize(async () => {
          // 1. Criar a tabela 'leads' se não existir
          await runSql(db, `
            CREATE TABLE IF NOT EXISTS leads (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              nome TEXT NOT NULL,
              empresa TEXT,
              origem TEXT,
              observacoes TEXT,
              data_cadastro TEXT NOT NULL
            )
          `);
          console.log('[DB Success] Tabela "leads" verificada/criada com sucesso.');

          // 2. Criar a tabela 'lead_emails' se não existir
          await runSql(db, `
            CREATE TABLE IF NOT EXISTS lead_emails (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              lead_id INTEGER NOT NULL,
              email TEXT NOT NULL,
              is_primary INTEGER NOT NULL DEFAULT 0, -- 0 for false, 1 for true
              FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
            )
          `);
          console.log('[DB Success] Tabela "lead_emails" verificada/criada com sucesso.');

          // 3. Criar a tabela 'lead_phones' se não existir
          await runSql(db, `
            CREATE TABLE IF NOT EXISTS lead_phones (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              lead_id INTEGER NOT NULL,
              phone_number TEXT NOT NULL,
              is_whatsapp INTEGER NOT NULL DEFAULT 0, -- 0 for false, 1 for true
              is_primary INTEGER NOT NULL DEFAULT 0, -- 0 for false, 1 for true
              FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
            )
          `);
          console.log('[DB Success] Tabela "lead_phones" verificada/criada com sucesso.');

          // Opcional: Remover colunas antigas (migração de esquema, se necessário)
          try {
            const rows = await allSql(db, `PRAGMA table_info(leads);`);
            const columns = rows.map(row => row.name);

            let alterQueries = [];
            if (columns.includes('email')) {
              alterQueries.push('ALTER TABLE leads DROP COLUMN email;');
            }
            if (columns.includes('telefone')) {
              alterQueries.push('ALTER TABLE leads DROP COLUMN telefone;');
            }

            for (const query of alterQueries) {
              try {
                await runSql(db, query);
                console.log(`[DB Success] Coluna removida: ${query}`);
              } catch (alterErr) {
                console.warn(`[DB Warning] Não foi possível remover coluna (pode não existir ou erro de SQL): ${query}`, alterErr.message);
              }
            }
          } catch (pragmaErr) {
            console.error('[DB Error] Erro ao verificar/remover colunas antigas:', pragmaErr.message);
          }

          resolve(db); // Resolve a Promise principal APENAS após toda a configuração estar completa
        });
      } catch (setupError) {
        console.error('[DB Error] Erro durante a configuração inicial do banco de dados:', setupError.message);
        reject(setupError); // Rejeita a Promise principal se qualquer etapa de configuração falhar
      }
    });
  });
}

module.exports = {
  connectDb,
  getDb: () => db
};
