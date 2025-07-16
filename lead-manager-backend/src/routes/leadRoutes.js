// lead-manager-backend/src/routes/leadRoutes.js

const express = require('express');
const LeadController = require('../controllers/LeadController'); // Importa o controlador
const router = express.Router(); // Cria uma nova instância do Router

// Rota para criar um novo lead (POST /api/leads)
router.post('/', LeadController.createLead);

// Rota para listar todos os leads (GET /api/leads)
// Esta rota também pode ser usada para a busca se o parâmetro 'q' estiver presente
router.get('/', (req, res) => {
  // Verifica se há um termo de busca na query string (ex: /api/leads?q=nomeOuTelefone)
  if (req.query.q) {
    LeadController.searchLeads(req, res); // Se 'q' existe, chama o método de busca
  } else {
    LeadController.listLeads(req, res); // Caso contrário, lista todos os leads
  }
});

// Rota para atualizar um lead existente pelo ID (PUT /api/leads/:id)
// Usamos PUT para atualização completa de um recurso
router.put('/:id', LeadController.updateLead);

// Rota para deletar um lead pelo ID (DELETE /api/leads/:id)
router.delete('/:id', LeadController.deleteLead);

module.exports = router; // Exporta o router para ser usado em app.js