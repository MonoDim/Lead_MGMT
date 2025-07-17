// lead-manager-backend/src/app.js

const express = require('express');
const cors = require('cors');
const LeadController = require('./controllers/LeadController'); // Importa a CLASSE LeadController

// Agora app.js exporta uma função que configura e retorna a instância do Express app
// A instância do DB é passada como argumento para esta função.
module.exports = (dbInstance) => {
  const app = express();

  // Middleware para permitir CORS (Cross-Origin Resource Sharing)
  app.use(cors());

  // Middleware para parsear JSON do corpo das requisições
  app.use(express.json());

  // Instancia o LeadController, passando a instância do banco de dados para ele
  const leadController = new LeadController(dbInstance);

  // Define as rotas para a API de leads
  app.post('/leads', leadController.addLead);
  app.get('/leads', leadController.getLeads);
  app.put('/leads/:id', leadController.updateLead);
  app.delete('/leads/:id', leadController.deleteLead);

  // Rota de teste simples para a raiz da API
  app.get('/', (req, res) => {
    res.send('Lead Manager API is running!');
  });

  return app; // Retorna a instância configurada do Express app
};