// lead-manager-backend/src/controllers/LeadController.js

const LeadService = require('../services/LeadService');

class LeadController {
  /**
   * Cria um novo lead. (Sem alterações)
   * @param {object} req - Objeto de requisição.
   * @param {object} res - Objeto de resposta.
   */
  static async createLead(req, res) {
    const { nome, telefone, email, empresa, origem, observacoes } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({ message: 'Nome e telefone são campos obrigatórios.' });
    }

    try {
      const newLeadId = await LeadService.addLead({
        nome,
        telefone,
        email,
        empresa,
        origem,
        observacoes
      });
      res.status(201).json({ message: 'Lead criado com sucesso.', id: newLeadId });
    } catch (error) {
      console.error('[LeadController Error] Erro ao criar lead:', error.message);
      res.status(500).json({ message: 'Erro interno do servidor ao criar lead.' });
    }
  }

  /**
   * Lista ou busca leads com base nos parâmetros de query.
   * Suporta busca por termo ('q') e filtros de estatística ('hasEmail', 'hasCompany', 'origem').
   * @param {object} req - Objeto de requisição, que pode conter query parameters.
   * @param {object} res - Objeto de resposta.
   */
  static async listLeads(req, res) {
    try {
      const { q, hasEmail, hasCompany, origem } = req.query; // Pega todos os possíveis query parameters

      // Cria um objeto de filtros para passar ao serviço
      const filters = {};
      if (q) filters.q = q;
      if (hasEmail) filters.hasEmail = hasEmail; // 'true' ou 'false' como string
      if (hasCompany) filters.hasCompany = hasCompany; // 'true' ou 'false' como string
      if (origem) filters.origem = origem;

      // Chama o LeadService.getLeads com os filtros.
      // O serviço já contém a lógica de prioridade (q > filtros de estatística).
      const leads = await LeadService.getLeads(filters);
      res.status(200).json(leads);
    } catch (error) {
      console.error('[LeadController Error] Erro ao listar/buscar leads:', error.message);
      res.status(500).json({ message: 'Erro interno do servidor ao buscar leads.' });
    }
  }

  /**
   * Atualiza um lead existente pelo ID. (Sem alterações)
   * @param {object} req - Objeto de requisição.
   * @param {object} res - Objeto de resposta.
   */
  static async updateLead(req, res) {
    const { id } = req.params;
    const { nome, telefone, email, empresa, origem, observacoes } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({ message: 'Nome e telefone são campos obrigatórios para atualização.' });
    }

    try {
      const changes = await LeadService.updateLead(Number(id), {
        nome,
        telefone,
        email,
        empresa,
        origem,
        observacoes
      });

      if (changes === 0) {
        return res.status(404).json({ message: `Lead com ID ${id} não encontrado.` });
      }

      res.status(200).json({ message: 'Lead atualizado com sucesso.', changes });
    } catch (error) {
      console.error(`[LeadController Error] Erro ao atualizar lead com ID ${id}:`, error.message);
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Erro interno do servidor ao atualizar lead.' });
    }
  }

  /**
   * Deleta um lead pelo ID. (Sem alterações)
   * @param {object} req - Objeto de requisição.
   * @param {object} res - Objeto de resposta.
   */
  static async deleteLead(req, res) {
    const { id } = req.params;

    try {
      const changes = await LeadService.deleteLead(Number(id));

      if (changes === 0) {
        return res.status(404).json({ message: `Lead com ID ${id} não encontrado para exclusão.` });
      }

      res.status(200).json({ message: 'Lead deletado com sucesso.' });
    } catch (error) {
      console.error(`[LeadController Error] Erro ao deletar lead com ID ${id}:`, error.message);
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Erro interno do servidor ao deletar lead.' });
    }
  }

  // O método searchLeads é removido daqui, pois sua funcionalidade foi incorporada em listLeads.
  // static async searchLeads(req, res) { ... }
}

module.exports = LeadController;