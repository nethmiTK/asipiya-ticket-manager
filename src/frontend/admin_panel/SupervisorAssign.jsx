import React, { useEffect, useRef, useState } from 'react';
import axiosClient from '../axiosClient'; // Changed from axios to axiosClient
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
  const [selectedSupervisors, setSelectedSupervisors] = useState([]);
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('Low');
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const id = ticketId || params.id;

  useEffect(() => {
    // Use axiosClient and remove base URL
    axiosClient.get(`/api/ticket_view/${id}`)
      .then(res => {
        setTicketData(res.data);

        const validStatuses = ['Open', 'In Progress', 'Resolved'];
        const validPriorities = ['Low', 'Medium', 'High'];

        setStatus(validStatuses.includes(res.data.Status) ? res.data.Status : 'Open');
        setPriority(validPriorities.includes(res.data.Priority) ? res.data.Priority : 'Low');

        const supervisorStr = res.data.SupervisorID || '';
        const ids = supervisorStr.split(',').map(id => id.trim()).filter(Boolean);
        setSelectedSupervisors(ids);
      })
      .catch(err => {
        console.error('Error fetching ticket:', err);
        toast.error('Failed to load ticket data.');
      });

    // Use axiosClient and remove base URL
    axiosClient.get('/api/supervisors')
      .then(res => {
        if (Array.isArray(res.data)) {
          setSupervisors(res.data);
        } else {
          console.error("Expected array but got:", res.data);
          toast.error('Failed to load supervisor data.');
        }
      })
      .catch(err => {
        console.error('Error fetching supervisors:', err);
        toast.error('Failed to load supervisor data.');
      });
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAssign = () => {
    if (!selectedSupervisors.length) {
      toast.error("Please select at least one supervisor.");
      return;
    }

    // Use axiosClient and remove base URL
    axiosClient.put(`/api/tickets/${id}/assign`, {
      supervisorId: selectedSupervisors.join(','),
      status,
      priority,
      assignerId: user.UserID
    })
      .then(response => {
        if (response.data.status === 'success') {
          toast.success('Supervisors assigned successfully!');
          if (!ticketId) navigate(-1);
        } else {
          throw new Error(response.data.message || 'Failed to assign supervisors');
        }
      })
      .catch(err => {
        console.error('Error assigning supervisors:', err);
        toast.error(err.response?.data?.message || err.message || 'Failed to assign supervisors.');
      });
  };

  if (!ticketData) return <div className="p-4">Loading...</div>;

  const content = (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Assign Supervisor(s) for Ticket ID: {id}
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
                  status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
              }`}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Supervisor dropdown with checkbox */}
        <div ref={dropdownRef} className="relative">
          <label className="block font-medium mb-2">Supervisor Name(s)</label>

          {/* Toggle box */}
          <div
            onClick={() => setOpenDropdown(!openDropdown)}
            className="w-full px-4 py-2 border border-gray-300 rounded cursor-pointer bg-white"
          >
            {selectedSupervisors.length > 0
              ? supervisors
                  .filter((u) => selectedSupervisors.includes(String(u.UserID)))
                  .map((u) => u.FullName)
                  .join(', ')
              : 'Select supervisors'}
          </div>

          {/* Dropdown content */}
          {openDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-35 overflow-y-auto">
              {supervisors.map((sUser) => { // Renamed 'user' to 'sUser' to avoid conflict with 'user' from useAuth
                const userIdStr = String(sUser.UserID);
                return (
                  <label key={sUser.UserID} className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      value={userIdStr}
                      checked={selectedSupervisors.includes(userIdStr)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedSupervisors([...selectedSupervisors, value]);
                        } else {
                          setSelectedSupervisors(
                            selectedSupervisors.filter((id) => id !== value)
                          );
                        }
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600 mr-2"
                    />
                    {sUser.FullName}
                  </label>
                );
              })}
            </div>
          )}
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
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
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

  return ticketId ? content : (
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