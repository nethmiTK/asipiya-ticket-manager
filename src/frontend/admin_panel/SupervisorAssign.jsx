import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';

const SupervisorAssignPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [status, setStatus] = useState('Pending');
  const [priority, setPriority] = useState('Low');

  useEffect(() => {
    // Fetch ticket data
    axios.get(`http://localhost:5000/api/ticket_view/${id}`)
      .then(res => {
        setTicketData(res.data);
        setStatus(res.data.Status || 'Pending');
        setPriority(res.data.Priority || 'Low');
        setSelectedSupervisor(res.data.SupervisorName || '');
      })
      .catch(err => console.error('Error fetching ticket:', err));

    // Fetch supervisors
    axios.get('http://localhost:5000/api/supervisors')
      .then(res => {
        if (Array.isArray(res.data)) {
          setSupervisors(res.data);
        } else {
          console.error("Expected array but got:", res.data);
        }
      })
      .catch(err => console.error('Error fetching supervisors:', err));
  }, [id]);

  const handleAssign = () => {
  if (!selectedSupervisor) {
    alert("Please select a supervisor.");
    return;
  }

  axios.put(`http://localhost:5000/api/tickets/${id}/assign`, {
    supervisorId: selectedSupervisor, // now it's the ID
    status,
    priority,
  })
  .then(() => {
    alert('Supervisor assigned successfully!');
    // Optional: redirect or update state
  })
  .catch(err => {
    console.error('Error assigning supervisor:', err);
    alert('Failed to assign supervisor.');
  });
};


  if (!ticketData) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen}/>
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Assign Supervisor for Ticket ID: {id}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium">System Name</label>
            <input
              type="text"
              value={ticketData.SystemName || ''}
              readOnly
              className="w-full mt-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Description</label>
            <textarea
              value={ticketData.Description || ''}
              readOnly
              rows="3"
              className="w-full mt-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded resize-none"
            />
          </div>

          <div>
            <label className="block font-medium">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded"
            >
              <option value="Pending">Pending</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Supervisor Name</label>
            <select
              value={selectedSupervisor}
              onChange={e => setSelectedSupervisor(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded"
            >
              <option value="">Select supervisor</option>
              {supervisors.map((user) => (
                <option key={user.UserID} value={user.UserID}>
                  {user.FullName}
                </option>
              ))}
            </select>

          </div>

          <div>
            <label className="block font-medium">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            onClick={handleAssign}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupervisorAssignPage;
