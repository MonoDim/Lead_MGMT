// lead-manager-backend/src/controllers/LeadController.js

const LeadService = require('../services/LeadService');

class LeadController {
  constructor(dbInstance) {
    this.leadService = new LeadService(dbInstance);
    this.addLead = this.addLead.bind(this);
    this.getLeads = this.getLeads.bind(this);
    this.updateLead = this.updateLead.bind(this);
    this.deleteLead = this.deleteLead.bind(this);
  }

  async addLead(req, res) {
    try {
      const { nome, empresa, origem, observacoes, emails, telefones } = req.body;

      // Validação: Nome e telefone(s) são obrigatórios. E-mails são opcionais.
      if (!nome || !telefones || !Array.isArray(telefones) || telefones.length === 0) {
        return res.status(400).json({ message: 'Nome e telefone(s) são obrigatórios.' });
      }

      // Validação de formato para e-mails (apenas se houver e-mails)
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (emails && Array.isArray(emails)) {
        for (const emailObj of emails) {
          if (!emailObj.email_address || !emailRegex.test(emailObj.email_address)) {
            return res.status(400).json({ message: `E-mail inválido encontrado: ${emailObj.email_address}` });
          }
        }
      }

      // Validação de formato para telefones
      const phoneRegex = /^\\d{10,11}$/; // Exige 10 ou 11 dígitos numéricos
      for (const telObj of telefones) {
        const cleanedPhoneNumber = telObj.phone_number.replace(/\\D/g, ''); // Remove caracteres não numéricos
        if (!cleanedPhoneNumber || !phoneRegex.test(cleanedPhoneNumber)) {
          return res.status(400).json({ message: `Telefone inválido encontrado: ${telObj.phone_number}. Deve conter 10 ou 11 dígitos numéricos.` });
        }
        telObj.phone_number = cleanedPhoneNumber; // Atualiza com número limpo
      }

      const newLeadId = await this.leadService.addLead({
        nome,
        empresa,
        origem,
        observacoes,
        emails,
        telefones,
      });

      res.status(201).json({ message: 'Lead adicionado com sucesso!', id: newLeadId });
    } catch (error) {
      console.error('[LeadController Error] Erro ao adicionar lead:', error.message);
      res.status(500).json({ message: 'Falha ao adicionar lead.' });
    }
  }

  async getLeads(req, res) {
    try {
      const { q, origem, hasEmail, hasCompany } = req.query; // q para busca geral

      const filterOptions = {};
      if (q) filterOptions.q = q;
      if (origem) filterOptions.origem = origem;
      if (hasEmail === 'true') filterOptions.hasEmail = true;
      if (hasCompany === 'true') filterOptions.hasCompany = true;

      const leads = await this.leadService.getLeads(filterOptions);
      res.status(200).json(leads);
    } catch (error) {
      console.error('[LeadController Error] Erro ao buscar leads:', error.message);
      res.status(500).json({ message: 'Falha ao buscar leads.' });
    }
  }

  async updateLead(req, res) {
    try {
      const { id } = req.params;
      const { nome, empresa, origem, observacoes, emails, telefones } = req.body;

      // Validação: Nome e telefone(s) são obrigatórios. E-mails são opcionais.
      if (!nome || !telefones || !Array.isArray(telefones) || telefones.length === 0) {
        return res.status(400).json({ message: 'Nome e telefone(s) são obrigatórios.' });
      }

      // Validação de formato para e-mails (apenas se houver e-mails)
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (emails && Array.isArray(emails)) {
        for (const emailObj of emails) {
          if (!emailObj.email_address || !emailRegex.test(emailObj.email_address)) {
            return res.status(400).json({ message: `E-mail inválido encontrado: ${emailObj.email_address}` });
          }
        }
      }
      
      // Validação de formato para telefones
      const phoneRegex = /^\\d{10,11}$/;
      for (const telObj of telefones) {
        const cleanedPhoneNumber = telObj.phone_number.replace(/\\D/g, '');
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
      console.error('[LeadController Error] Erro ao remover lead:', error.message);
      res.status(500).json({ message: 'Falha ao remover lead.' });
    }
  }
}

module.exports = LeadController;