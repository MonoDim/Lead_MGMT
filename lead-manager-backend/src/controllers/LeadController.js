// lead-manager-backend/src/controllers/LeadController.js

const LeadService = require('../services/LeadService');

// Não precisamos mais importar a classe Lead aqui,
// já que ela é apenas para documentação do modelo de dados agora.
// const Lead = require('../models/Lead');

class LeadController {
  /**
   * Cria um novo lead.
   * @param {object} req - Objeto de requisição.
   * @param {object} res - Objeto de resposta.
   */
  static async createLead(req, res) {
    const { nome, telefone, email, empresa, origem, observacoes } = req.body;

    // Validação básica de entrada
    if (!nome || !telefone) {
      return res.status(400).json({ message: 'Nome e telefone são campos obrigatórios.' });
    }

    try {
      // O LeadService.addLead agora espera um objeto com os dados.
      // E retorna uma Promise com o ID do novo lead.
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
      // Retorna uma mensagem de erro genérica para o cliente,
      // a mensagem de erro específica está no console do servidor.
      res.status(500).json({ message: 'Erro interno do servidor ao criar lead.' });
    }
  }

  /**
   * Lista todos os leads.
   * @param {object} req - Objeto de requisição.
   * @param {object} res - Objeto de resposta.
   */
  static async listLeads(req, res) {
    try {
      // O LeadService.getAllLeads agora retorna uma Promise com a lista de leads.
      const leads = await LeadService.getAllLeads();
      res.status(200).json(leads);
    } catch (error) {
      console.error('[LeadController Error] Erro ao listar leads:', error.message);
      res.status(500).json({ message: 'Erro interno do servidor ao buscar leads.' });
    }
  }

  /**
   * Atualiza um lead existente pelo ID.
   * @param {object} req - Objeto de requisição.
   * @param {object} res - Objeto de resposta.
   */
  static async updateLead(req, res) {
    const { id } = req.params; // Pega o ID dos parâmetros da URL
    const { nome, telefone, email, empresa, origem, observacoes } = req.body; // Pega os dados do corpo da requisição

    // Validação básica de entrada
    if (!nome || !telefone) {
      return res.status(400).json({ message: 'Nome e telefone são campos obrigatórios para atualização.' });
    }

    try {
      // O LeadService.updateLead agora retorna uma Promise com o número de linhas alteradas.
      const changes = await LeadService.updateLead(Number(id), {
        nome,
        telefone,
        email,
        empresa,
        origem,
        observacoes
      });

      // Se changes for 0, significa que o lead não foi encontrado pelo ID
      if (changes === 0) {
        return res.status(404).json({ message: `Lead com ID ${id} não encontrado.` });
      }

      res.status(200).json({ message: 'Lead atualizado com sucesso.', changes });
    } catch (error) {
      console.error(`[LeadController Error] Erro ao atualizar lead com ID ${id}:`, error.message);
      // Erro mais específico se vier do serviço (ex: "Lead não encontrado para atualização.")
      if (error.message.includes('não encontrado')) {
         return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Erro interno do servidor ao atualizar lead.' });
    }
  }

  /**
   * Deleta um lead pelo ID.
   * @param {object} req - Objeto de requisição.
   * @param {object} res - Objeto de resposta.
   */
  static async deleteLead(req, res) {
    const { id } = req.params;

    try {
      // O LeadService.deleteLead agora retorna uma Promise com o número de linhas deletadas.
      const changes = await LeadService.deleteLead(Number(id)); // Converte para número

      // Se changes for 0, significa que o lead não foi encontrado
      if (changes === 0) {
        return res.status(404).json({ message: `Lead com ID ${id} não encontrado para exclusão.` });
      }

      res.status(200).json({ message: 'Lead deletado com sucesso.' });
    } catch (error) {
      console.error(`[LeadController Error] Erro ao deletar lead com ID ${id}:`, error.message);
      // Erro mais específico se vier do serviço (ex: "Lead não encontrado para exclusão.")
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Erro interno do servidor ao deletar lead.' });
    }
  }

  /**
   * Busca leads por nome ou telefone.
   * @param {object} req - Objeto de requisição.
   * @param {object} res - Objeto de resposta.
   */
  static async searchLeads(req, res) {
    const { q: searchTerm } = req.query; // Pega o termo de busca da query string (?q=termo)

    if (!searchTerm) {
      return res.status(400).json({ message: 'Parâmetro de busca "q" é obrigatório.' });
    }

    try {
      const leads = await LeadService.searchLeads(searchTerm);
      res.status(200).json(leads);
    } catch (error) {
      console.error('[LeadController Error] Erro ao buscar leads:', error.message);
      res.status(500).json({ message: 'Erro interno do servidor ao buscar leads.' });
    }
  }
}

module.exports = LeadController;