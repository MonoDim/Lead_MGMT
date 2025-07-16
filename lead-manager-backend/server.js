// lead-manager-backend/server.js

require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

const app = require('./src/app'); // Importa a instância do aplicativo Express
const { connectDb } = require('./src/database/db'); // Importa a função de conexão do banco de dados

const PORT = process.env.PORT || 3000; // Define a porta do servidor

/**
 * Função assíncrona para iniciar a aplicação.
 * Garante que o banco de dados esteja conectado antes de iniciar o servidor HTTP.
 */
async function startServer() {
  try {
    // Tenta conectar ao banco de dados
    await connectDb();
    
    // Se a conexão for bem-sucedida, inicia o servidor Express
    app.listen(PORT, () => {
      console.log(`[Server Success] Servidor rodando na porta ${PORT}`);
      console.log(`[Server Info] Acesse a API em: http://localhost:${PORT}/leads`);
    });
  } catch (error) {
    // Se a conexão ao banco de dados falhar, loga o erro e encerra o processo
    console.error('[Server Error] Falha ao iniciar o servidor devido a erro no banco de dados:', error.message);
    process.exit(1); // Encerra o processo com código de erro
  }
}

// Chama a função para iniciar o servidor
startServer();