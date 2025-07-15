import { useState } from 'react';

function LeadList({ leads, onDelete, onUpdate, onSort, sortBy, sortOrder }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (lead) => {
    setEditingId(lead.id);
    setEditData(lead);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = () => {
    onUpdate(editingId, editData);
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const formatTelefone = (value) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getOrigemColor = (origem) => {
    const colors = {
      'Site': 'bg-blue-100 text-blue-800',
      'Redes Sociais': 'bg-purple-100 text-purple-800',
      'Indicação': 'bg-green-100 text-green-800',
      'Google Ads': 'bg-yellow-100 text-yellow-800',
      'Facebook Ads': 'bg-blue-100 text-blue-800',
      'LinkedIn': 'bg-indigo-100 text-indigo-800',
      'Evento': 'bg-red-100 text-red-800',
      'Outro': 'bg-gray-100 text-gray-800'
    };
    return colors[origem] || 'bg-gray-100 text-gray-800';
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">Nenhum lead cadastrado ainda.</p>
        <p className="text-gray-400 text-sm mt-2">Comece adicionando seu primeiro lead!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th 
              className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('nome')}
            >
              Nome {getSortIcon('nome')}
            </th>
            <th 
              className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('telefone')}
            >
              Telefone {getSortIcon('telefone')}
            </th>
            <th className="text-left p-3 font-semibold">E-mail</th>
            <th className="text-left p-3 font-semibold">Empresa</th>
            <th className="text-left p-3 font-semibold">Origem</th>
            <th className="text-left p-3 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                {editingId === lead.id ? (
                  <input
                    type="text"
                    value={editData.nome || ''}
                    onChange={(e) => handleEditChange('nome', e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                ) : (
                  <div>
                    <p className="font-medium">{lead.nome}</p>
                    {lead.observacoes && (
                      <p className="text-sm text-gray-500 mt-1">{lead.observacoes}</p>
                    )}
                  </div>
                )}
              </td>
              <td className="p-3">
                {editingId === lead.id ? (
                  <input
                    type="text"
                    value={editData.telefone || ''}
                    onChange={(e) => handleEditChange('telefone', formatTelefone(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                ) : (
                  lead.telefone
                )}
              </td>
              <td className="p-3">
                {editingId === lead.id ? (
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                ) : (
                  lead.email || '-'
                )}
              </td>
              <td className="p-3">
                {editingId === lead.id ? (
                  <input
                    type="text"
                    value={editData.empresa || ''}
                    onChange={(e) => handleEditChange('empresa', e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                ) : (
                  lead.empresa || '-'
                )}
              </td>
              <td className="p-3">
                {editingId === lead.id ? (
                  <select
                    value={editData.origem || ''}
                    onChange={(e) => handleEditChange('origem', e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="Site">Site</option>
                    <option value="Redes Sociais">Redes Sociais</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Facebook Ads">Facebook Ads</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Evento">Evento</option>
                    <option value="Outro">Outro</option>
                  </select>
                ) : (
                  lead.origem ? (
                    <span className={`px-2 py-1 text-xs rounded-full ${getOrigemColor(lead.origem)}`}>
                      {lead.origem}
                    </span>
                  ) : '-'
                )}
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  {editingId === lead.id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        WhatsApp
                      </a>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          E-mail
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(lead)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(lead.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remover
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeadList;