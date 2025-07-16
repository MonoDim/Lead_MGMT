// lead-manager-backend/src/services/LeadService.js

// Importa a função para obter a instância do banco de dados conectada
const { getDb } = require('../database/db');

// Embora 'Lead' agora seja apenas um JSDoc, ele ainda pode ser importado para fins de documentação (JSDoc)
// ou se no futuro você decidir ter uma classe para manipulação de dados em memória.
// Por enquanto, não é estritamente necessário para a funcionalidade.
// const Lead = require('../models/Lead'); // Mantendo caso queira referenciar o tipo 'Lead'

class LeadService {

  /**
   * Adiciona um novo lead ao banco de dados.
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
    const db = getDb(); // Obtém a instância do banco de dados

    // Garante que data_cadastro seja sempre gerado no serviço, padronizando.
    // Usamos toISOString() para um formato padronizado.
    const data_cadastro = new Date().toISOString();

    const query = `
      INSERT INTO leads (
        nome, telefone, email, empresa, origem, observacoes, data_cadastro
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      leadData.nome,
      leadData.telefone,
      leadData.email || null, // Garante que seja null se não fornecido, não undefined
      leadData.empresa || null,
      leadData.origem || null,
      leadData.observacoes || null,
      data_cadastro
    ];

    return new Promise((resolve, reject) => {
      // 'run' é usado para INSERT, UPDATE, DELETE - operações que não retornam linhas.
      // 'this.lastID' contém o ID da última linha inserida.
      db.run(query, params, function (err) {
        if (err) {
          console.error('[LeadService Error] Erro ao adicionar lead:', err.message);
          return reject(new Error('Falha ao adicionar lead.'));
        }
        resolve(this.lastID); // 'this' refere-se ao Statement object no callback
      });
    });
  }

  /**
   * Obtém todos os leads do banco de dados, ordenados por ID em ordem decrescente.
   * @returns {Promise<Array<object>>} Um array de objetos lead.
   * @throws {Error} Se ocorrer um erro ao buscar os leads.
   */
  static async getAllLeads() {
    const db = getDb();
    const query = `SELECT id, nome, telefone, email, empresa, origem, observacoes, data_cadastro FROM leads ORDER BY id DESC`;

    return new Promise((resolve, reject) => {
      // 'all' é usado para SELECT que retorna múltiplas linhas.
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('[LeadService Error] Erro ao obter todos os leads:', err.message);
          return reject(new Error('Falha ao obter leads.'));
        }
        resolve(rows);
      });
    });
  }

  /**
   * Atualiza um lead existente no banco de dados.
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
      // 'run' é usado para INSERT, UPDATE, DELETE.
      // 'this.changes' contém o número de linhas afetadas.
      db.run(query, params, function (err) {
        if (err) {
          console.error(`[LeadService Error] Erro ao atualizar lead com ID ${id}:`, err.message);
          return reject(new Error('Falha ao atualizar lead.'));
        }
        if (this.changes === 0) {
          // Se nenhuma linha foi afetada, o lead não foi encontrado
          return reject(new Error(`Lead com ID ${id} não encontrado.`));
        }
        resolve(this.changes);
      });
    });
  }

  /**
   * Deleta um lead do banco de dados.
   * @param {number} id - O ID do lead a ser deletado.
   * @returns {Promise<number>} O número de linhas deletadas.
   * @throws {Error} Se o lead não for encontrado ou ocorrer um erro na exclusão.
   */
  static async deleteLead(id) {
    const db = getDb();
    const query = `DELETE FROM leads WHERE id = ?`;

    return new Promise((resolve, reject) => {
      // 'run' é usado para INSERT, UPDATE, DELETE.
      // 'this.changes' contém o número de linhas afetadas.
      db.run(query, [id], function (err) {
        if (err) {
          console.error(`[LeadService Error] Erro ao deletar lead com ID ${id}:`, err.message);
          return reject(new Error('Falha ao deletar lead.'));
        }
        if (this.changes === 0) {
          // Se nenhuma linha foi afetada, o lead não foi encontrado
          return reject(new Error(`Lead com ID ${id} não encontrado para exclusão.`));
        }
        resolve(this.changes);
      });
    });
  }

  /**
   * Busca leads por nome ou telefone.
   * @param {string} searchTerm - O termo de busca.
   * @returns {Promise<Array<object>>} Um array de objetos lead correspondentes.
   * @throws {Error} Se ocorrer um erro na busca.
   */
  static async searchLeads(searchTerm) {
    const db = getDb();
    // Usamos LIKE com % para busca parcial e UPPER() para busca case-insensitive
    const query = `
      SELECT id, nome, telefone, email, empresa, origem, observacoes, data_cadastro
      FROM leads
      WHERE UPPER(nome) LIKE ? OR REPLACE(telefone, ?, '') LIKE ?
      ORDER BY id DESC
    `;
    // Prepara o termo de busca para LIKE
    const term = `%${searchTerm.toUpperCase()}%`;
    // O REPLACE(telefone, ?, '') remove caracteres não numéricos do telefone antes de comparar
    const phoneSearchTerm = `%${searchTerm.replace(/\D/g, '')}%`;


    return new Promise((resolve, reject) => {
      db.all(query, [term, /\D/g, phoneSearchTerm], (err, rows) => { // Passe os parâmetros corretamente aqui
        if (err) {
          console.error('[LeadService Error] Erro ao buscar leads:', err.message);
          return reject(new Error('Falha ao buscar leads.'));
        }
        resolve(rows);
      });
    });
  }
}

module.exports = LeadService;