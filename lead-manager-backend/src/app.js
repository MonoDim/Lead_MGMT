// lead-manager-backend/src/app.js

const express = require('express');
const cors = require('cors');
const leadRoutes = require('./routes/leadRoutes');

const app = express();

// Middlewares
app.use(cors()); // Permite requisições de origens diferentes (importante para o frontend)
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Rotas da API
app.use('/leads', leadRoutes); // Monta as rotas de leads sob o prefixo /leads

// Middleware de tratamento de erros (opcional, mas recomendado para erros não capturados)
app.use((err, req, res, next) => {
  console.error('[App Error Handler]', err.stack);
  res.status(500).json({ message: 'Algo deu errado no servidor!' });
});

module.exports = app; // Exporta a instância do aplicativo Express