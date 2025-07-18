// lead-manager-frontend/src/components/LeadForm.jsx

import { useState, useEffect } from 'react';
import {
  FaGlobe, FaUsers, FaShareAlt, FaGoogle, FaFacebook, FaLinkedin, FaCalendarAlt, FaEllipsisH,
  FaPlus, FaMinus, FaWhatsapp
} from 'react-icons/fa';

function LeadForm({ onAdd, initialData }) {
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    origem: '',
    observacoes: '',
    emails: [{ email: '', is_primary: true }],
    telefones: [{ phone_number: '', is_whatsapp: false, is_primary: true }]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || '',
        empresa: initialData.empresa || '',
        origem: initialData.origem || '',
        observacoes: initialData.observacoes || '',
        emails: initialData.emails && initialData.emails.length > 0
          ? initialData.emails.map(e => ({ ...e, is_primary: !!e.is_primary }))
          : [{ email: '', is_primary: true }],
        telefones: initialData.telefones && initialData.telefones.length > 0
          ? initialData.telefones.map(p => ({ ...p, is_whatsapp: !!p.is_whatsapp, is_primary: !!p.is_primary, phone_number: formatTelefone(p.phone_number) }))
          : [{ phone_number: '', is_whatsapp: false, is_primary: true }]
      });
      setErrors({});
    } else {
      setFormData({
        nome: '',
        empresa: '',
        origem: '',
        observacoes: '',
        emails: [{ email: '', is_primary: true }],
        telefones: [{ phone_number: '', is_whatsapp: false, is_primary: true }]
      });
      setErrors({});
    }
  }, [initialData]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    let emailError = '';
    const filledEmails = formData.emails.filter(emailObj => emailObj.email.trim() !== '');

    if (filledEmails.length > 0) {
      // NOVA REGEX: Mais robusta para validar e-mails comuns
      // Aceita letras, números, ., _, %, +, - antes do @
      // Aceita letras, números, ., - depois do @
      // Requer um ponto e pelo menos 2 letras no TLD (Top-Level Domain)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // <-- LINHA ALTERADA AQUI
      for (let i = 0; i < filledEmails.length; i++) {
        const emailObj = filledEmails[i];
        if (!emailRegex.test(emailObj.email)) {
          emailError = `E-mail ${formData.emails.indexOf(emailObj) + 1} inválido.`;
          break;
        }
      }
    }
    if (emailError) newErrors.emails = emailError;

    let phoneError = '';
    if (formData.telefones.length === 0) {
      phoneError = 'Pelo menos um telefone é obrigatório.';
    } else {
      for (let i = 0; i < formData.telefones.length; i++) {
        const phoneObj = formData.telefones[i];
        const cleanedNumber = phoneObj.phone_number.replace(/\D/g, '');
        if (!cleanedNumber) {
          phoneError = `Telefone ${i + 1} é obrigatório.`;
          break;
        } else if (!/^\d{10,11}$/.test(cleanedNumber)) {
          phoneError = `Telefone ${i + 1} inválido. Use 10 ou 11 dígitos.`;
          break;
        }
      }
    }
    if (phoneError) newErrors.telefones = phoneError;

    return newErrors;
  };

  const addEmailField = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, { email: '', is_primary: false }]
    }));
  };

  const removeEmailField = (index) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }));
    if (errors.emails) setErrors(prev => ({ ...prev, emails: '' }));
  };

  const handleEmailChange = (index, value, fieldName) => {
    const newEmails = [...formData.emails];
    newEmails[index][fieldName] = value;

    if (fieldName === 'is_primary' && value === true) {
      newEmails.forEach((email, i) => {
        if (i !== index) email.is_primary = false;
      });
    } else if (fieldName === 'is_primary' && newEmails.every(e => !e.is_primary)) {
      if (newEmails.length > 0) newEmails[0].is_primary = true;
    }

    setFormData(prev => ({ ...prev, emails: newEmails }));
    if (errors.emails) setErrors(prev => ({ ...prev, emails: '' }));
  };

  const addPhoneField = () => {
    setFormData(prev => ({
      ...prev,
      telefones: [...prev.telefones, { phone_number: '', is_whatsapp: false, is_primary: false }]
    }));
  };

  const removePhoneField = (index) => {
    setFormData(prev => ({
      ...prev,
      telefones: prev.telefones.filter((_, i) => i !== index)
    }));
    if (errors.telefones) setErrors(prev => ({ ...prev, telefones: '' }));
  };

  const formatTelefone = (value) => {
    const numbers = String(value).replace(/\D/g, '');
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

  const handlePhoneChange = (index, value, fieldName) => {
    const newPhones = [...formData.telefones];
    if (fieldName === 'phone_number') {
      newPhones[index][fieldName] = formatTelefone(value);
    } else {
      newPhones[index][fieldName] = value;
    }

    if (fieldName === 'is_primary' && value === true) {
      newPhones.forEach((phone, i) => {
        if (i !== index) phone.is_primary = false;
      });
    } else if (fieldName === 'is_primary' && newPhones.every(p => !p.is_primary)) {
      if (newPhones.length > 0) newPhones[0].is_primary = true;
    }

    setFormData(prev => ({ ...prev, telefones: newPhones }));
    if (errors.telefones) setErrors(prev => ({ ...prev, telefones: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    if (formData.emails.length > 0 && !formData.emails.some(e => e.is_primary)) {
        formData.emails[0].is_primary = true;
    }
    if (formData.telefones.length > 0 && !formData.telefones.some(p => p.is_primary)) {
        formData.telefones[0].is_primary = true;
    }

    const cleanedFormData = {
        ...formData,
        emails: formData.emails.filter(emailObj => emailObj.email.trim() !== ''),
        telefones: formData.telefones.filter(phoneObj => phoneObj.phone_number.replace(/\D/g, '').trim() !== '')
    };

    onAdd(cleanedFormData);

    if (!initialData) {
      setFormData({
        nome: '',
        empresa: '',
        origem: '',
        observacoes: '',
        emails: [{ email: '', is_primary: true }],
        telefones: [{ phone_number: '', is_whatsapp: false, is_primary: true }]
      });
    }
    setErrors({});
  };

  const inputBaseClasses = `w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2`;
  const defaultInputBorderClasses = `border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400`;
  const errorInputBorderClasses = `border-red-500 dark:border-red-400`;
  const textInputColorClasses = `text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700`;
  const buttonBaseClasses = `px-3 py-2 rounded-lg transition-colors`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow-md rounded-lg dark:bg-gray-800 dark:text-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {initialData ? 'Editar Lead Existente' : 'Adicionar Novo Lead'}
      </h2>

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

      <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex justify-between items-center">
          E-mails
          <button
            type="button"
            onClick={addEmailField}
            className={`${buttonBaseClasses} bg-green-500 text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800`}
            title="Adicionar E-mail"
          >
            <FaPlus className="inline-block" /> Adicionar
          </button>
        </h3>
        {errors.emails && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.emails}</p>}
        {formData.emails.map((emailObj, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="email"
              placeholder={`E-mail ${index + 1}`}
              value={emailObj.email}
              onChange={(e) => handleEmailChange(index, e.target.value, 'email')}
              className={`${inputBaseClasses} ${textInputColorClasses} flex-grow ${
                errors.emails ? errorInputBorderClasses : defaultInputBorderClasses
              }`}
            />
            <label className="flex items-center text-gray-700 dark:text-gray-300 whitespace-nowrap">
              <input
                type="checkbox"
                checked={emailObj.is_primary}
                onChange={(e) => handleEmailChange(index, e.target.checked, 'is_primary')}
                className="mr-1 h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
              />
              Principal
            </label>
            {formData.emails.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmailField(index)}
                className={`${buttonBaseClasses} bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800`}
                title="Remover E-mail"
              >
                <FaMinus />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex justify-between items-center">
          Telefones
          <button
            type="button"
            onClick={addPhoneField}
            className={`${buttonBaseClasses} bg-green-500 text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800`}
            title="Adicionar Telefone"
          >
            <FaPlus className="inline-block" /> Adicionar
          </button>
        </h3>
        {errors.telefones && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.telefones}</p>}
        {formData.telefones.map((phoneObj, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder={`Telefone ${index + 1} *`}
              value={phoneObj.phone_number}
              onChange={(e) => handlePhoneChange(index, e.target.value, 'phone_number')}
              className={`${inputBaseClasses} ${textInputColorClasses} flex-grow ${
                errors.telefones ? errorInputBorderClasses : defaultInputBorderClasses
              }`}
            />
            <label className="flex items-center text-gray-700 dark:text-gray-300 whitespace-nowrap">
              <input
                type="checkbox"
                checked={phoneObj.is_whatsapp}
                onChange={(e) => handlePhoneChange(index, e.target.checked, 'is_whatsapp')}
                className="mr-1 h-4 w-4 text-green-600 dark:text-green-400 focus:ring-green-500 dark:focus:ring-green-400 border-gray-300 dark:border-gray-600 rounded"
              />
              <FaWhatsapp className="inline-block mr-1" /> WhatsApp
            </label>
            <label className="flex items-center text-gray-700 dark:text-gray-300 whitespace-nowrap">
              <input
                type="checkbox"
                checked={phoneObj.is_primary}
                onChange={(e) => handlePhoneChange(index, e.target.checked, 'is_primary')}
                className="mr-1 h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
              />
              Principal
            </label>
            {formData.telefones.length > 1 && (
              <button
                type="button"
                onClick={() => removePhoneField(index)}
                className={`${buttonBaseClasses} bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800`}
                title="Remover Telefone"
              >
                <FaMinus />
              </button>
            )}
          </div>
        ))}
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
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      >
        {initialData ? 'Atualizar Lead' : 'Adicionar Lead'}
      </button>
    </form>
  );
}

export default LeadForm;