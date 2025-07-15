import { useState } from 'react';

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
    
    // Limpar erro do campo quando o usuário começar a digitar
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          name="nome"
          placeholder="Nome *"
          value={formData.nome}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.nome ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
      </div>

      <div>
        <input
          type="text"
          name="telefone"
          placeholder="Telefone *"
          value={formData.telefone}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.telefone ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
      </div>

      <div>
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <input
          type="text"
          name="empresa"
          placeholder="Empresa"
          value={formData.empresa}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <select
          name="origem"
          value={formData.origem}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione a origem</option>
          <option value="Site">Site</option>
          <option value="Redes Sociais">Redes Sociais</option>
          <option value="Indicação">Indicação</option>
          <option value="Google Ads">Google Ads</option>
          <option value="Facebook Ads">Facebook Ads</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Evento">Evento</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      <div>
        <textarea
          name="observacoes"
          placeholder="Observações"
          value={formData.observacoes}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Adicionar Lead
      </button>
    </form>
  );
}

export default LeadForm;