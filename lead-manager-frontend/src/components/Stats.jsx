// lead-manager-frontend/src/components/Stats.jsx

import {
  FaUsers, // Total de Leads
  FaEnvelope, // Com E-mail
  FaBuilding, // Com Empresa
  FaChartBar, // Principal Origem
  FaGlobe, FaShareAlt, FaGoogle, FaFacebook, FaLinkedin, FaCalendarAlt, FaEllipsisH // Ícones para Origens
} from 'react-icons/fa';

// Recebe as novas props: onFilterClick e activeFilter
function Stats({ leads, onFilterClick, activeFilter }) {
  const totalLeads = leads.length;
  const leadsWithEmail = leads.filter(lead => lead.email).length;
  const leadsWithCompany = leads.filter(lead => lead.empresa).length;

  const origemStats = leads.reduce((acc, lead) => {
    if (lead.origem) {
      acc[lead.origem] = (acc[lead.origem] || 0) + 1;
    }
    return acc;
  }, {});

  const origemIcons = {
    "Site": <FaGlobe className="inline-block text-gray-600 dark:text-gray-400" />,
    "Redes Sociais": <FaUsers className="inline-block text-gray-600 dark:text-gray-400" />,
    "Indicação": <FaShareAlt className="inline-block text-gray-600 dark:text-gray-400" />,
    "Google Ads": <FaGoogle className="inline-block text-gray-600 dark:text-gray-400" />,
    "Facebook Ads": <FaFacebook className="inline-block text-gray-600 dark:text-gray-400" />,
    "LinkedIn": <FaLinkedin className="inline-block text-gray-600 dark:text-gray-400" />,
    "Evento": <FaCalendarAlt className="inline-block text-gray-600 dark:text-gray-400" />,
    "Outro": <FaEllipsisH className="inline-block text-gray-600 dark:text-gray-400" />,
  };

  const topOrigem = Object.entries(origemStats)
    .sort(([,a], [,b]) => b - a)[0];

  // Helper para verificar se um filtro está ativo
  const isActive = (filterType, filterValue = null) => {
    return activeFilter && activeFilter.type === filterType && activeFilter.value === filterValue;
  };

  // Dados dos cartões de estatística, com a adição de `filterType` e `filterValue`
  // para facilitar a passagem para `onFilterClick`
  const statsCardsData = [
    {
      label: 'Total de Leads',
      value: totalLeads,
      color: 'bg-blue-500 dark:bg-blue-600',
      icon: <FaUsers className="text-3xl text-white dark:text-gray-100" />,
      filterType: 'total', // Novo tipo de filtro
      filterValue: null // Nenhum valor específico para "total"
    },
    {
      label: 'Com E-mail',
      value: leadsWithEmail,
      color: 'bg-green-500 dark:bg-green-600',
      icon: <FaEnvelope className="text-3xl text-white dark:text-gray-100" />,
      filterType: 'email', // Novo tipo de filtro
      filterValue: true // Valor para "Com E-mail"
    },
    {
      label: 'Com Empresa',
      value: leadsWithCompany,
      color: 'bg-purple-500 dark:bg-purple-600',
      icon: <FaBuilding className="text-3xl text-white dark:text-gray-100" />,
      filterType: 'empresa', // Novo tipo de filtro
      filterValue: true // Valor para "Com Empresa"
    },
    {
      label: 'Principal Origem',
      value: topOrigem ? `${topOrigem[0]} (${topOrigem[1]})` : 'N/A',
      color: 'bg-orange-500 dark:bg-orange-600',
      icon: <FaChartBar className="text-3xl text-white dark:text-gray-100" />,
      filterType: 'origem', // Novo tipo de filtro
      filterValue: topOrigem ? topOrigem[0] : null // Valor para "Principal Origem"
    }
  ];

  // Ordenar as origens para exibição consistente
  const sortedOrigemStats = Object.entries(origemStats)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Visão Geral das Estatísticas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCardsData.map((stat, index) => (
          // Tornando o card clicável e adicionando feedback visual
          <button
            key={index}
            onClick={() => onFilterClick(stat.filterType, stat.filterValue)}
            className={`
              bg-white rounded-lg shadow-lg p-6 flex items-center justify-between
              transform transition-transform duration-200 hover:scale-105 cursor-pointer
              dark:bg-gray-800 dark:shadow-xl
              ${isActive(stat.filterType, stat.filterValue) ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
            `}
          >
            <div>
              <p className="text-sm text-gray-500 uppercase font-medium dark:text-gray-400">{stat.label}</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1 dark:text-gray-100">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-4 rounded-full text-white dark:text-gray-100`}>
              {stat.icon}
            </div>
          </button>
        ))}
      </div>

      {totalLeads > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 dark:bg-gray-800 dark:shadow-xl dark:text-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Leads por Origem</h3>
          {sortedOrigemStats.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Nenhum lead com origem definida.</p>
          ) : (
            <div className="space-y-4">
              {sortedOrigemStats.map(([origem, count]) => {
                const percentage = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : 0;
                const progressBarColor = {
                    "Site": "bg-blue-400 dark:bg-blue-500",
                    "Redes Sociais": "bg-purple-400 dark:bg-purple-500",
                    "Indicação": "bg-green-400 dark:bg-green-500",
                    "Google Ads": "bg-yellow-400 dark:bg-yellow-500",
                    "Facebook Ads": "bg-blue-400 dark:bg-blue-500",
                    "LinkedIn": "bg-indigo-400 dark:bg-indigo-500",
                    "Evento": "bg-red-400 dark:bg-red-500",
                    "Outro": "bg-gray-400 dark:bg-gray-500"
                }[origem] || "bg-gray-400 dark:bg-gray-500";

                return (
                  // Tornando cada item de origem clicável
                  <button
                    key={origem}
                    onClick={() => onFilterClick('origem', origem)}
                    className={`
                      flex items-center w-full p-2 rounded-lg transition-colors duration-200
                      hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${isActive('origem', origem) ? 'bg-gray-100 dark:bg-gray-700 ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                    `}
                  >
                    <div className="w-1/4 flex items-center text-gray-700 font-medium dark:text-gray-200">
                      {origemIcons[origem] || <FaEllipsisH className="inline-block text-gray-600 dark:text-gray-400 mr-1" />}
                      <span className="ml-2">{origem}</span>
                    </div>
                    <div className="w-2/4 bg-gray-200 rounded-full h-4 relative overflow-hidden dark:bg-gray-700">
                      <div
                        className={`${progressBarColor} h-4 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-1/4 text-right text-gray-700 font-semibold ml-4 dark:text-gray-200">
                      {count} ({percentage}%)
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {totalLeads === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-600 dark:bg-gray-800 dark:shadow-xl dark:text-gray-400">
          <p className="text-lg">Comece a adicionar leads para ver as estatísticas aqui!</p>
          <p className="text-sm mt-2">Os dados serão atualizados em tempo real.</p>
        </div>
      )}
    </>
  );
}

export default Stats;