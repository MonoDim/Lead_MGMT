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

      // Validação básica: nome e telefone(s) são obrigatórios. E-mail(s) agora são opcionais.
      if (!nome || !telefones || !Array.isArray(telefones) || telefones.length === 0) {
        return res.status(400).json({ message: 'Nome e telefone(s) são obrigatórios.' });
      }

      // Validação de formato para e-mails (apenas se e-mails forem fornecidos)
      if (emails && Array.isArray(emails) && emails.length > 0) {
        // NOVA REGEX: Mais robusta para validar e-mails comuns no backend
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // <-- LINHA ALTERADA AQUI
        for (const emailObj of emails) {
          // Apenas valida se o email não estiver vazio (o frontend já filtra vazios, mas por segurança)
          if (emailObj.email.trim() !== '' && !emailRegex.test(emailObj.email)) {
            return res.status(400).json({ message: `E-mail inválido encontrado: ${emailObj.email}.` });
          }
        }
      }

      // Validação de formato e limpeza para telefones
      const phoneRegex = /^\d{10,11}$/; // Aceita 10 ou 11 dígitos numéricos
      for (const telObj of telefones) {
        const cleanedPhoneNumber = telObj.phone_number.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (!cleanedPhoneNumber || !phoneRegex.test(cleanedPhoneNumber)) {
          return res.status(400).json({ message: `Telefone inválido encontrado: ${telObj.phone_number}. Deve conter 10 ou 11 dígitos numéricos.` });
        }
        telObj.phone_number = cleanedPhoneNumber; // Atualiza o número de telefone limpo
      }

      const leadId = await this.leadService.addLead({ nome, empresa, origem, observacoes, emails: emails || [], telefones });
      res.status(201).json({ message: 'Lead adicionado com sucesso!', leadId });
    } catch (error) {
      console.error('[LeadController Error] Erro ao criar lead:', error.message);
      res.status(500).json({ message: 'Falha ao criar lead.' });
    }
  }

  async getLeads(req, res) {
    try {
      const { q, sortBy, sortOrder } = req.query;
      const leads = await this.leadService.getLeads(q, sortBy, sortOrder);
      res.status(200).json(leads);
    } catch (error) {
      console.error('[LeadController Error] Erro ao obter leads:', error.message);
      res.status(500).json({ message: 'Falha ao obter leads.' });
    }
  }

  async updateLead(req, res) {
    try {
      const { id } = req.params;
      const { nome, empresa, origem, observacoes, emails, telefones } = req.body;

      // Validação básica: nome e telefone(s) são obrigatórios para atualização. E-mail(s) são opcionais.
      if (!nome || !telefones || !Array.isArray(telefones) || telefones.length === 0) {
        return res.status(400).json({ message: 'Nome e telefone(s) são obrigatórios para atualização.' });
      }

      // Validação de formato para e-mails (apenas se e-mails forem fornecidos)
      if (emails && Array.isArray(emails) && emails.length > 0) {
        // NOVA REGEX: Mais robusta para validar e-mails comuns no backend
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // <-- LINHA ALTERADA AQUI
        for (const emailObj of emails) {
          // Apenas valida se o email não estiver vazio
          if (emailObj.email.trim() !== '' && !emailRegex.test(emailObj.email)) {
            return res.status(400).json({ message: `E-mail inválido encontrado: ${emailObj.email}.` });
          }
        }
      }

      // Validação de formato e limpeza para telefones
      const phoneRegex = /^\d{10,11}$/;
      for (const telObj of telefones) {
        const cleanedPhoneNumber = telObj.phone_number.replace(/\D/g, '');
        if (!cleanedPhoneNumber || !phoneRegex.test(cleanedPhoneNumber)) {
          return res.status(400).json({ message: `Telefone inválido encontrado: ${telObj.phone_number}. Deve conter 10 ou 11 dígitos numéricos.` });
        }
        telObj.phone_number = cleanedPhoneNumber;
      }

      const success = await this.leadService.updateLead(Number(id), { nome, empresa, origem, observacoes, emails: emails || [], telefones });
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
      console.log(`[DEBUG] LeadController - deleteLead: ID ${id}, Service returned success: ${success}`);

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
