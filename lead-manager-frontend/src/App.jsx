// lead-manager-frontend/src/App.jsx

import { useEffect, useState, useCallback } from 'react'; // Adicionado useCallback
import axios from 'axios';
import LeadForm from './components/LeadForm';
import LeadList from './components/LeadList';
import SearchBar from './components/SearchBar';
import Stats from './components/Stats';
import Toast from './components/Toast';
import { FaSun, FaMoon } from 'react-icons/fa';

function App() {
  const [leads, setLeads] = useState([]); // Todos os leads puros do backend (mantido para stats)
  const [filteredLeads, setFilteredLeads] = useState([]); // Leads atualmente exibidos na lista (após search/filter)
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [sortBy, setSortBy] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc');

  // Novo estado para o filtro de estatísticas
  // Ex: { type: 'origem', value: 'LinkedIn' }
  // Ex: { type: 'email', value: true }
  // Ex: { type: 'empresa', value: true }
  // Ex: { type: 'none' } ou null para nenhum filtro
  const [statsFilter, setStatsFilter] = useState(null); 
  
  // Novo estado para o termo de busca da SearchBar
  const [searchTerm, setSearchTerm] = useState('');

  // Modo escuro (mantido como está)
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      return JSON.parse(savedMode);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Funções de ordenação (mantidas, mas aplicadas no cliente após o filtro/busca do backend)
  const sortedLeads = (currentLeads, field, order) => {
    return [...currentLeads].sort((a, b) => {
      const aValue = String(a[field] || '').toLowerCase(); // Garante string para null/undefined
      const bValue = String(b[field] || '').toLowerCase(); // Garante string para null/undefined
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  };

  const handleSort = (field) => {
    const order = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(order);
    // Aplica a ordenação na lista já filtrada/buscada
    setFilteredLeads(sortedLeads(filteredLeads, field, order));
  };

  // Função para buscar leads do backend com filtros e termo de busca
  // Usamos useCallback para memorizar a função e evitar recriações desnecessárias
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:3000/leads';
      const params = new URLSearchParams(); // Para construir a query string

      // Lógica de filtro da SearchBar (prioridade mais alta)
      if (searchTerm) {
        params.append('q', searchTerm);
        // Ao aplicar busca por texto, resetamos o filtro de estatística
        // para evitar comportamento ambíguo.
        if (statsFilter) setStatsFilter(null); 
      } 
      // Lógica de filtro de estatísticas (apenas se não houver searchTerm)
      else if (statsFilter) {
        if (statsFilter.type === 'origem') {
          params.append('origem', statsFilter.value);
        } else if (statsFilter.type === 'email' && statsFilter.value === true) {
          params.append('hasEmail', 'true');
        } else if (statsFilter.type === 'empresa' && statsFilter.value === true) {
          params.append('hasCompany', 'true');
        }
        // Para "Total de Leads" e "Principal Origem" sem valor específico,
        // não precisamos adicionar parâmetros.
      }

      // Constrói a URL final com os parâmetros
      if (params.toString()) {
        url = `${url}?${params.toString()}`;
      }

      const res = await axios.get(url);
      setLeads(res.data); // Guarda a lista completa (ou o resultado do filtro/busca do backend)
      
      // Aplica ordenação aqui, pois o filtro/busca vem do backend
      setFilteredLeads(sortedLeads(res.data, sortBy, sortOrder));

    } catch (error) {
      showToast('Erro ao carregar leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statsFilter, sortBy, sortOrder]); // Dependências do useCallback

  // Funções CRUD (mantidas, mas com chamadas a fetchLeads sem parâmetros)
  const addLead = async (lead) => {
    try {
      await axios.post('http://localhost:3000/leads', lead);
      showToast('Lead adicionado com sucesso!');
      fetchLeads(); // Recarrega com os filtros/busca atuais
    } catch (error) {
      showToast('Erro ao adicionar lead', 'error');
    }
  };

  const updateLead = async (id, lead) => {
    try {
      await axios.put(`http://localhost:3000/leads/${id}`, lead);
      showToast('Lead atualizado com sucesso!');
      fetchLeads(); // Recarrega com os filtros/busca atuais
    } catch (error) {
      showToast('Erro ao atualizar lead', 'error');
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este lead?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/leads/${id}`);
      showToast('Lead removido com sucesso!');
      fetchLeads(); // Recarrega com os filtros/busca atuais
    } catch (error) {
      showToast('Erro ao remover lead', 'error');
    }
  };

  // Handler para a SearchBar
  const handleSearch = (term) => {
    setSearchTerm(term); // Atualiza o termo de busca
    // O useEffect acionará fetchLeads quando searchTerm mudar
    // Limpar o filtro de estatística é tratado dentro de fetchLeads
  };

  // Handler para cliques nos cards de estatísticas
  const handleStatsFilter = (filterType, filterValue = null) => {
    if (statsFilter && statsFilter.type === filterType && statsFilter.value === filterValue) {
      // Se clicar no mesmo filtro novamente, desativa
      setStatsFilter(null);
    } else {
      setStatsFilter({ type: filterType, value: filterValue });
    }
    // Ao aplicar um filtro de estatística, limpa o termo de busca da SearchBar
    // para evitar conflitos visuais e lógicos.
    setSearchTerm(''); 
  };


  // useEffect para carregar leads na montagem e sempre que filtros/busca mudarem
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]); // Dependência do useCallback

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="mx-auto p-6">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Gerenciador de Leads
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie seus leads de forma eficiente e organizada
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-300 shadow-md hover:scale-105 transition-transform duration-200"
            title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
          </button>
        </header>

        {/* Passa a função handleStatsFilter para o componente Stats */}
        <Stats leads={leads} onFilterClick={handleStatsFilter} activeFilter={statsFilter} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-800 dark:text-gray-100">
              <h2 className="text-xl font-semibold mb-4">Adicionar Novo Lead</h2>
              <LeadForm onAdd={addLead} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-800 dark:text-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Lista de Leads</h2>
                {/* Passa searchTerm e setSearchTerm para SearchBar para controle externo */}
                <SearchBar onSearch={handleSearch} searchTerm={searchTerm} /> 
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