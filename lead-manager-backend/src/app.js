// lead-manager-backend/src/app.js

const express = require('express');
const cors = require('cors');
// Não importe mais LeadController diretamente aqui, pois ele será instanciado em leadRoutes.js
const configureLeadRoutes = require('./routes/leadRoutes'); // Importa a FUNÇÃO que configura as rotas

module.exports = (dbInstance) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Use o roteador de leads, passando a instância do banco de dados para a função de configuração das rotas.
  // Isso garante que o LeadController dentro de leadRoutes.js seja instanciado corretamente.
  app.use('/leads', configureLeadRoutes(dbInstance));

  // Rota de teste simples para a raiz da API
  app.get('/', (req, res) => {
    res.send('Lead Manager API is running!');
  });

  return app;
};