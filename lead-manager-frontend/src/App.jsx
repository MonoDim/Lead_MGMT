// lead-manager-frontend/src/App.jsx

import { useState, useEffect } from 'react';
import LeadForm from './components/LeadForm';
import LeadList from './components/LeadList';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaMoon, FaSun } from 'react-icons/fa'; // Ícones para tema

function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc');
  // Novo estado para o lead sendo editado
  const [editingLead, setEditingLead] = useState(null); // Armazena o lead a ser editado
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, sortBy, sortOrder]); // Re-fetch ao mudar termos de busca/ordenação

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);


  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/leads?q=${searchTerm}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLeads(data);
      toast.success('Leads carregados com sucesso!', { autoClose: 1000 });
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      toast.error('Erro ao carregar leads. Tente novamente.', { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (formData) => {
    try {
      // O LeadForm já retorna os dados no formato esperado (com arrays de emails e telefones)
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar lead.');
      }
      toast.success('Lead adicionado com sucesso!');
      fetchLeads(); // Atualiza a lista
    } catch (error) {
      console.error('Erro ao adicionar lead:', error);
      toast.error(`Erro ao adicionar lead: ${error.message}`);
    }
  };

  // Função para lidar com a edição de um lead (preenche o formulário)
  const handleEditLead = (lead) => {
    setEditingLead(lead); // Define o lead a ser editado
    // O LeadForm precisará de um prop `initialData` para preencher o formulário
    // com os dados de `editingLead`. Isso será abordado no próximo passo do LeadForm.
  };

  // Função para lidar com a atualização de um lead existente
  const handleUpdateLead = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar lead.');
      }
      toast.success('Lead atualizado com sucesso!');
      setEditingLead(null); // Sai do modo de edição
      fetchLeads(); // Atualiza a lista
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast.error(`Erro ao atualizar lead: ${error.message}`);
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este lead?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao deletar lead.');
        }
        toast.success('Lead deletado com sucesso!');
        fetchLeads(); // Atualiza a lista
      } catch (error) {
        console.error('Erro ao deletar lead:', error);
        toast.error(`Erro ao deletar lead: ${error.message}`);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <header className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciador de Leads</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-blue-700 dark:bg-blue-900 hover:bg-blue-800 dark:hover:bg-blue-700 transition-colors"
          title="Alternar Tema"
        >
          {theme === 'dark' ? <FaSun className="text-yellow-400 text-xl" /> : <FaMoon className="text-gray-200 text-xl" />}
        </button>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <div className="flex space-x-2 w-full md:w-2/3 justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="nome">Nome</option>
              <option value="data_cadastro">Data de Cadastro</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
            {editingLead && (
                <button
                    onClick={() => setEditingLead(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancelar Edição
                </button>
            )}
          </div>
        </div>

        {/* Renderiza LeadForm, passando o lead a ser editado ou null para um novo */}
        <LeadForm onAdd={editingLead ? (data) => handleUpdateLead(editingLead.id, data) : handleAddLead} initialData={editingLead} />

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400 text-lg">Carregando leads...</p>
        ) : (
          <LeadList leads={leads} onEdit={handleEditLead} onDelete={handleDeleteLead} />
        )}
      </main>
    </div>
  );
}

export default App;