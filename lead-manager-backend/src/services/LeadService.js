// lead-manager-backend/src/services/LeadService.js

const { getDb } = require('../database/db');

class LeadService {

  /**
   * Adiciona um novo lead ao banco de dados. (Sem alterações)
   * @param {object} leadData - Os dados do lead a ser adicionado.
   * @param {string} leadData.nome
   * @param {string} leadData.telefone
   * @param {string} [leadData.email]
   * @param {string} [leadData.empresa]
   * @param {string} [leadData.origem]
   * @param {string} [leadData.observacoes]
   * @returns {Promise<number>} O ID do lead recém-criado.
   * @throws {Error} Se ocorrer um erro ao adicionar o lead.
   */
  static async addLead(leadData) {
    const db = getDb();
    const data_cadastro = new Date().toISOString();

    const query = `
      INSERT INTO leads (
        nome, telefone, email, empresa, origem, observacoes, data_cadastro
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      leadData.nome,
      leadData.telefone,
      leadData.email || null,
      leadData.empresa || null,
      leadData.origem || null,
      leadData.observacoes || null,
      data_cadastro
    ];

    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) {
          console.error('[LeadService Error] Erro ao adicionar lead:', err.message);
          return reject(new Error('Falha ao adicionar lead.'));
        }
        resolve(this.lastID);
      });
    });
  }

  /**
   * Obtém leads do banco de dados, com suporte a busca por termo e filtros de estatística.
   * @param {object} filters - Um objeto contendo os parâmetros de filtro.
   * @param {string} [filters.q] - Termo de busca por nome ou telefone.
   * @param {boolean} [filters.hasEmail] - Se true, filtra leads que possuem email.
   * @param {boolean} [filters.hasCompany] - Se true, filtra leads que possuem empresa.
   * @param {string} [filters.origem] - Filtra leads por uma origem específica.
   * @returns {Promise<Array<object>>} Um array de objetos lead correspondentes aos filtros.
   * @throws {Error} Se ocorrer um erro ao buscar os leads.
   */
  static async getLeads(filters = {}) {
    const db = getDb();
    let query = `SELECT id, nome, telefone, email, empresa, origem, observacoes, data_cadastro FROM leads`;
    const params = [];
    const conditions = [];

    // 1. Filtro por termo de busca (nome ou telefone)
    if (filters.q) {
      // Prioriza a busca por termo, ignorando outros filtros de stats se `q` estiver presente
      // (Esta lógica de prioridade será mais fortemente controlada no Controller)
      // Aqui, apenas adicionamos a condição se ela existir.
      const searchTerm = `%${filters.q.toUpperCase()}%`;
      const phoneSearchTerm = `%${filters.q.replace(/\D/g, '')}%`;
      conditions.push(`(UPPER(nome) LIKE ? OR REPLACE(telefone, ?, '') LIKE ?)`);
      params.push(searchTerm, /\D/g, phoneSearchTerm);
    } else {
      // 2. Filtros de estatísticas (aplicados apenas se não houver 'q')
      if (filters.hasEmail === 'true') { // Note que o valor virá como string 'true' do frontend
        conditions.push(`email IS NOT NULL AND email != ''`);
      }
      if (filters.hasCompany === 'true') { // Note que o valor virá como string 'true' do frontend
        conditions.push(`empresa IS NOT NULL AND empresa != ''`);
      }
      if (filters.origem) {
        conditions.push(`origem = ?`);
        params.push(filters.origem);
      }
    }

    // Adiciona as condições WHERE à query
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Ordem padrão
    query += ` ORDER BY id DESC`;

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          console.error('[LeadService Error] Erro ao obter leads com filtros:', err.message);
          return reject(new Error('Falha ao obter leads com filtros.'));
        }
        resolve(rows);
      });
    });
  }

  /**
   * Atualiza um lead existente no banco de dados. (Sem alterações)
   * @param {number} id - O ID do lead a ser atualizado.
   * @param {object} leadData - Os novos dados do lead.
   * @returns {Promise<number>} O número de linhas modificadas.
   * @throws {Error} Se o lead não for encontrado ou ocorrer um erro na atualização.
   */
  static async updateLead(id, leadData) {
    const db = getDb();
    const query = `
      UPDATE leads
      SET nome = ?, telefone = ?, email = ?, empresa = ?, origem = ?, observacoes = ?
      WHERE id = ?
    `;

    const params = [
      leadData.nome,
      leadData.telefone,
      leadData.email || null,
      leadData.empresa || null,
      leadData.origem || null,
      leadData.observacoes || null,
      id
    ];

    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) {
          console.error(`[LeadService Error] Erro ao atualizar lead com ID ${id}:`, err.message);
          return reject(new Error('Falha ao atualizar lead.'));
        }
        if (this.changes === 0) {
          return reject(new Error(`Lead com ID ${id} não encontrado.`));
        }
        resolve(this.changes);
      });
    });
  }

  /**
   * Deleta um lead do banco de dados. (Sem alterações)
   * @param {number} id - O ID do lead a ser deletado.
   * @param {object} LeadData
   * @returns {Promise<number>} O número de linhas deletadas.
   * @throws {Error} Se o lead não for encontrado ou ocorrer um erro na exclusão.
   */
  static async deleteLead(id) {
    const db = getDb();
    const query = `DELETE FROM leads WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.run(query, [id], function (err) {
        if (err) {
          console.error(`[LeadService Error] Erro ao deletar lead com ID ${id}:`, err.message);
          return reject(new Error('Falha ao deletar lead.'));
        }
        if (this.changes === 0) {
          return reject(new Error(`Lead com ID ${id} não encontrado para exclusão.`));
        }
        resolve(this.changes);
      });
    });
  }
}

module.exports = LeadService;