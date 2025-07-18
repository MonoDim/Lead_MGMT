// lead-manager-backend/src/services/LeadService.js

class LeadService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Adiciona um novo lead, seus e-mails e telefones ao banco de dados em uma transação.
   * @param {object} leadData - Dados do lead, incluindo arrays de emails e telefones.
   * @returns {Promise<number>} O ID do lead recém-adicionado.
   */
  async addLead(leadData) {
    const { nome, empresa, origem, observacoes, emails, telefones } = leadData;
    const dataCadastro = new Date().toISOString();
    const db = this.db; // Captura a instância do DB para garantir o contexto correto

    console.log('[DEBUG] addLead iniciado com leadData:', leadData);
    console.log('[DEBUG] Dados do Lead Principal:', { nome, empresa, origem, observacoes });
    console.log('[DEBUG] Emails recebidos:', emails);
    console.log('[DEBUG] Telefones recebidos:', telefones);

    return new Promise((resolve, reject) => {
      // Usa db.serialize para garantir que as operações SQL dentro dele sejam executadas em ordem
      db.serialize(() => {
        // Inicia a transação
        db.run("BEGIN TRANSACTION;", async function(err) {
          if (err) {
            console.error('[LeadService Error] Erro ao iniciar transação:', err.message);
            return reject(new Error('Falha ao iniciar transação.'));
          }
          console.log('[DEBUG] Transação iniciada.');

          try {
            // 1. Insere o lead principal
            const insertLeadSql = `INSERT INTO leads (nome, empresa, origem, observacoes, data_cadastro) VALUES (?, ?, ?, ?, ?)`;
            console.log('[DEBUG] Tentando inserir lead principal com SQL:', insertLeadSql);
            console.log('[DEBUG] Parâmetros do lead principal:', [nome, empresa, origem, observacoes, dataCadastro]);

            const leadId = await new Promise((res, rej) => {
              // Usamos db.run e o 'this' no callback se refere ao Statement object
              db.run(insertLeadSql, [nome, empresa, origem, observacoes, dataCadastro], function(leadErr) {
                if (leadErr) {
                  console.error('[LeadService Error] Erro ao inserir lead principal:', leadErr.message);
                  return rej(leadErr);
                }
                console.log('[DEBUG] Lead principal inserido. lastID:', this.lastID);
                res(this.lastID); // 'this.lastID' é a forma correta de obter o ID da última inserção
              });
            });

            // 2. Insere os e-mails (se houver e não estiverem vazios)
            const insertEmailSql = `INSERT INTO lead_emails (lead_id, email, is_primary) VALUES (?, ?, ?)`;
            for (const emailObj of emails) {
              // Filtra emails vazios que podem ter passado pelo frontend
              if (emailObj.email.trim() === '') {
                console.log('[DEBUG] Ignorando email vazio.');
                continue;
              }
              console.log('[DEBUG] Tentando inserir email:', emailObj.email);
              await new Promise((res, rej) => {
                db.run(insertEmailSql, [leadId, emailObj.email, emailObj.is_primary ? 1 : 0], function(emailErr) {
                  if (emailErr) {
                    console.error('[LeadService Error] Erro ao inserir email:', emailErr.message);
                    return rej(emailErr);
                  }
                  console.log('[DEBUG] Email inserido com sucesso.');
                  res();
                });
              });
            }

            // 3. Insere os telefones (se houver e não estiverem vazios)
            const insertPhoneSql = `INSERT INTO lead_phones (lead_id, phone_number, is_whatsapp, is_primary) VALUES (?, ?, ?, ?)`;
            for (const phoneObj of telefones) {
              // Filtra telefones vazios que podem ter passado pelo frontend
              if (phoneObj.phone_number.replace(/\D/g, '').trim() === '') {
                console.log('[DEBUG] Ignorando telefone vazio.');
                continue;
              }
              console.log('[DEBUG] Tentando inserir telefone:', phoneObj.phone_number);
              await new Promise((res, rej) => {
                db.run(insertPhoneSql, [leadId, phoneObj.phone_number, phoneObj.is_whatsapp ? 1 : 0, phoneObj.is_primary ? 1 : 0], function(phoneErr) {
                  if (phoneErr) {
                    console.error('[LeadService Error] Erro ao inserir telefone:', phoneErr.message);
                    return rej(phoneErr);
                  }
                  console.log('[DEBUG] Telefone inserido com sucesso.');
                  res();
                });
              });
            }

            // 4. Commita a transação se tudo deu certo
            console.log('[DEBUG] Tentando commitar transação.');
            db.run("COMMIT;", function(commitErr) {
              if (commitErr) {
                console.error('[LeadService Error] Erro ao commitar transação:', commitErr.message);
                return reject(new Error('Falha ao commitar transação.'));
              }
              console.log('[DEBUG] Transação commitada com sucesso. Lead ID:', leadId);
              resolve(leadId); // Retorna o ID do lead principal
            });

          } catch (error) {
            // Em caso de qualquer erro em qualquer etapa, faz o rollback
            console.error('[LeadService Error] Erro capturado no try/catch principal:', error.message);
            db.run("ROLLBACK;", function(rollbackErr) { // Usa db.run diretamente aqui
              if (rollbackErr) {
                console.error('[LeadService Error] Erro ao fazer rollback:', rollbackErr.message);
              }
              console.log('[DEBUG] Rollback concluído.');
              reject(error); // Rejeita a Promise com o erro original
            });
          }
        }); // Sem .bind(this) aqui, pois estamos usando a variável 'db'
      });
    });
  }

  /**
   * Obtém leads com base em um termo de busca e critérios de ordenação.
   * Inclui e-mails e telefones associados a cada lead.
   * @param {string} q - Termo de busca opcional.
   * @param {string} sortBy - Campo para ordenar.
   * @param {string} sortOrder - Ordem da ordenação ('asc' ou 'desc').
   * @returns {Promise<Array<object>>} Uma lista de leads com seus e-mails e telefones.
   */
  async getLeads(q = '', sortBy = 'nome', sortOrder = 'asc') {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT
          l.id,
          l.nome,
          l.empresa,
          l.origem,
          l.observacoes,
          l.data_cadastro
        FROM leads l
      `;
      let params = [];

      if (q) {
        query += ` WHERE l.nome LIKE ? OR l.empresa LIKE ? OR l.origem LIKE ? OR l.observacoes LIKE ?`;
        params = [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`];
      }

      // Adiciona ordenação
      query += ` ORDER BY l.${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;

      this.db.all(query, params, async (err, leads) => {
        if (err) {
          console.error('[LeadService Error] Erro ao obter leads com filtros:', err.message);
          return reject(new Error('Falha ao obter leads com filtros.'));
        }

        // Para cada lead, buscar seus e-mails e telefones
        const leadsWithContacts = await Promise.all(leads.map(async lead => {
          const emails = await new Promise((res, rej) => {
            this.db.all(`SELECT id, email, is_primary FROM lead_emails WHERE lead_id = ?`, [lead.id], (emailErr, rows) => {
              if (emailErr) rej(emailErr);
              else res(rows.map(row => ({ ...row, is_primary: !!row.is_primary }))); // Converte 0/1 para boolean
            });
          });

          const phones = await new Promise((res, rej) => {
            this.db.all(`SELECT id, phone_number, is_whatsapp, is_primary FROM lead_phones WHERE lead_id = ?`, [lead.id], (phoneErr, rows) => {
              if (phoneErr) rej(phoneErr);
              else res(rows.map(row => ({ ...row, is_whatsapp: !!row.is_whatsapp, is_primary: !!row.is_primary }))); // Converte 0/1 para boolean
            });
          });

          return { ...lead, emails, telefones: phones };
        }));

        resolve(leadsWithContacts);
      });
    });
  }

  /**
   * Atualiza um lead existente, seus e-mails e telefones.
   * Implementa uma transação para garantir a consistência.
   * @param {number} id - O ID do lead a ser atualizado.
   * @param {object} leadData - Novos dados do lead.
   * @returns {Promise<boolean>} True se o lead foi atualizado, False caso contrário.
   */
  async updateLead(id, leadData) {
    const { nome, empresa, origem, observacoes, emails, telefones } = leadData;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("BEGIN TRANSACTION;");

        // Atualiza o lead principal
        const updateLeadSql = `UPDATE leads SET nome = ?, empresa = ?, origem = ?, observacoes = ? WHERE id = ?`;
        this.db.run(updateLeadSql, [nome, empresa, origem, observacoes, id], async (err) => {
          if (err) {
            console.error('[LeadService Error] Erro ao atualizar lead principal:', err.message);
            this.db.run("ROLLBACK;");
            return reject(new Error('Falha ao atualizar lead principal.'));
          }

          // Deleta e reinsere e-mails
          const deleteEmailsSql = `DELETE FROM lead_emails WHERE lead_id = ?`;
          this.db.run(deleteEmailsSql, [id], async (deleteErr) => {
            if (deleteErr) {
              console.error('[LeadService Error] Erro ao deletar emails antigos:', deleteErr.message);
              this.db.run("ROLLBACK;");
              return reject(new Error('Falha ao deletar emails antigos.'));
            }

            const insertEmailSql = `INSERT INTO lead_emails (lead_id, email, is_primary) VALUES (?, ?, ?)`;
            let emailPromises = emails.map(emailObj => {
              return new Promise((res, rej) => {
                this.db.run(insertEmailSql, [id, emailObj.email, emailObj.is_primary ? 1 : 0], (emailErr) => {
                  if (emailErr) rej(emailErr);
                  else res();
                });
              });
            });

            // Deleta e reinsere telefones
            const deletePhonesSql = `DELETE FROM lead_phones WHERE lead_id = ?`;
            this.db.run(deletePhonesSql, [id], async (deleteErr) => {
              if (deleteErr) {
                console.error('[LeadService Error] Erro ao deletar telefones antigos:', deleteErr.message);
                this.db.run("ROLLBACK;");
                return reject(new Error('Falha ao deletar telefones antigos.'));
              }

              const insertPhoneSql = `INSERT INTO lead_phones (lead_id, phone_number, is_whatsapp, is_primary) VALUES (?, ?, ?, ?)`;
              let phonePromises = telefones.map(phoneObj => {
                return new Promise((res, rej) => {
                  this.db.run(insertPhoneSql, [id, phoneObj.phone_number, phoneObj.is_whatsapp ? 1 : 0, phoneObj.is_primary ? 1 : 0], (phoneErr) => {
                    if (phoneErr) rej(phoneErr);
                    else res();
                  });
                });
              });

              // Espera todas as operações de e-mail e telefone
              Promise.all([...emailPromises, ...phonePromises])
                .then(() => {
                  this.db.run("COMMIT;", (commitErr) => {
                    if (commitErr) {
                      console.error('[LeadService Error] Erro ao commitar transação de atualização:', commitErr.message);
                      return reject(new Error('Falha ao commitar transação de atualização.'));
                    }
                    resolve(true); // Retorna true para indicar sucesso
                  });
                })
                .catch(allErr => {
                  console.error('[LeadService Error] Erro durante a atualização de e-mails/telefones, rollback:', allErr.message);
                  this.db.run("ROLLBACK;");
                  reject(allErr);
                });
            });
          });
        });
      });
    });
  }

  /**
   * Deleta um lead e seus contatos associados.
   * Devido a ON DELETE CASCADE, os e-mails e telefones serão deletados automaticamente.
   * @param {number} id - O ID do lead a ser deletado.
   * @returns {Promise<boolean>} True se o lead foi deletado, False caso contrário.
   */
  async deleteLead(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM leads WHERE id = ?`;
      this.db.run(sql, [id], function(err) { // 'this' aqui se refere ao Statement object
        if (err) {
          console.error('[LeadService Error] Erro ao deletar lead:', err.message);
          return reject(new Error('Falha ao deletar lead.'));
        }
        // NOVO LOG DE DEBUG: Verifique o valor de this.changes
        console.log(`[DEBUG] deleteLead - ID: ${id}, Linhas afetadas (this.changes): ${this.changes}`);

        // AQUI ESTÁ O PONTO CHAVE:
        // Se this.changes for 0, o LeadController interpreta como "não encontrado".
        // Vamos confirmar o valor de this.changes.
        resolve(this.changes > 0);
      });
    });
  }
}

module.exports = LeadService;