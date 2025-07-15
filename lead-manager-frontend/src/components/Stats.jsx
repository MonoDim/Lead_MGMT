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

  const topOrigem = Object.entries(origemStats)
    .sort(([,a], [,b]) => b - a)[0];

  const stats = [
    {
      label: 'Total de Leads',
      value: totalLeads,
      color: 'bg-blue-500',
      icon: '👥'
    },
    {
      label: 'Com E-mail',
      value: leadsWithEmail,
      color: 'bg-green-500',
      icon: '📧'
    },
    {
      label: 'Com Empresa',
      value: leadsWithCompany,
      color: 'bg-purple-500',
      icon: '🏢'
    },
    {
      label: 'Principal Origem',
      value: topOrigem ? `${topOrigem[0]} (${topOrigem[1]})` : 'N/A',
      color: 'bg-orange-500',
      icon: '📊'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-full text-white text-xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Stats;