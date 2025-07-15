function LeadList({ leads, onDelete }) {
  return (
    <div className="space-y-3">
      {leads.length === 0 && <p className="text-gray-500">Nenhum lead cadastrado ainda.</p>}
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="flex items-center justify-between border p-3 rounded bg-white shadow-sm"
        >
          <div>
            <p className="font-semibold">{lead.nome}</p>
            <p className="text-gray-600">{lead.telefone}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline"
            >
              WhatsApp
            </a>
            <button
              onClick={() => onDelete(lead.id)}
              className="text-red-500 hover:underline"
            >
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LeadList;
