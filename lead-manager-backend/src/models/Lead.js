// lead-manager-backend/src/models/Lead.js

/**
 * @typedef {object} Lead
 * @property {number} [id] - O ID único do lead (gerado automaticamente pelo banco).
 * @property {string} nome - O nome do lead.
 * @property {string} telefone - O telefone do lead.
 * @property {string} [email] - O email do lead (opcional).
 * @property {string} [empresa] - A empresa do lead (opcional).
 * @property {string} [origem] - A origem do lead (opcional).
 * @property {string} [observacoes] - Observações adicionais sobre o lead (opcional).
 * @property {string} data_cadastro - A data de cadastro do lead no formato ISO 8601 (YYYY-MM-DDTHH:MM:SS.sssZ).
 */

// Este arquivo serve principalmente como documentação para a estrutura de um Lead.
// Não há necessidade de exportar classes ou objetos complexos para SQLite.
// A lógica de interação com o banco de dados estará em LeadService.js.

// Pode-se exportar um objeto vazio ou nada, já que a 'typedef' é para documentação.
module.exports = {};