// lead-manager-backend/src/routes/leadRoutes.js

const express = require('express');
const LeadController = require('../controllers/LeadController'); // Importa a CLASSE LeadController

// Este módulo agora exporta uma FUNÇÃO que recebe a instância do DB
// e retorna um roteador Express configurado.
module.exports = (dbInstance) => {
  const router = express.Router();
  const leadController = new LeadController(dbInstance); // Cria a instância do LeadController aqui

  router.post('/', leadController.addLead); // Use os métodos da INSTÂNCIA do controller
  router.get('/', leadController.getLeads); // (use addLead e getLeads como no LeadController.js)
  router.put('/:id', leadController.updateLead);
  router.delete('/:id', leadController.deleteLead);

  return router; // Retorna o roteador configurado
};