import { useEffect, useState } from 'react';
import axios from 'axios';
import LeadForm from './components/LeadForm';
import LeadList from './components/LeadList';

function App() {
  const [leads, setLeads] = useState([]);

  const fetchLeads = async () => {
    const res = await axios.get('http://localhost:3000/leads');
    setLeads(res.data);
  };

  const addLead = async (lead) => {
    await axios.post('http://localhost:3000/leads', lead);
    fetchLeads();
  };

  const deleteLead = async (id) => {
    await axios.delete(`http://localhost:3000/leads/${id}`);
    fetchLeads();
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Gerenciador de Leads</h1>
      <LeadForm onAdd={addLead} />
      <LeadList leads={leads} onDelete={deleteLead} />
    </div>
  );
}

export default App;
