// lead-manager-frontend/src/components/LeadForm.jsx

import { useState } from 'react';
import {
  FaGlobe, FaUsers, FaShareAlt, FaGoogle, FaFacebook, FaLinkedin, FaCalendarAlt, FaEllipsisH,
  FaPlus, FaMinus,
  FaSpinner // Ícone de loading
} from 'react-icons/fa';

function LeadForm({ onAdd }) {
  const [formData, setFormData] = useState({
    nome: '',
    // Agora emails e telefones são arrays de objetos
    emails: [{ email: '', is_primary: true }], // Começa com um campo de e-mail primário
    telefones: [{ phone_number: '', is_whatsapp: false, is_primary: true }], // Começa com um campo de telefone primário
    empresa: '',
    origem: '',
    observacoes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para feedback de submissão

  const origemIcons = {
    "Site": <FaGlobe className="inline-block mr-2 text-gray-600 dark:text-gray-400" />,
    "Redes Sociais": <FaUsers className="inline-block mr-2 text-gray-600 dark:text-gray-400" />,
    "Indicação": <FaShareAlt className="inline-block mr-2 text-gray-600 dark:text-gray-400" />,
    "Google Ads": <FaGoogle className="inline-block mr-2 text-gray-600 dark:text-gray-400" />,
    "Facebook Ads": <FaFacebook className="inline-block mr-2 text-gray-600 dark:text-gray-400" />,
    "LinkedIn": <FaLinkedin className="inline-block mr-2 text-gray-600 dark:text-gray-400" />,
    "Evento": <FaCalendarAlt className="inline-block mr-2 text-gray-600 dark:text-gray-400" />,
    "Outro": <FaEllipsisH className="inline-block mr-2 text-gray-600 dark:text-gray-400" />,
  };

  // Funções de validação para E-mails e Telefones (agora arrays)
  const validateEmails = (emails) => {
    let emailErrors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Se não houver emails ou todos estiverem vazios, não é um erro (email é opcional)
    if (!emails || emails.every(e => !e.email.trim())) {
      return []; 
    }

    emails.forEach((emailObj, index) => {
      if (emailObj.email.trim() && !emailRegex.test(emailObj.email)) {
        emailErrors.push(`E-mail inválido na posição ${index + 1}.`);
      } else if (!emailObj.email.trim()) {
          emailErrors.push(`E-mail na posição ${index + 1} não pode ser vazio se estiver preenchido.`);
      }
    });
    return emailErrors;
  };

  const validateTelefones = (telefones) => {
    let phoneErrors = [];
    const phoneRegex = /^\d{10,11}$/; // Exemplo: 10 ou 11 dígitos numéricos
    if (!telefones || telefones.length === 0 || telefones.every(t => !t.phone_number.trim())) {
      phoneErrors.push('Pelo menos um telefone é obrigatório.');
    } else {
      telefones.forEach((telObj, index) => {
        const cleanedPhoneNumber = (telObj.phone_number || '').replace(/\D/g, '');
        if (cleanedPhoneNumber && !phoneRegex.test(cleanedPhoneNumber)) {
          phoneErrors.push(`Telefone inválido na posição ${index + 1}.`);
        } else if (!cleanedPhoneNumber) {
            phoneErrors.push(`Telefone na posição ${index + 1} não pode ser vazio.`);
        }
      });
    }
    return phoneErrors;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    const emailValidationResult = validateEmails(formData.emails);
    if (emailValidationResult.length > 0) {
      newErrors.emails = emailValidationResult.join('; ');
    }

    const telefoneValidationResult = validateTelefones(formData.telefones);
    if (telefoneValidationResult.length > 0) {
      newErrors.telefones = telefoneValidationResult.join('; ');
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
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa erro específico ao digitar, exceto para emails/telefones que são handled por outras funções
    if (errors[name] && name !== 'emails' && name !== 'telefones') {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Funções para manipular arrays de E-mails
  const handleEmailChange = (index, field, value) => {
    const updatedEmails = [...formData.emails];
    updatedEmails[index][field] = value;
    if (field === 'is_primary' && value === true) {
      updatedEmails.forEach((email, i) => {
        if (i !== index) email.is_primary = false;
      });
    }
    setFormData(prev => ({ ...prev, emails: updatedEmails }));
    setErrors(prev => ({ ...prev, emails: '' })); // Limpa erro ao digitar
  };

  const addEmailField = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, { email: '', is_primary: false }]
    }));
  };

  const removeEmailField = (index) => {
    const updatedEmails = formData.emails.filter((_, i) => i !== index);
    // Garante que haja pelo menos um campo de e-mail, e o primeiro seja primário se for o único
    setFormData(prev => ({
      ...prev,
      emails: updatedEmails.length > 0 ? updatedEmails : [{ email: '', is_primary: true }]
    }));
    setErrors(prev => ({ ...prev, emails: '' })); // Limpa erro ao remover
  };

  // Funções para manipular arrays de Telefones
  const handlePhoneChange = (index, field, value) => {
    const updatedPhones = [...formData.telefones];
    if (field === 'phone_number') {
      updatedPhones[index][field] = formatTelefone(value);
    } else {
      updatedPhones[index][field] = value;
    }

    if (field === 'is_primary' && value === true) {
      updatedPhones.forEach((phone, i) => {
        if (i !== index) phone.is_primary = false;
      });
    }
    setFormData(prev => ({ ...prev, telefones: updatedPhones }));
    setErrors(prev => ({ ...prev, telefones: '' })); // Limpa erro ao digitar
  };

  const addPhoneField = () => {
    setFormData(prev => ({
      ...prev,
      telefones: [...prev.telefones, { phone_number: '', is_whatsapp: false, is_primary: false }]
    }));
  };

  const removePhoneField = (index) => {
    const updatedPhones = formData.telefones.filter((_, i) => i !== index);
    // Garante que haja pelo menos um campo de telefone, e o primeiro seja primário se for o único
    setFormData(prev => ({
      ...prev,
      telefones: updatedPhones.length > 0 ? updatedPhones : [{ phone_number: '', is_whatsapp: false, is_primary: true }]
    }));
    setErrors(prev => ({ ...prev, telefones: '' })); // Limpa erro ao remover
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Cria uma cópia limpa do formData para enviar, removendo campos vazios dos arrays
      const dataToSend = {
        ...formData,
        emails: formData.emails.filter(e => e.email.trim() !== ''), // Email é opcional, então filtramos vazios
        telefones: formData.telefones.filter(t => t.phone_number.replace(/\D/g, '').trim() !== ''),
      };

      await onAdd(dataToSend);
      setFormData({
        nome: '',
        emails: [{ email: '', is_primary: true }],
        telefones: [{ phone_number: '', is_whatsapp: false, is_primary: true }],
        empresa: '',
        origem: '',
        observacoes: ''
      });
      setErrors({});
    } catch (error) {
      console.error("Erro ao adicionar lead:", error);
      // Aqui você pode adicionar um feedback ao usuário que a adição falhou
    } finally {
      setIsSubmitting(false);
    }
  };

  // Classes base para inputs
  const inputBaseClasses = `w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2`;
  const defaultInputBorderClasses = `border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400`;
  const errorInputBorderClasses = `border-red-500 dark:border-red-400`;
  const textInputColorClasses = `text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700`;

  // Novas classes para as checkboxes no tema escuro
  const checkboxBaseClasses = `form-checkbox h-4 w-4 rounded focus:ring-2`;
  const checkboxPrimaryColorClasses = `text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 checked:bg-blue-600 checked:border-transparent dark:checked:bg-blue-400 dark:checked:border-blue-400`;
  const checkboxWhatsappColorClasses = `text-green-600 dark:text-green-400 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 checked:bg-green-600 checked:border-transparent dark:checked:bg-green-400 dark:checked:border-green-400`;


  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow-md rounded-lg dark:bg-gray-800 dark:text-gray-100">
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

      {/* Seção para Telefones (AGORA EM PRIMEIRO) */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
        <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Telefone(s) *</label>
        {formData.telefones.map((phone, index) => (
          <div key={index} className="mb-2 last:mb-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={phone.phone_number}
                onChange={(e) => handlePhoneChange(index, 'phone_number', e.target.value)}
                className={`${inputBaseClasses} ${textInputColorClasses} ${
                  errors.telefones && errors.telefones.includes(`posição ${index + 1}`) ? errorInputBorderClasses : defaultInputBorderClasses
                }`}
                placeholder={`Telefone ${index + 1}`}
              />
              {formData.telefones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePhoneField(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
                  title="Remover telefone"
                >
                  <FaMinus />
                </button>
              )}
            </div>
            <div className="flex items-center mt-1 text-xs text-gray-600 dark:text-gray-300">
              <label className="inline-flex items-center mr-3">
                <input
                  type="checkbox"
                  checked={phone.is_whatsapp}
                  onChange={(e) => handlePhoneChange(index, 'is_whatsapp', e.target.checked)}
                  className={`${checkboxBaseClasses} ${checkboxWhatsappColorClasses}`}
                />
                <span className="ml-1">WhatsApp</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={phone.is_primary}
                  onChange={(e) => handlePhoneChange(index, 'is_primary', e.target.checked)}
                  className={`${checkboxBaseClasses} ${checkboxPrimaryColorClasses}`}
                />
                <span className="ml-1">Principal</span>
              </label>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addPhoneField}
          className="flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm mt-2"
        >
          <FaPlus className="mr-1" /> Adicionar Telefone
        </button>
        {errors.telefones && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.telefones}</p>}
      </div>

      {/* Seção para E-mails (AGORA EM SEGUNDO E OPCIONAL) */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
        <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">E-mail(s)</label>
        {formData.emails.map((email, index) => (
          <div key={index} className="mb-2 last:mb-0">
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={email.email}
                onChange={(e) => handleEmailChange(index, 'email', e.target.value)}
                className={`${inputBaseClasses} ${textInputColorClasses} ${
                  errors.emails && errors.emails.includes(`posição ${index + 1}`) ? errorInputBorderClasses : defaultInputBorderClasses
                }`}
                placeholder={`E-mail ${index + 1}`}
              />
              {/* Permite remover se houver mais de um, ou se houver apenas um e ele estiver vazio */}
              {(formData.emails.length > 1 || (formData.emails.length === 1 && email.email.trim() !== '')) && (
                <button
                  type="button"
                  onClick={() => removeEmailField(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
                  title="Remover e-mail"
                >
                  <FaMinus />
                </button>
              )}
            </div>
            <div className="flex items-center mt-1 text-xs text-gray-600 dark:text-gray-300">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={email.is_primary}
                  onChange={(e) => handleEmailChange(index, 'is_primary', e.target.checked)}
                  className={`${checkboxBaseClasses} ${checkboxPrimaryColorClasses}`}
                />
                <span className="ml-1">Principal</span>
              </label>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addEmailField}
          className="flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm mt-2"
        >
          <FaPlus className="mr-1" /> Adicionar E-mail
        </button>
        {errors.emails && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.emails}</p>}
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
            className={`block appearance-none w-full px-3 py-2 pr-10 focus:outline-none focus:ring-2
                       ${inputBaseClasses} ${textInputColorClasses} ${defaultInputBorderClasses}`}
          >
            <option value="">Selecione a origem</option>
            {Object.keys(origemIcons).map((origem) => (
              <option key={origem} value={origem} className="dark:bg-gray-700 dark:text-gray-100">
                {origem}
              </option>
            ))}
          </select>
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
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {isSubmitting ? <FaSpinner className="animate-spin mr-2 inline-block" /> : null}
        Adicionar Lead
      </button>
    </form>
  );
}

export default LeadForm;