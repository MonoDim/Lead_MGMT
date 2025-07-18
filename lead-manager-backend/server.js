// lead-manager-backend/server.js

require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// Importa a FUNÇÃO que configura e retorna a instância do aplicativo Express
const configureApp = require('./src/app');
// Importa a função de conexão do banco de dados
const { connectDb } = require('./src/database/db');

const PORT = process.env.PORT || 3001; // Define a porta do servidor (mudei para 3001 para evitar conflito com o frontend padrão)

/**
 * Função assíncrona para iniciar a aplicação.
 * Garante que o banco de dados esteja conectado antes de iniciar o servidor HTTP.
 */
async function startServer() {
  let dbInstance; // Declare a variável para a instância do banco de dados
  try {
    // 1. Tenta conectar ao banco de dados e obter a instância
    dbInstance = await connectDb();

    // 2. Configura o aplicativo Express, passando a instância do banco de dados
    const app = configureApp(dbInstance); // <-- AQUI ESTÁ A MUDANÇA CHAVE: Chame a função para obter a instância 'app'

    // 3. Se a conexão e configuração forem bem-sucedidas, inicia o servidor Express
    app.listen(PORT, () => {
      console.log(`[Server Success] Servidor rodando na porta ${PORT}`);
      console.log(`[Server Info] Acesse a API em: http://localhost:${PORT}/leads`);
    });
  } catch (error) {
    // Se a conexão ao banco de dados ou a configuração do app falhar, loga o erro e encerra o processo
    console.error('[Server Error] Falha ao iniciar o servidor:', error.message);
    process.exit(1); // Encerra o processo com código de erro
  }
}

// Chama a função para iniciar o servidor
startServer();