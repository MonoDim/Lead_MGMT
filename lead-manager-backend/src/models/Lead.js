class Lead {
  constructor(nome, telefone, observacoes, data_cadastro = new Date().toISOString()) {
    this.nome = nome;
    this.telefone = telefone;
    this.observacoes = observacoes;
    this.data_cadastro = data_cadastro;
  }
}

module.exports = Lead;
