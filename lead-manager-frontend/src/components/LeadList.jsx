// lead-manager-frontend/src/components/LeadList.jsx

import { useState } from 'react';
import {
  FaGlobe, FaUsers, FaShareAlt, FaGoogle, FaFacebook, FaLinkedin, FaCalendarAlt, FaEllipsisH,
  FaSort, FaSortUp, FaSortDown,
  FaEdit, FaTrashAlt, FaSave, FaTimes, FaWhatsapp, FaEnvelope,
  FaSpinner // Novo ícone para loading
} from 'react-icons/fa';

function LeadList({ leads, onDelete, onUpdate, onSort, sortBy, sortOrder }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [validationErrors, setValidationErrors] = useState({}); // Novo estado para erros de validação
  const [isSaving, setIsSaving] = useState(false); // Novo estado para feedback de salvamento

  const origemIcons = {
    "Site": <FaGlobe className="inline-block mr-1 text-gray-600 dark:text-gray-400" />,
    "Redes Sociais": <FaUsers className="inline-block mr-1 text-gray-600 dark:text-gray-400" />,
    "Indicação": <FaShareAlt className="inline-block mr-1 text-gray-600 dark:text-gray-400" />,
    "Google Ads": <FaGoogle className="inline-block mr-1 text-gray-600" />,
    "Facebook Ads": <FaFacebook className="inline-block mr-1 text-gray-600" />,
    "LinkedIn": <FaLinkedin className="inline-block mr-1 text-gray-600" />,
    "Evento": <FaCalendarAlt className="inline-block mr-1 text-gray-600" />,
    "Outro": <FaEllipsisH className="inline-block mr-1 text-gray-600" />,
  };

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'nome':
        if (!value.trim()) error = 'Nome é obrigatório.';
        break;
      case 'telefone':
        const phoneNumbers = value.replace(/\D/g, '');
        if (!phoneNumbers) {
            error = 'Telefone é obrigatório.';
        } else if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
            error = 'Telefone inválido (mín. 10 ou 11 dígitos numéricos).';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'E-mail é obrigatório.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'E-mail inválido.';
        }
        break;
      default:
        break;
    }
    setValidationErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const handleEdit = (lead) => {
    setEditingId(lead.id);
    setEditData(lead);
    setValidationErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setValidationErrors({});
  };

  const handleSaveEdit = async () => {
    const isNameValid = validateField('nome', editData.nome);
    const isPhoneValid = validateField('telefone', editData.telefone);
    const isEmailValid = validateField('email', editData.email);

    if (!isNameValid || !isPhoneValid || !isEmailValid) {
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(editingId, editData);
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    if (['nome', 'telefone', 'email'].includes(field)) {
      validateField(field, value);
    }
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
    // Adicionado dark:text para os ícones de ordenação
    if (sortBy !== field) return <FaSort className="inline-block ml-1 text-gray-400 dark:text-gray-500" />;
    return sortOrder === 'asc' ? <FaSortUp className="inline-block ml-1 text-gray-600 dark:text-gray-300" /> : <FaSortDown className="inline-block ml-1 text-gray-600 dark:text-gray-300" />;
  };

  const getOrigemColor = (origem) => {
    const colors = {
      // Ajuste as cores para o modo escuro usando dark:bg e dark:text
      'Site': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
      'Redes Sociais': 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
      'Indicação': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      'Google Ads': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      'Facebook Ads': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100', // Manter consistente se for mesma cor de Site
      'LinkedIn': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100',
      'Evento': 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
      'Outro': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[origem] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-8">
        {/* Texto para o estado de nenhum lead */}
        <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhum lead cadastrado ainda.</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Comece adicionando seu primeiro lead!</p>
      </div>
    );
  }

  // Classe base para inputs no modo de edição (replicadas do LeadForm para consistência)
  const inputBaseClasses = "w-full border rounded-md px-3 py-1 text-sm transition-all duration-200 focus:outline-none focus:ring-2";
  const defaultInputBorderClasses = "border-gray-300 dark:border-gray-600 focus:ring-blue-400 dark:focus:ring-blue-400";
  const errorInputBorderClasses = "border-red-400 dark:border-red-500"; // Usar red-500 para borda em dark mode
  const textInputColorClasses = "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700";


  return (
    // Fundo da tabela e sombra
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4 dark:bg-gray-800 dark:text-gray-100">
      {/* Título da lista */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de Leads</h2>
      <table className="w-full border-collapse">
        <thead>
          {/* Cabeçalho da tabela */}
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th
              className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 min-w-[150px] text-gray-800 dark:text-gray-200"
              onClick={() => onSort('nome')}
            >
              Nome {getSortIcon('nome')}
            </th>
            <th
              className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 min-w-[120px] text-gray-800 dark:text-gray-200"
              onClick={() => onSort('telefone')}
            >
              Telefone {getSortIcon('telefone')}
            </th>
            <th className="text-left p-3 font-semibold min-w-[150px] text-gray-800 dark:text-gray-200">E-mail</th>
            <th className="text-left p-3 font-semibold min-w-[120px] text-gray-800 dark:text-gray-200">Empresa</th>
            <th className="text-left p-3 font-semibold min-w-[120px] text-gray-800 dark:text-gray-200">
              Origem
            </th>
            <th className="text-left p-3 font-semibold w-[450px] text-gray-800 dark:text-gray-200">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            // Linha da tabela
            <tr key={lead.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              {/* Campo Nome e Observações */}
              <td className="p-3 align-top">
                {editingId === lead.id ? (
                  <>
                    <input
                      type="text"
                      value={editData.nome || ''}
                      onChange={(e) => handleEditChange('nome', e.target.value)}
                      className={`${inputBaseClasses} ${textInputColorClasses} ${
                        validationErrors.nome ? errorInputBorderClasses : defaultInputBorderClasses
                      }`}
                    />
                    {validationErrors.nome && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{validationErrors.nome}</p>}
                    <textarea
                      value={editData.observacoes || ''}
                      onChange={(e) => handleEditChange('observacoes', e.target.value)}
                      placeholder="Observações..."
                      className={`${inputBaseClasses} ${textInputColorClasses} ${defaultInputBorderClasses} mt-2 h-16 resize-y`}
                    />
                  </>
                ) : (
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{lead.nome}</p>
                    {lead.observacoes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic whitespace-pre-wrap">{lead.observacoes}</p>
                    )}
                  </div>
                )}
              </td>
              {/* Campo Telefone */}
              <td className="p-3 align-top">
                {editingId === lead.id ? (
                  <>
                    <input
                      type="text"
                      value={editData.telefone || ''}
                      onChange={(e) => handleEditChange('telefone', formatTelefone(e.target.value))}
                      className={`${inputBaseClasses} ${textInputColorClasses} ${
                        validationErrors.telefone ? errorInputBorderClasses : defaultInputBorderClasses
                      }`}
                    />
                    {validationErrors.telefone && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{validationErrors.telefone}</p>}
                  </>
                ) : (
                  <span className="text-gray-700 dark:text-gray-200">{lead.telefone}</span>
                )}
              </td>
              {/* Campo Email */}
              <td className="p-3 align-top">
                {editingId === lead.id ? (
                  <>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                      className={`${inputBaseClasses} ${textInputColorClasses} ${
                        validationErrors.email ? errorInputBorderClasses : defaultInputBorderClasses
                      }`}
                    />
                    {validationErrors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{validationErrors.email}</p>}
                  </>
                ) : (
                  <span className="text-gray-700 dark:text-gray-200">{lead.email || '-'}</span>
                )}
              </td>
              {/* Campo Empresa */}
              <td className="p-3 align-top">
                {editingId === lead.id ? (
                  <input
                    type="text"
                    value={editData.empresa || ''}
                    onChange={(e) => handleEditChange('empresa', e.target.value)}
                    className={`${inputBaseClasses} ${textInputColorClasses} ${defaultInputBorderClasses}`}
                  />
                ) : (
                  <span className="text-gray-700 dark:text-gray-200">{lead.empresa || '-'}</span>
                )}
              </td>
              {/* Campo Origem */}
              <td className="p-3 align-top">
                {editingId === lead.id ? (
                  <select
                    value={editData.origem || ''}
                    onChange={(e) => handleEditChange('origem', e.target.value)}
                    // Classes para o select no modo escuro
                    className={`${inputBaseClasses} ${defaultInputBorderClasses} bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100`}
                  >
                    <option value="">Selecione</option>
                    {Object.keys(origemIcons).map((origem) => (
                      // Opções do select no modo escuro
                      <option key={origem} value={origem} className="dark:bg-gray-700 dark:text-gray-100">
                        {origem}
                      </option>
                    ))}
                  </select>
                ) : (
                  lead.origem ? (
                    // Tags de origem
                    <span className={`flex items-center px-2 py-1 text-xs rounded-full whitespace-nowrap ${getOrigemColor(lead.origem)}`}>
                      {origemIcons[lead.origem]}
                      {lead.origem}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">-</span>
                  )
                )}
              </td>
              {/* Coluna de Ações */}
              <td className="p-3 align-top">
                <div className="flex flex-wrap gap-2 justify-center">
                  {editingId === lead.id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center justify-center bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed
                                   dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-500" // Cores para o modo escuro
                        disabled={isSaving || Object.values(validationErrors).some(error => error !== '')}
                      >
                        {isSaving ? (
                          <FaSpinner className="animate-spin mr-1" />
                        ) : (
                          <FaSave className="mr-1" />
                        )}
                        Salvar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center justify-center bg-gray-400 text-white px-3 py-1 rounded-md hover:bg-gray-500 transition-colors text-sm
                                   dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-500" // Cores para o modo escuro
                      >
                        <FaTimes className="mr-1" /> Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-sm
                                   dark:bg-green-700 dark:hover:bg-green-800" // Cores para o modo escuro
                        title="Enviar mensagem via WhatsApp"
                      >
                        <FaWhatsapp className="mr-1" /> WhatsApp
                      </a>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center justify-center bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm
                                     dark:bg-blue-700 dark:hover:bg-blue-800" // Cores para o modo escuro
                          title="Enviar E-mail"
                        >
                          <FaEnvelope className="mr-1" /> E-mail
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(lead)}
                        className="flex items-center justify-center bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors text-sm
                                   dark:bg-yellow-600 dark:hover:bg-yellow-700" // Cores para o modo escuro
                        title="Editar Lead"
                      >
                        <FaEdit className="mr-1" /> Editar
                      </button>
                      <button
                        onClick={() => onDelete(lead.id)}
                        className="flex items-center justify-center bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm
                                   dark:bg-red-600 dark:hover:bg-red-700" // Cores para o modo escuro
                        title="Remover Lead"
                      >
                        <FaTrashAlt className="mr-1" /> Remover
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