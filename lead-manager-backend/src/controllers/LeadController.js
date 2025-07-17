// lead-manager-backend/src/controllers/LeadController.js

const LeadService = require('../services/LeadService'); // Importa a CLASSE LeadService, não a instância

class LeadController {
  constructor(dbInstance) { // Agora aceita a instância do DB
    // Passa a instância do DB para o construtor do LeadService
    this.leadService = new LeadService(dbInstance);

    // Binde os métodos para garantir que 'this' se refira à instância da classe
    this.addLead = this.addLead.bind(this);
    this.getLeads = this.getLeads.bind(this);
    this.updateLead = this.updateLead.bind(this);
    this.deleteLead = this.deleteLead.bind(this);
  }

  async addLead(req, res) {
    try {
      const { nome, empresa, origem, observacoes, emails, telefones } = req.body;

      // Validação básica
      if (!nome || !emails || !Array.isArray(emails) || emails.length === 0 || !telefones || !Array.isArray(telefones) || telefones.length === 0) {
        return res.status(400).json({ message: 'Nome, e-mail(s) e telefone(s) são obrigatórios.' });
      }

      // Validação de formato para e-mails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const emailObj of emails) {
        if (!emailObj.email || !emailRegex.test(emailObj.email)) {
          return res.status(400).json({ message: `E-mail inválido encontrado: ${emailObj.email}.` });
        }
      }

      // Validação de formato para telefones (apenas números)
      const phoneRegex = /^\d{10,11}$/; // Exemplo: 10 ou 11 dígitos numéricos
      for (const telObj of telefones) {
        const cleanedPhoneNumber = telObj.phone_number.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (!cleanedPhoneNumber || !phoneRegex.test(cleanedPhoneNumber)) {
          return res.status(400).json({ message: `Telefone inválido encontrado: ${telObj.phone_number}. Deve conter 10 ou 11 dígitos numéricos.` });
        }
        // Atualiza o objeto com o número limpo antes de passar para o serviço
        telObj.phone_number = cleanedPhoneNumber;
      }

      const leadId = await this.leadService.addLead({ nome, empresa, origem, observacoes, emails, telefones });
      res.status(201).json({ id: leadId, message: 'Lead adicionado com sucesso!' });
    } catch (error) {
      console.error('[LeadController Error] Erro ao criar lead:', error.message);
      res.status(500).json({ message: 'Falha ao adicionar lead.' });
    }
  }

  async getLeads(req, res) {
    try {
      const { q, sortBy, sortOrder } = req.query;
      const leads = await this.leadService.getLeads(q, sortBy, sortOrder);
      res.status(200).json(leads);
    } catch (error) {
      console.error('[LeadController Error] Erro ao listar/buscar leads:', error.message);
      res.status(500).json({ message: 'Falha ao obter leads com filtros.' });
    }
  }

  async updateLead(req, res) {
    try {
      const { id } = req.params;
      const { nome, empresa, origem, observacoes, emails, telefones } = req.body;

      // Validação básica
      if (!nome || !emails || !Array.isArray(emails) || emails.length === 0 || !telefones || !Array.isArray(telefones) || telefones.length === 0) {
        return res.status(400).json({ message: 'Nome, e-mail(s) e telefone(s) são obrigatórios.' });
      }

      // Validação de formato para e-mails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const emailObj of emails) {
        if (!emailObj.email || !emailRegex.test(emailObj.email)) {
          return res.status(400).json({ message: `E-mail inválido encontrado: ${emailObj.email}.` });
        }
      }

      // Validação de formato para telefones
      const phoneRegex = /^\d{10,11}$/;
      for (const telObj of telefones) {
        const cleanedPhoneNumber = telObj.phone_number.replace(/\D/g, '');
        if (!cleanedPhoneNumber || !phoneRegex.test(cleanedPhoneNumber)) {
          return res.status(400).json({ message: `Telefone inválido encontrado: ${telObj.phone_number}. Deve conter 10 ou 11 dígitos numéricos.` });
        }
        telObj.phone_number = cleanedPhoneNumber;
      }

      const success = await this.leadService.updateLead(Number(id), { nome, empresa, origem, observacoes, emails, telefones });
      if (success) {
        res.status(200).json({ message: 'Lead atualizado com sucesso!' });
      } else {
        res.status(404).json({ message: 'Lead não encontrado.' });
      }
    } catch (error) {
      console.error('[LeadController Error] Erro ao atualizar lead:', error.message);
      res.status(500).json({ message: 'Falha ao atualizar lead.' });
    }
  }

  async deleteLead(req, res) {
    try {
      const { id } = req.params;
      const success = await this.leadService.deleteLead(Number(id));
      if (success) {
        res.status(200).json({ message: 'Lead deletado com sucesso!' });
      } else {
        res.status(404).json({ message: 'Lead não encontrado.' });
      }
    } catch (error) {
      console.error('[LeadController Error] Erro ao deletar lead:', error.message);
      res.status(500).json({ message: 'Falha ao deletar lead.' });
    }
  }
}

module.exports = LeadController;