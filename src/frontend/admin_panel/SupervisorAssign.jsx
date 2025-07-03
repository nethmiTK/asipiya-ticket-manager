import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoArrowBack } from 'react-icons/io5';

import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import AdminNavBar from '../../user_components/NavBar/AdminNavBar';
import NotificationPanel from '../components/NotificationPanel';
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const id = ticketId || params.id;

  // Fetch ticket and supervisor data
  useEffect(() => {
    axios.get(`http://localhost:5000/api/ticket_view/${id}`)
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

  // Handle dropdown/notification outside clicks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread notifications
  const fetchUnreadNotifications = useCallback(async () => {
    if (!user?.UserID) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/count/${user.UserID}`);
      setUnreadNotifications(res.data.count);
    } catch (error) {
      console.error("Notification count error:", error);
    }
  }, [user?.UserID]);

  useEffect(() => {
    if (user?.UserID) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadNotifications]);

  const handleAssign = () => {
    if (!selectedSupervisors.length) {
      toast.error("Please select at least one supervisor.");
      return;
    }

    axios.put(`http://localhost:5000/api/tickets/${id}/assign`, {
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

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <AdminNavBar
        pageTitle="Assign Supervisors"
        user={user}
        sidebarOpen={isSidebarOpen}
        onProfileClick={() => navigate("/admin-profile")}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        unreadNotifications={unreadNotifications}
        showNotifications={showNotifications}
        notificationRef={notificationRef}
      />

      <main className={`flex-1 min-h-screen bg-gray-100 pt-16 px-6 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}>
        {showNotifications && (
          <div ref={notificationRef} className="absolute right-6 top-16 z-50">
            <NotificationPanel
              userId={user?.UserID}
              role={user?.Role}
              onClose={() => setShowNotifications(false)}
              onNotificationUpdate={fetchUnreadNotifications}
            />
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow max-w-2xl mt-8 mx-auto space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <IoArrowBack className="mr-2" /> Back
          </button>

          <h2 className="text-2xl font-semibold text-center mb-6">
            Assign Supervisor(s) for Ticket ID: {id}
          </h2>
          {/* System Name */}
          <div>
            <label className="block font-medium">System Name</label>
            <input
              type="text"
              value={ticketData.SystemName || ''}
              readOnly
              className="w-full mt-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium">Description</label>
            <textarea
              value={ticketData.Description || ''}
              readOnly
              rows="3"
              className="w-full mt-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full mt-1 px-4 py-2 border rounded
                ${status === 'Open' ? 'bg-blue-100 text-blue-800' :
                  status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'}`}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Supervisor Dropdown */}
          <div ref={dropdownRef} className="relative">
            <label className="block font-medium mb-2">Supervisor Name(s)</label>
            <div
              onClick={() => setOpenDropdown(!openDropdown)}
              className="w-full px-4 py-2 border border-gray-300 rounded bg-white cursor-pointer"
            >
              {selectedSupervisors.length > 0
                ? supervisors
                    .filter((u) => selectedSupervisors.includes(String(u.UserID)))
                    .map((u) => u.FullName)
                    .join(', ')
                : 'Select supervisors'}
            </div>

            {openDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-40 overflow-y-auto">
                {supervisors.map((user) => {
                  const userIdStr = String(user.UserID);
                  return (
                    <label key={user.UserID} className="flex items-center px-4 py-2 hover:bg-gray-100">
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
                      {user.FullName}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block font-medium">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className={`w-full mt-1 px-4 py-2 border rounded
                ${priority === 'Low' ? 'bg-green-100 text-green-800' :
                  priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Assign Button */}
          <div className="flex justify-end pt-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              onClick={handleAssign}
            >
              Assign
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupervisorAssignPage;
