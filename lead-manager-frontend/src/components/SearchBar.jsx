import { useState } from 'react';

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
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar por nome ou telefone..."
        value={searchTerm}
        onChange={handleChange}
        className="w-64 border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="absolute right-2 top-2">
        {searchTerm ? (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        ) : (
          <span className="text-gray-400">🔍</span>
        )}
      </div>
    </div>
  );
}

export default SearchBar;