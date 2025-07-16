// lead-manager-backend/src/routes/leadRoutes.js

const express = require('express');
const LeadController = require('../controllers/LeadController');
const router = express.Router();

router.post('/', LeadController.createLead);

// Agora, a rota GET / apenas chama listLeads.
// listLeads no controller é inteligente o suficiente para lidar com query parameters como 'q', 'hasEmail', etc.
router.get('/', LeadController.listLeads);

router.put('/:id', LeadController.updateLead);
router.delete('/:id', LeadController.deleteLead);

module.exports = router;