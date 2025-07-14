const Lead = require('../models/Lead');
const LeadService = require('../services/LeadService');

class LeadController {
  static createLead(req, res) {
    const { nome, telefone, observacoes } = req.body;
    if (!nome || !telefone) {
      return res.status(400).json({ message: 'Nome e telefone são obrigatórios.' });
    }

    const lead = new Lead(nome, telefone, observacoes);
    LeadService.addLead(lead, (err, id) => {
      if (err) return res.status(500).json({ message: 'Erro ao salvar lead.' });
      res.status(201).json({ message: 'Lead criado com sucesso.', id });
    });
  }

  static listLeads(req, res) {
    LeadService.getAllLeads((err, leads) => {
      if (err) return res.status(500).json({ message: 'Erro ao buscar leads.' });
      res.json(leads);
    });
  }

  static deleteLead(req, res) {
    const { id } = req.params;
    LeadService.deleteLead(id, (err, changes) => {
      if (err || changes === 0) return res.status(404).json({ message: 'Lead não encontrado.' });
      res.json({ message: 'Lead deletado com sucesso.' });
    });
  }
}

module.exports = LeadController;
