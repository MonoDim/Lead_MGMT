// lead-manager-frontend/src/components/LeadForm.jsx

import { useState } from 'react';
import { FaGlobe, FaUsers, FaShareAlt, FaGoogle, FaFacebook, FaLinkedin, FaCalendarAlt, FaEllipsisH } from 'react-icons/fa';

function LeadForm({ onAdd }) {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    empresa: '',
    origem: '',
    observacoes: ''
  });
  
  const [errors, setErrors] = useState({});

  const origemIcons = {
    "Site": <FaGlobe className="inline-block mr-2 text-gray-600 dark:text-gray-400" />, // Adicionado dark:text
    "Redes Sociais": <FaUsers className="inline-block mr-2 text-gray-600 dark:text-gray-400" />, // Adicionado dark:text
    "Indicação": <FaShareAlt className="inline-block mr-2 text-gray-600 dark:text-gray-400" />, // Adicionado dark:text
    "Google Ads": <FaGoogle className="inline-block mr-2 text-gray-600 dark:text-gray-400" />, // Adicionado dark:text
    "Facebook Ads": <FaFacebook className="inline-block mr-2 text-gray-600 dark:text-gray-400" />, // Adicionado dark:text
    "LinkedIn": <FaLinkedin className="inline-block mr-2 text-gray-600 dark:text-gray-400" />, // Adicionado dark:text
    "Evento": <FaCalendarAlt className="inline-block mr-2 text-gray-600 dark:text-gray-400" />, // Adicionado dark:text
    "Outro": <FaEllipsisH className="inline-block mr-2 text-gray-600 dark:text-gray-400" />, // Adicionado dark:text
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Formato inválido. Use: (11) 99999-9999';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    return newErrors;
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      const formatted = formatTelefone(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onAdd(formData);
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      empresa: '',
      origem: '',
      observacoes: ''
    });
    setErrors({});
  };

  // Classes base para inputs
  const inputBaseClasses = `w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2`;
  const defaultInputBorderClasses = `border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400`;
  const errorInputBorderClasses = `border-red-500 dark:border-red-400`;
  const textInputColorClasses = `text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700`;

  return (
    // Fundo do formulário e sombra
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow-md rounded-lg dark:bg-gray-800 dark:text-gray-100">
      {/* Título do formulário */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Adicionar Novo Lead</h2>
      
      <div>
        <input
          type="text"
          name="nome"
          placeholder="Nome *"
          value={formData.nome}
          onChange={handleChange}
          className={`${inputBaseClasses} ${textInputColorClasses} ${
            errors.nome ? errorInputBorderClasses : defaultInputBorderClasses
          }`}
        />
        {errors.nome && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.nome}</p>}
      </div>

      <div>
        <input
          type="text"
          name="telefone"
          placeholder="Telefone *"
          value={formData.telefone}
          onChange={handleChange}
          className={`${inputBaseClasses} ${textInputColorClasses} ${
            errors.telefone ? errorInputBorderClasses : defaultInputBorderClasses
          }`}
        />
        {errors.telefone && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.telefone}</p>}
      </div>

      <div>
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
          className={`${inputBaseClasses} ${textInputColorClasses} ${
            errors.email ? errorInputBorderClasses : defaultInputBorderClasses
          }`}
        />
        {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <input
          type="text"
          name="empresa"
          placeholder="Empresa"
          value={formData.empresa}
          onChange={handleChange}
          className={`${inputBaseClasses} ${textInputColorClasses} ${defaultInputBorderClasses}`}
        />
      </div>

      <div>
        <div className="relative">
          <select
            name="origem"
            value={formData.origem}
            onChange={handleChange}
            // Classes para o select no modo escuro
            className={`block appearance-none w-full px-3 py-2 pr-10 focus:outline-none focus:ring-2 
                       ${inputBaseClasses} ${textInputColorClasses} ${defaultInputBorderClasses}`}
          >
            <option value="">Selecione a origem</option>
            {Object.keys(origemIcons).map((origem) => (
              <option key={origem} value={origem} className="dark:bg-gray-700 dark:text-gray-100"> {/* Cor da opção no dropdown */}
                {origem}
              </option>
            ))}
          </select>
          {/* Seta para baixo customizada para o select */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
        {formData.origem && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex items-center">
            Origem Selecionada: {origemIcons[formData.origem]} {formData.origem}
          </p>
        )}
      </div>

      <div>
        <textarea
          name="observacoes"
          placeholder="Observações"
          value={formData.observacoes}
          onChange={handleChange}
          rows={3}
          className={`${inputBaseClasses} ${textInputColorClasses} ${defaultInputBorderClasses} resize-none`}
        />
      </div>

      <button
        type="submit"
        // Cores do botão para o modo escuro
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      >
        Adicionar Lead
      </button>
    </form>
  );
}

export default LeadForm;