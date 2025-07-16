// lead-manager-frontend/src/App.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import LeadForm from './components/LeadForm';
import LeadList from './components/LeadList';
import SearchBar from './components/SearchBar';
import Stats from './components/Stats';
import Toast from './components/Toast';
import { FaSun, FaMoon } from 'react-icons/fa'; // Ícones para sol e lua

function App() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [sortBy, setSortBy] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Novo estado para o modo escuro
  const [darkMode, setDarkMode] = useState(() => {
    // Tenta ler a preferência do localStorage ou verifica a preferência do sistema
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      return JSON.parse(savedMode);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // useEffect para aplicar/remover a classe 'dark' e salvar no localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]); // Roda sempre que darkMode muda

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/leads');
      setLeads(res.data);
      setFilteredLeads(res.data);
    } catch (error) {
      showToast('Erro ao carregar leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addLead = async (lead) => {
    try {
      await axios.post('http://localhost:3000/leads', lead);
      fetchLeads();
      showToast('Lead adicionado com sucesso!');
    } catch (error) {
      showToast('Erro ao adicionar lead', 'error');
    }
  };

  const updateLead = async (id, lead) => {
    try {
      await axios.put(`http://localhost:3000/leads/${id}`, lead);
      fetchLeads();
      showToast('Lead atualizado com sucesso!');
    } catch (error) {
      showToast('Erro ao atualizar lead', 'error');
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este lead?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/leads/${id}`);
      fetchLeads();
      showToast('Lead removido com sucesso!');
    } catch (error) {
      showToast('Erro ao remover lead', 'error');
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = leads.filter(lead => 
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone.includes(searchTerm)
    );
    setFilteredLeads(sortedLeads(filtered, sortBy, sortOrder)); // Garante que a busca também esteja ordenada
  };

  const sortedLeads = (currentLeads, field, order) => {
    return [...currentLeads].sort((a, b) => {
      const aValue = String(a[field]).toLowerCase();
      const bValue = String(b[field]).toLowerCase();
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleSort = (field) => {
    const order = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(order);
    setFilteredLeads(sortedLeads(filteredLeads, field, order));
  };

  useEffect(() => {
    fetchLeads();
  }, []);


  return (
    // Aplica classes de fundo sensíveis ao modo escuro no container principal
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="mx-auto p-6">
        <header className="mb-8 flex justify-between items-center"> {/* Adicionado flex para o botão de toggle */}
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Gerenciador de Leads
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie seus leads de forma eficiente e organizada
            </p>
          </div>
          {/* Botão de Toggle do Modo Escuro */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-300 shadow-md hover:scale-105 transition-transform duration-200"
            title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
          </button>
        </header>

        <Stats leads={leads} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            {/* Adicionado dark:bg-gray-800 e dark:text-gray-100 para o formulário */}
            <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-800 dark:text-gray-100">
              <h2 className="text-xl font-semibold mb-4">Adicionar Novo Lead</h2>
              <LeadForm onAdd={addLead} />
            </div>
          </div>

          <div className="lg:col-span-2">
            {/* Adicionado dark:bg-gray-800 e dark:text-gray-100 para a lista de leads */}
            <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-800 dark:text-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Lista de Leads</h2>
                <SearchBar onSearch={handleSearch} />
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-300"></div>
                </div>
              ) : (
                <LeadList 
                  leads={filteredLeads} 
                  onDelete={deleteLead}
                  onUpdate={updateLead}
                  onSort={handleSort}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              )}
            </div>
          </div>
        </div>

        <Toast toast={toast} />
      </div>
    </div>
  );
}

export default App;

//==============================================//
//                                              //
//  He wears a mask just to cover the raw flesh //
//  -"MF DOOM"                                  //
//                                              //
//==============================================//
