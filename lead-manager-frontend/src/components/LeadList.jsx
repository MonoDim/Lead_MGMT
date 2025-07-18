// lead-manager-frontend/src/components/LeadList.jsx

import { FaEdit, FaTrash, FaEnvelope, FaPhone, FaWhatsapp, FaStar, FaRegStar } from 'react-icons/fa';

function LeadList({ leads, onEdit, onDelete }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 dark:bg-gray-800 dark:text-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de Leads</h2>
      {leads.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">Nenhum lead encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  E-mails
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Telefones
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Empresa
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Origem
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Observações
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data Cadastro
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {lead.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {lead.emails && lead.emails.map((emailObj, index) => (
                      <div key={index} className="flex items-center">
                        <FaEnvelope className="mr-1 text-blue-500" />
                        {emailObj.email}
                        {emailObj.is_primary && <FaStar className="ml-1 text-yellow-500" title="E-mail Principal" />}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {lead.telefones && lead.telefones.map((phoneObj, index) => (
                      <div key={index} className="flex items-center">
                        {phoneObj.is_whatsapp ? (
                          <FaWhatsapp className="mr-1 text-green-500" title="WhatsApp" />
                        ) : (
                          <FaPhone className="mr-1 text-gray-500" />
                        )}
                        {phoneObj.phone_number}
                        {phoneObj.is_primary && <FaStar className="ml-1 text-yellow-500" title="Telefone Principal" />}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {lead.empresa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {lead.origem}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {lead.observacoes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(lead.data_cadastro).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(lead)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-500 mr-3"
                      title="Editar Lead"
                    >
                      <FaEdit className="inline-block text-lg" />
                    </button>
                    <button
                      onClick={() => onDelete(lead.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-500"
                      title="Deletar Lead"
                    >
                      <FaTrash className="inline-block text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LeadList;