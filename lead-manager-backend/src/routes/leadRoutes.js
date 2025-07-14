const express = require('express');
const LeadController = require('../controllers/LeadController');
const router = express.Router();

router.post('/', LeadController.createLead);
router.get('/', LeadController.listLeads);
router.delete('/:id', LeadController.deleteLead);

module.exports = router;
