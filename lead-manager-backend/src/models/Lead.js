class Lead {
  constructor(nome, telefone, email, empresa, origem, observacoes, data_cadastro = new Date().toISOString()) {
    this.nome = nome;
    this.telefone = telefone;
    this.email = email;
    this.empresa = empresa;
    this.origem = origem;
    this.observacoes = observacoes;
    this.data_cadastro = data_cadastro;
  }
}

module.exports = Lead;
