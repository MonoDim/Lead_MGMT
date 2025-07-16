// lead-manager-frontend/src/components/Stats.jsx

import {
  FaUsers, // Total de Leads
  FaEnvelope, // Com E-mail
  FaBuilding, // Com Empresa
  FaChartBar, // Principal Origem
  FaGlobe, FaShareAlt, FaGoogle, FaFacebook, FaLinkedin, FaCalendarAlt, FaEllipsisH // Ícones para Origens
} from 'react-icons/fa'; // Usando Font Awesome como exemplo

function Stats({ leads }) {
  const totalLeads = leads.length;
  const leadsWithEmail = leads.filter(lead => lead.email).length;
  const leadsWithCompany = leads.filter(lead => lead.empresa).length;

  const origemStats = leads.reduce((acc, lead) => {
    if (lead.origem) {
      acc[lead.origem] = (acc[lead.origem] || 0) + 1;
    }
    return acc;
  }, {});

  // Mapeamento de origens para ícones (com dark:text para consistência)
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

  // Adicionando dark:color para os ícones e dark:bg para os cards
  const statsCardsData = [
    {
      label: 'Total de Leads',
      value: totalLeads,
      color: 'bg-blue-500 dark:bg-blue-600', // Cor do fundo do ícone
      icon: <FaUsers className="text-3xl text-white dark:text-gray-100" /> // Cor do ícone
    },
    {
      label: 'Com E-mail',
      value: leadsWithEmail,
      color: 'bg-green-500 dark:bg-green-600',
      icon: <FaEnvelope className="text-3xl text-white dark:text-gray-100" />
    },
    {
      label: 'Com Empresa',
      value: leadsWithCompany,
      color: 'bg-purple-500 dark:bg-purple-600',
      icon: <FaBuilding className="text-3xl text-white dark:text-gray-100" />
    },
    {
      label: 'Principal Origem',
      value: topOrigem ? `${topOrigem[0]} (${topOrigem[1]})` : 'N/A',
      color: 'bg-orange-500 dark:bg-orange-600',
      icon: <FaChartBar className="text-3xl text-white dark:text-gray-100" />
    }
  ];

  // Ordenar as origens para exibição consistente
  const sortedOrigemStats = Object.entries(origemStats)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  return (
    <>
      {/* Título da seção de stats */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Visão Geral das Estatísticas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCardsData.map((stat, index) => (
          // Card de estatística
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-between transform transition-transform duration-200 hover:scale-105
                                      dark:bg-gray-800 dark:shadow-xl"> {/* Adicionado dark:bg e dark:shadow */}
            <div>
              <p className="text-sm text-gray-500 uppercase font-medium dark:text-gray-400">{stat.label}</p> {/* Texto menor, cinza e maiúsculo */}
              <p className="text-3xl font-extrabold text-gray-900 mt-1 dark:text-gray-100">{stat.value}</p> {/* Valor maior e mais forte */}
            </div>
            <div className={`${stat.color} p-4 rounded-full text-white dark:text-gray-100`}> {/* Padding do ícone um pouco maior */}
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {totalLeads > 0 && (
        // Seção "Leads por Origem"
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 dark:bg-gray-800 dark:shadow-xl dark:text-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Leads por Origem</h3>
          {sortedOrigemStats.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Nenhum lead com origem definida.</p>
          ) : (
            <div className="space-y-4">
              {sortedOrigemStats.map(([origem, count]) => {
                const percentage = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : 0;
                // Definir uma cor da barra de progresso baseada na origem ou padrão
                const progressBarColor = {
                    "Site": "bg-blue-400 dark:bg-blue-500",
                    "Redes Sociais": "bg-purple-400 dark:bg-purple-500",
                    "Indicação": "bg-green-400 dark:bg-green-500",
                    "Google Ads": "bg-yellow-400 dark:bg-yellow-500",
                    "Facebook Ads": "bg-blue-400 dark:bg-blue-500",
                    "LinkedIn": "bg-indigo-400 dark:bg-indigo-500",
                    "Evento": "bg-red-400 dark:bg-red-500",
                    "Outro": "bg-gray-400 dark:bg-gray-500"
                }[origem] || "bg-gray-400 dark:bg-gray-500"; // Fallback para cinza

                return (
                  <div key={origem} className="flex items-center">
                    <div className="w-1/4 flex items-center text-gray-700 font-medium dark:text-gray-200">
                      {origemIcons[origem] || <FaEllipsisH className="inline-block text-gray-600 dark:text-gray-400 mr-1" />}
                      <span className="ml-2">{origem}</span>
                    </div>
                    <div className="w-2/4 bg-gray-200 rounded-full h-4 relative overflow-hidden dark:bg-gray-700"> {/* Fundo da barra de progresso */}
                      <div
                        className={`${progressBarColor} h-4 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-1/4 text-right text-gray-700 font-semibold ml-4 dark:text-gray-200">
                      {count} ({percentage}%)
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Estado para quando não há leads */}
      {totalLeads === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-600
                        dark:bg-gray-800 dark:shadow-xl dark:text-gray-400"> {/* Adicionado dark:bg, dark:shadow, dark:text */}
          <p className="text-lg">Comece a adicionar leads para ver as estatísticas aqui!</p>
          <p className="text-sm mt-2">Os dados serão atualizados em tempo real.</p>
        </div>
      )}
    </>
  );
}

export default Stats;