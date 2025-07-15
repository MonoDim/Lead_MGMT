const db = require('../database/db');
const Lead = require('../models/Lead');

class LeadService {
  static addLead(lead, callback) {
    const query = `
      INSERT INTO leads (
        nome, telefone, email, empresa, origem, observacoes, data_cadastro
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      lead.nome,
      lead.telefone,
      lead.email,
      lead.empresa,
      lead.origem,
      lead.observacoes,
      lead.data_cadastro
    ];

    db.run(query, params, function (err) {
      callback(err, this?.lastID);
    });
  }

  static getAllLeads(callback) {
    db.all(`SELECT * FROM leads ORDER BY id DESC`, [], (err, rows) => {
      callback(err, rows);
    });
  }

  static deleteLead(id, callback) {
    db.run(`DELETE FROM leads WHERE id = ?`, [id], function (err) {
      callback(err, this?.changes);
    });
  }
}

module.exports = LeadService;
