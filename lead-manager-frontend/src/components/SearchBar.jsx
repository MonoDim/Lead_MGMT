// lead-manager-frontend/src/components/SearchBar.jsx

import { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa'; // Importando ícones de lupa e "X"

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        placeholder="Buscar por nome ou telefone..."
        value={searchTerm}
        onChange={handleChange}
        // Aplicando classes de modo escuro ao input de busca
        className="w-full sm:w-64 md:w-80 border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2
                   border-gray-300 dark:border-gray-600
                   focus:ring-blue-500 dark:focus:ring-blue-400
                   bg-white dark:bg-gray-700
                   text-gray-900 dark:text-gray-100
                   placeholder-gray-400 dark:placeholder-gray-500
                   transition-all duration-200"
      />
      <div className="absolute right-3 cursor-pointer">
        {searchTerm ? (
          <button
            onClick={handleClear}
            // Cores do botão "X" para modo escuro
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                       p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            aria-label="Limpar pesquisa"
          >
            <FaTimes className="text-lg" />
          </button>
        ) : (
          <span
            // Cores do ícone de lupa para modo escuro
            className="text-gray-400 dark:text-gray-500"
          >
            <FaSearch className="text-lg" />
          </span>
        )}
      </div>
    </div>
  );
}

export default SearchBar;