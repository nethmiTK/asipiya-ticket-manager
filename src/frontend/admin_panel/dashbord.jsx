// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
// import Navbar from './components/Navbar';

const getStatusStyle = (status) => {
  switch (status) {
    case 'Open': return 'bg-red-500 text-white';
    case 'In Progress': return 'bg-blue-500 text-white';
    case 'Closed': return 'bg-green-500 text-white';
    default: return 'bg-gray-300';
  }
};

const getPriorityStyle = (priority) => {
  switch (priority) {
    case 'High': return 'bg-orange-400 text-white';
    case 'Medium': return 'bg-yellow-400 text-white';
    case 'Low': return 'bg-green-300 text-white';
    case 'Good': return 'bg-emerald-400 text-white';
    case 'Open': return 'bg-green-500 text-white';
    default: return 'bg-gray-300';
  }
};

const DashboardPage = () => {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/tickets') // Update with your actual backend endpoint
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error('Error fetching tickets:', err));
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    return (
      (statusFilter ? ticket.status === statusFilter : true) &&
      (priorityFilter ? ticket.priority === priorityFilter : true) &&
      (searchTerm ? ticket.client.toLowerCase().includes(searchTerm.toLowerCase()) : true)
    );
  });

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Tickets</h2>
        <div className="flex space-x-4 mb-4">
          <select
            className="border rounded p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            className="border rounded p-2"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input
            type="text"
            className="border rounded p-2"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-md shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">System</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="py-2 px-4">{ticket.id}</td>
                  <td className="py-2 px-4">{ticket.client}</td>
                  <td className="py-2 px-4">{ticket.system}</td>
                  <td className="py-2 px-4">{ticket.category}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityStyle(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-2 px-4">{ticket.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
