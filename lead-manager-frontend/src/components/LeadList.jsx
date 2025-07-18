// lead-manager-frontend/src/components/LeadList.jsx

import { FaEdit, FaTrash, FaWhatsapp, FaEnvelope } from 'react-icons/fa'; // Importa ícones de WhatsApp e E-mail

function LeadList({ leads, onEdit, onDelete }) {
  // Função auxiliar para encontrar o telefone primário
  const getPrimaryPhone = (telefones) => {
    if (!telefones || telefones.length === 0) return null;
    const primary = telefones.find(p => p.is_primary);
    return primary ? primary.phone_number : telefones[0].phone_number; // Retorna o primário ou o primeiro se não houver primário
  };

  // Função auxiliar para encontrar o e-mail primário
  const getPrimaryEmail = (emails) => {
    if (!emails || emails.length === 0) return null;
    const primary = emails.find(e => e.is_primary);
    return primary ? primary.email : emails[0].email; // Retorna o primário ou o primeiro se não houver primário
  };

  // Função para limpar e formatar o número de telefone para o link do WhatsApp
  const cleanPhoneNumber = (phoneNumber) => {
    // Remove todos os caracteres não numéricos
    return phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800 dark:shadow-xl dark:text-gray-100 overflow-x-auto">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de Leads</h2>
      {leads.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">Nenhum lead encontrado.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Nome do Cliente
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Empresa
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Origem
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Contatos
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {leads.map((lead) => {
              const primaryPhone = getPrimaryPhone(lead.telefones);
              const primaryEmail = getPrimaryEmail(lead.emails);
              const cleanedPhone = cleanPhoneNumber(primaryPhone);

              return (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.nome}</div>
                    {/* Observações abaixo do nome */}
                    {lead.observacoes && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Obs: {lead.observacoes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {lead.empresa || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {lead.origem || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {primaryEmail && (
                      <div className="flex items-center">
                        <FaEnvelope className="mr-1 text-blue-500" /> {primaryEmail}
                      </div>
                    )}
                    {primaryPhone && (
                      <div className="flex items-center mt-1">
                        <FaWhatsapp className="mr-1 text-green-500" /> {primaryPhone}
                      </div>
                    )}
                    {!primaryEmail && !primaryPhone && 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {/* Ícone de WhatsApp */}
                      {cleanedPhone && (
                        <a
                          href={`https://wa.me/+55${cleanedPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={`Conversar com ${lead.nome} no WhatsApp`}
                        >
                          <FaWhatsapp className="text-xl" />
                        </a>
                      )}
                      {/* Ícone de E-mail */}
                      {primaryEmail && (
                        <a
                          href={`mailto:${primaryEmail}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={`Enviar e-mail para ${lead.nome}`}
                        >
                          <FaEnvelope className="text-xl" />
                        </a>
                      )}
                      {/* Botão de Editar */}
                      <button
                        onClick={() => onEdit(lead)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Editar Lead"
                      >
                        <FaEdit className="text-xl" />
                      </button>
                      {/* Botão de Deletar */}
                      <button
                        onClick={() => onDelete(lead.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Deletar Lead"
                      >
                        <FaTrash className="text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LeadList;
