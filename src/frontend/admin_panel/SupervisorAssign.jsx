import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import { toast } from 'react-toastify';
import { IoArrowBack } from 'react-icons/io5';
import { useAuth } from '../../App.jsx';

const SupervisorAssignPage = ({ ticketId }) => {
  const params = useParams();
  const navigate = useNavigate();
  const { loggedInUser: user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('Low');

  const id = ticketId || params.id;

  useEffect(() => {
    axios.get(`http://localhost:5000/api/ticket_view/${id}`)
      .then(res => {
        setTicketData(res.data);
        setStatus(res.data.Status || 'Open');
        setPriority(res.data.Priority || 'Low');
        setSelectedSupervisor(res.data.SupervisorName || '');
      })
      .catch(err => console.error('Error fetching ticket:', err));

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
      toast.error("Please select a supervisor.");
      return;
    }

    const supervisor = supervisors.find(s => s.UserID.toString() === selectedSupervisor.toString());
    if (!supervisor) {
      toast.error("Selected supervisor not found.");
      return;
    }

    const finalStatus = ['Open', 'In Progress', 'Resolved'].includes(status) ? status : 'Open';

    axios.put(`http://localhost:5000/api/tickets/${id}/assign`, {
      supervisorId: selectedSupervisor,
      status: finalStatus,
      priority,
      assignerId: user.UserID
    })
    .then(response => {
      if (response.data.status === 'success') {
        toast.success('Supervisor assigned successfully!');
        if (!ticketId) {
          navigate(-1);
        }
      } else {
        throw new Error(response.data.message || 'Failed to assign supervisor');
      }
    })
    .catch(err => {
      console.error('Error assigning supervisor:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to assign supervisor.');
    });
  };

  if (!ticketData) return <div className="p-4">Loading...</div>;

  const content = (
    <div className="space-y-4">
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
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full mt-1 px-4 py-2 border rounded border-gray-300 appearance-none
                ${status === 'Open' ? 'bg-blue-100 text-blue-800' :
                  status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'Resolved' ? 'bg-green-100  text-green-800' :
                  'bg-blue-100 text-blue-800' // fallback/default blue
                }`}
            >
              <option className="bg-white text-gray-800" value="Open">Open</option>
              <option className="bg-white text-gray-800" value="In Progress">In Progress</option>
              <option className="bg-white text-gray-800" value="Resolved">Resolved</option>
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
            className={`w-full mt-1 px-4 py-2 border rounded appearance-none
              ${priority === 'Low' ? 'bg-green-100 border-green-300 text-green-800' :
                priority === 'Medium' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                priority === 'High' ? 'bg-red-100 border-red-300 text-red-800' :
                'bg-white border-gray-300 text-gray-700'
              }`}
          >
            <option className="bg-white text-gray-800" value="Low">Low</option>
            <option className="bg-white text-gray-800" value="Medium">Medium</option>
            <option className="bg-white text-gray-800" value="High">High</option>
          </select>
        </div>

      </div>

      <div className="mt-8 flex justify-end">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          onClick={handleAssign}
        >
          Assign
        </button>
      </div>
    </div>
  );

  if (ticketId) {
    return content;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl w-full relative">
        <button
          onClick={() => navigate(-1)}
          title="Back"
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <IoArrowBack size={20} />
          Back
        </button>
        {content}
      </div>
    </div>
  );
};

export default SupervisorAssignPage;
