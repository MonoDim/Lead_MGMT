// lead-manager-backend/src/services/LeadService.js

class LeadService {
  constructor(dbInstance) {
    if (!dbInstance) {
      throw new Error("Database instance must be provided to LeadService.");
    }
    this.db = dbInstance;
  }

  /**
   * Adiciona um novo lead ao banco de dados, incluindo seus múltiplos e-mails e telefones.
   * Todas as operações são realizadas dentro de uma transação.
   * @param {object} leadData - Os dados do lead.
   * @param {string} leadData.nome - Nome do lead.
   * @param {string} [leadData.empresa] - Empresa do lead.
   * @param {string} [leadData.origem] - Origem do lead.
   * @param {string} [leadData.observacoes] - Observações sobre o lead.
   * @param {Array<object>} leadData.emails - Lista de objetos de e-mail ({ email: string, is_primary?: boolean }).
   * @param {Array<object>} leadData.telefones - Lista de objetos de telefone ({ phone_number: string, is_whatsapp?: boolean, is_primary?: boolean }).
   * @returns {Promise<number>} O ID do lead recém-criado.
   */
  async addLead(leadData) {
    const { nome, empresa, origem, observacoes, emails, telefones } = leadData;
    const data_cadastro = new Date().toISOString();

    return new Promise((resolve, reject) => {
      // Garante que as operações SQL dentro da transação sejam serializadas (executadas em ordem)
      this.db.serialize(() => {
        // Iniciar Transação
        this.db.run('BEGIN TRANSACTION;', async (err) => {
          if (err) {
            console.error('[LeadService Error] Erro ao iniciar transação no addLead:', err.message);
            return reject(new Error('Erro ao iniciar transação.'));
          }

          let leadId;
          try {
            // 1. Inserir na tabela 'leads'
            leadId = await new Promise((resolveLeadInsert, rejectLeadInsert) => {
              this.db.run(
                `INSERT INTO leads (nome, empresa, origem, observacoes, data_cadastro) VALUES (?, ?, ?, ?, ?)`,
                [nome, empresa, origem, observacoes, data_cadastro],
                function (err) { // Usar 'function' para ter acesso ao 'this.lastID'
                  if (err) return rejectLeadInsert(err);
                  resolveLeadInsert(this.lastID); // Retorna o ID do lead recém-criado
                }
              );
            });

            // 2. Inserir e-mails na tabela 'lead_emails'
            // Usamos prepared statements para melhor performance em loops
            const emailStmt = this.db.prepare(`INSERT INTO lead_emails (lead_id, email, is_primary) VALUES (?, ?, ?)`);
            if (emails && Array.isArray(emails) && emails.length > 0) {
              for (const emailObj of emails) {
                if (emailObj.email && emailObj.email.trim()) {
                  await new Promise((resolveEmailInsert, rejectEmailInsert) => {
                    emailStmt.run(leadId, emailObj.email, emailObj.is_primary ? 1 : 0, (err) => {
                      if (err) return rejectEmailInsert(err);
                      resolveEmailInsert();
                    });
                  });
                }
              }
            }
            emailStmt.finalize(); // Finalizar a declaração preparada

            // 3. Inserir telefones na tabela 'lead_phones'
            const phoneStmt = this.db.prepare(`INSERT INTO lead_phones (lead_id, phone_number, is_whatsapp, is_primary) VALUES (?, ?, ?, ?)`);
            if (telefones && Array.isArray(telefones) && telefones.length > 0) {
              for (const phoneObj of telefones) {
                const cleanedPhoneNumber = (phoneObj.phone_number || '').replace(/\D/g, '');
                if (cleanedPhoneNumber) {
                  await new Promise((resolvePhoneInsert, rejectPhoneInsert) => {
                    phoneStmt.run(leadId, cleanedPhoneNumber, phoneObj.is_whatsapp ? 1 : 0, phoneObj.is_primary ? 1 : 0, (err) => {
                      if (err) return rejectPhoneInsert(err);
                      resolvePhoneInsert();
                    });
                  });
                }
              }
            }
            phoneStmt.finalize(); // Finalizar a declaração preparada

            // Commitar Transação se todas as operações acima foram bem-sucedidas
            this.db.run('COMMIT;', (commitErr) => {
              if (commitErr) {
                console.error('[LeadService Error] Erro ao commitar transação no addLead:', commitErr.message);
                return reject(new Error('Erro ao commitar transação.'));
              }
              resolve(leadId); // Resolve com o ID do lead
            });

          } catch (error) {
            // Reverter Transação em caso de qualquer erro
            this.db.run('ROLLBACK;', (rollbackErr) => {
              if (rollbackErr) console.error('[LeadService Error] Erro ao reverter transação no addLead:', rollbackErr.message);
            });
            console.error('[LeadService Error] Erro durante a transação de addLead:', error.message);
            reject(error); // Rejeita a Promise principal com o erro
          }
        });
      });
    });
  }

  /**
   * Obtém leads do banco de dados, com a opção de filtragem e ordenação.
   * Inclui todos os e-mails e telefones associados a cada lead.
   * @param {string} [q] - Termo de busca para nome, empresa, e-mail ou telefone.
   * @param {string} [sortBy] - Campo para ordenação (ex: 'nome', 'data_cadastro').
   * @param {'asc'|'desc'} [sortOrder] - Ordem da ordenação ('asc' ou 'desc').
   * @returns {Promise<Array<object>>} Uma lista de leads.
   */
  async getLeads(q = '', sortBy = 'data_cadastro', sortOrder = 'desc') {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT
          l.id,
          l.nome,
          l.empresa,
          l.origem,
          l.observacoes,
          l.data_cadastro,
          GROUP_CONCAT(DISTINCT le.id || '::' || le.email || '::' || le.is_primary) AS emails_str,
          GROUP_CONCAT(DISTINCT lp.id || '::' || lp.phone_number || '::' || lp.is_whatsapp || '::' || lp.is_primary) AS phones_str
        FROM leads l
        LEFT JOIN lead_emails le ON l.id = le.lead_id
        LEFT JOIN lead_phones lp ON l.id = lp.lead_id
      `;
      const params = [];
      const conditions = [];

      if (q) {
        const searchTerm = `%${q}%`;
        conditions.push(`
          (
            l.nome LIKE ? OR
            l.empresa LIKE ? OR
            l.origem LIKE ? OR
            le.email LIKE ? OR
            lp.phone_number LIKE ?
          )
        `);
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(' AND ');
      }

      sql += ` GROUP BY l.id`; // Agrupar para consolidar e-mails e telefones

      // Validar sortBy para evitar injeção de SQL
      const validSortColumns = ['nome', 'empresa', 'origem', 'data_cadastro'];
      const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'data_cadastro';
      const finalSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      sql += ` ORDER BY l.${finalSortBy} ${finalSortOrder}`; // Especificar 'l.' para a tabela leads

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('[LeadService Error] Erro ao obter leads com filtros:', err.message);
          return reject(new Error('Falha ao obter leads com filtros.'));
        }

        const leads = rows.map(row => {
          // Reconstruir arrays de e-mails, incluindo o ID
          const emails = row.emails_str
            ? row.emails_str.split(',').map(emailStr => {
                const parts = emailStr.split('::');
                return { id: parseInt(parts[0]), email: parts[1], is_primary: parts[2] === '1' };
              }).sort((a, b) => (b.is_primary - a.is_primary)) // Colocar primário primeiro
            : [];

          // Reconstruir arrays de telefones, incluindo o ID
          const telefones = row.phones_str
            ? row.phones_str.split(',').map(phoneStr => {
                const parts = phoneStr.split('::');
                return {
                  id: parseInt(parts[0]),
                  phone_number: parts[1],
                  is_whatsapp: parts[2] === '1',
                  is_primary: parts[3] === '1'
                };
              }).sort((a, b) => (b.is_primary - a.is_primary)) // Colocar primário primeiro
            : [];

          return {
            id: row.id,
            nome: row.nome,
            empresa: row.empresa,
            origem: row.origem,
            observacoes: row.observacoes,
            data_cadastro: row.data_cadastro,
            emails,
            telefones,
          };
        });
        resolve(leads);
      });
    });
  }

  /**
   * Atualiza um lead existente, incluindo seus e-mails e telefones.
   * Todas as operações são realizadas dentro de uma transação.
   * @param {number} id - O ID do lead a ser atualizado.
   * @param {object} leadData - Os dados atualizados do lead.
   * @param {string} leadData.nome - Nome do lead.
   * @param {string} [leadData.empresa] - Empresa do lead.
   * @param {string} [leadData.origem] - Origem do lead.
   * @param {string} [leadData.observacoes] - Observações sobre o lead.
   * @param {Array<object>} leadData.emails - Lista atualizada de objetos de e-mail ({ id?: number, email: string, is_primary?: boolean }).
   * @param {Array<object>} leadData.telefones - Lista atualizada de objetos de telefone ({ id?: number, phone_number: string, is_whatsapp?: boolean, is_primary?: boolean }).
   * @returns {Promise<boolean>} True se a atualização for bem-sucedida, false caso contrário.
   */
  async updateLead(id, leadData) {
    const { nome, empresa, origem, observacoes, emails, telefones } = leadData;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Inicia uma transação para garantir atomicidade das operações
        this.db.run("BEGIN TRANSACTION;", async (err) => {
          if (err) {
            console.error('[LeadService Error] Erro ao iniciar transação no updateLead:', err.message);
            return reject(new Error('Erro ao iniciar transação.'));
          }

          try {
            // 1. Atualizar dados principais do lead
            const updateLeadResult = await new Promise((resolveUpdate, rejectUpdate) => {
              this.db.run(
                `UPDATE leads SET nome = ?, empresa = ?, origem = ?, observacoes = ? WHERE id = ?`,
                [nome, empresa, origem, observacoes, id],
                function (err) {
                  if (err) return rejectUpdate(err);
                  resolveUpdate(this.changes > 0); // Retorna true se houver mudanças, false caso contrário
                }
              );
            });

            if (!updateLeadResult) { // Se o lead principal não foi encontrado/atualizado
              throw new Error('Lead principal não encontrado para atualização.');
            }

            // 2. Gerenciar e-mails: Deletar os antigos e inserir os novos/atualizar existentes
            // Pegar os IDs dos e-mails que estão chegando para o update (se tiverem ID)
            const incomingEmailIds = emails.filter(e => e.id).map(e => e.id);

            // Deletar e-mails que não estão mais na lista de entrada
            await new Promise((resolveDeleteEmails, rejectDeleteEmails) => {
              this.db.all(`SELECT id FROM lead_emails WHERE lead_id = ?`, [id], (err, existingEmails) => {
                if (err) return rejectDeleteEmails(err);
                const emailsToRemove = existingEmails
                  .map(e => e.id)
                  .filter(existingId => !incomingEmailIds.includes(existingId));

                if (emailsToRemove.length > 0) {
                  const placeholders = emailsToRemove.map(() => '?').join(',');
                  this.db.run(`DELETE FROM lead_emails WHERE id IN (${placeholders})`, emailsToRemove, (deleteErr) => {
                    if (deleteErr) return rejectDeleteEmails(deleteErr);
                    resolveDeleteEmails();
                  });
                } else {
                  resolveDeleteEmails();
                }
              });
            });

            // Inserir novos e-mails ou atualizar existentes
            const emailStmtInsert = this.db.prepare(`INSERT INTO lead_emails (lead_id, email, is_primary) VALUES (?, ?, ?)`);
            const emailStmtUpdate = this.db.prepare(`UPDATE lead_emails SET email = ?, is_primary = ? WHERE id = ? AND lead_id = ?`);

            for (const emailObj of emails) {
              if (emailObj.email && emailObj.email.trim()) {
                if (emailObj.id) {
                  // Atualizar existente
                  await new Promise((resolveUpdateEmail, rejectUpdateEmail) => {
                    emailStmtUpdate.run(emailObj.email, emailObj.is_primary ? 1 : 0, emailObj.id, id, (err) => {
                      if (err) return rejectUpdateEmail(err);
                      resolveUpdateEmail();
                    });
                  });
                } else {
                  // Adicionar novo
                  await new Promise((resolveInsertEmail, rejectInsertEmail) => {
                    emailStmtInsert.run(id, emailObj.email, emailObj.is_primary ? 1 : 0, (err) => {
                      if (err) return rejectInsertEmail(err);
                      resolveInsertEmail();
                    });
                  });
                }
              }
            }
            emailStmtInsert.finalize();
            emailStmtUpdate.finalize();

            // 3. Gerenciar telefones: Deletar os antigos e inserir os novos/atualizar existentes (lógica similar aos e-mails)
            const incomingPhoneIds = telefones.filter(p => p.id).map(p => p.id);

            // Deletar telefones que não estão mais na lista de entrada
            await new Promise((resolveDeletePhones, rejectDeletePhones) => {
              this.db.all(`SELECT id FROM lead_phones WHERE lead_id = ?`, [id], (err, existingPhones) => {
                if (err) return rejectDeletePhones(err);
                const phonesToRemove = existingPhones
                  .map(p => p.id)
                  .filter(existingId => !incomingPhoneIds.includes(existingId));

                if (phonesToRemove.length > 0) {
                  const placeholders = phonesToRemove.map(() => '?').join(',');
                  this.db.run(`DELETE FROM lead_phones WHERE id IN (${placeholders})`, phonesToRemove, (deleteErr) => {
                    if (deleteErr) return rejectDeletePhones(deleteErr);
                    resolveDeletePhones();
                  });
                } else {
                  resolveDeletePhones();
                }
              });
            });

            // Inserir novos telefones ou atualizar existentes
            const phoneStmtInsert = this.db.prepare(`INSERT INTO lead_phones (lead_id, phone_number, is_whatsapp, is_primary) VALUES (?, ?, ?, ?)`);
            const phoneStmtUpdate = this.db.prepare(`UPDATE lead_phones SET phone_number = ?, is_whatsapp = ?, is_primary = ? WHERE id = ? AND lead_id = ?`);

            for (const telObj of telefones) {
              const cleanedPhoneNumber = (telObj.phone_number || '').replace(/\D/g, '');
              if (cleanedPhoneNumber) {
                if (telObj.id) {
                  // Atualizar existente
                  await new Promise((resolveUpdatePhone, rejectUpdatePhone) => {
                    phoneStmtUpdate.run(cleanedPhoneNumber, telObj.is_whatsapp ? 1 : 0, telObj.is_primary ? 1 : 0, telObj.id, id, (err) => {
                      if (err) return rejectUpdatePhone(err);
                      resolveUpdatePhone();
                    });
                  });
                } else {
                  // Adicionar novo
                  await new Promise((resolveInsertPhone, rejectInsertPhone) => {
                    phoneStmtInsert.run(id, cleanedPhoneNumber, telObj.is_whatsapp ? 1 : 0, telObj.is_primary ? 1 : 0, (err) => {
                      if (err) return rejectInsertPhone(err);
                      resolveInsertPhone();
                    });
                  });
                }
              }
            }
            phoneStmtInsert.finalize();
            phoneStmtUpdate.finalize();

            // Commitar Transação
            this.db.run("COMMIT;", (commitErr) => {
              if (commitErr) {
                console.error('[LeadService Error] Erro ao comitar transação de atualização:', commitErr.message);
                return reject(new Error('Falha ao finalizar atualização.'));
              }
              resolve(true);
            });

          } catch (error) {
            // Reverter Transação em caso de erro
            this.db.run('ROLLBACK;', (rollbackErr) => {
              if (rollbackErr) console.error('[LeadService Error] Erro ao reverter transação no updateLead:', rollbackErr.message);
            });
            console.error('[LeadService Error] Erro durante a transação de updateLead:', error.message);
            reject(error);
          }
        });
      });
    });
  }

  /**
   * Deleta um lead pelo seu ID.
   * Devido ao FOREIGN KEY ON DELETE CASCADE, os e-mails e telefones associados também serão removidos.
   * @param {number} id - O ID do lead a ser deletado.
   * @returns {Promise<boolean>} True se a deleção for bem-sucedida, false caso contrário.
   */
  async deleteLead(id) {
    return new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM leads WHERE id = ?`, [id], function (err) {
        if (err) {
          console.error('[LeadService Error] Erro ao deletar lead:', err.message);
          return reject(new Error('Falha ao deletar lead.'));
        }
        resolve(this.changes > 0); // Retorna true se alguma linha foi afetada (deletada)
      });
    });
  }
}

// O módulo agora exporta a CLASSE LeadService, não uma instância.
module.exports = LeadService;