 import React, { useState, useEffect } from 'react';
import axiosClient from '../axiosClient'; // Changed from axios to axiosClient
 
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import AdminNavBar from '../../user_components/NavBar/AdminNavBar';
import NotificationPanel from '../components/NotificationPanel';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FileText, AlignLeft, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

const SystemRegistration = () => {
  const [form, setForm] = useState({ systemName: '', description: '', status: '1' });
  const [systems, setSystems] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Notification and Auth
  const { loggedInUser: user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Notification click outside close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!user?.UserID) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/count/${user.UserID}`);
      setUnreadNotifications(res.data.count);
    } catch (error) {
      console.error("Error fetching unread notifications", error);
    }
  }, [user?.UserID]);

  useEffect(() => {
    if (user?.UserID) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadNotifications]);

  const handleNotificationPanelUpdate = () => {
    fetchUnreadNotifications();
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSystems = systems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(systems.length / itemsPerPage);
  const paginate = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchSystems = async () => {
    try {
      // Use axiosClient and remove base URL
      const res = await axiosClient.get('/system_registration');
      setSystems(res.data);
    } catch (error) {
      setError('Error fetching systems: ' + error.message);
      toast.error('Failed to fetch systems.');
    }
  };

  useEffect(() => {
    fetchSystems();
  }, [editingId]); // Re-fetch when editingId changes (after add/edit)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        // Use axiosClient and remove base URL
        await axiosClient.put(`/api/system_registration_update/${editingId}`, form);
        toast.success('System updated successfully.');
      } else {
        const newSystem = { ...form, status: '1' };
        // Use axiosClient and remove base URL
        await axiosClient.post('/api/systems', newSystem);
        toast.success('System added successfully.');
      }

      setForm({ systemName: '', description: '', status: '1' });
      setEditingId(null);
      setShowModal(false);
      // No need to call fetchSystems here, useEffect will handle it based on editingId change
    } catch (error) {
      setError('Submit Error: ' + (error.response?.data?.message || error.message));
      toast.error(error.response?.data?.message || 'Failed to submit system data.');
    }
  };

  const handleEdit = (system) => {
    setForm({
      systemName: system.SystemName || '',
      description: system.Description || '',
      status: system.Status !== undefined ? system.Status.toString() : '1'
    });
    setEditingId(system.AsipiyaSystemID);
    setShowModal(true);
  };

  const handleDelete = (id) => setConfirmDeleteId(id);

  const confirmDelete = async () => {
    try {
      // Use axiosClient and remove base URL
      const res = await axiosClient.delete(`/api/system_registration_delete/${confirmDeleteId}`);
      toast.success(res.data.message || 'System deleted successfully.');
      await fetchSystems(); // Re-fetch after successful deletion
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("This system is already in use and cannot be deleted.");
      } else {
        setError("Delete Error: " + (error.response?.data?.message || error.message));
        toast.error("Failed to delete system: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <AdminNavBar
        pageTitle="System Registration"
        user={user}
        sidebarOpen={isSidebarOpen}
        onProfileClick={() => navigate('/admin-profile')}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        unreadNotifications={unreadNotifications}
        showNotifications={showNotifications}
        notificationRef={notificationRef}
      />
      <div className={`flex-1 min-h-screen bg-white p-8 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}>
        {showNotifications && (
          <div ref={notificationRef} className="absolute right-4 top-16 z-50">
            <NotificationPanel
              userId={user?.UserID}
              role={user?.Role}
              onClose={() => setShowNotifications(false)}
              onNotificationUpdate={handleNotificationPanelUpdate}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">System Registration Management</h2>
            <button
              onClick={() => {
                setForm({ systemName: '', description: '', status: '1' });
                setEditingId(null);
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add New
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <table className="table-fixed w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left w-20">System ID</th>
                <th className="p-2 text-left w-64">System Name</th>
                <th className="p-2 text-left  w-[500px]">Description</th>
                <th className="p-2 text-left w-24">Status</th>
                <th className="p-2 text-left w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSystems.map((system) => (
                <tr key={system.AsipiyaSystemID} className="border-t">
                  <td className="p-2">{system.AsipiyaSystemID}</td>
                  <td className="p-2">{system.SystemName}</td>
                  <td className="p-2">{system.Description}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 text-sm font-semibold rounded 
                      ${parseInt(system.Status) === 1 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-600'}`}>
                      {parseInt(system.Status) === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleEdit(system)}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(system.AsipiyaSystemID)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {currentSystems.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">No systems found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {systems.length > 0 && (
            <div className="flex justify-end items-center mt-4 p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Entries per page:</span>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="border p-2 rounded text-sm">
                  {[5, 10, 20, 50].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">
                  {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, systems.length)} of ${systems.length}`}
                </span>
                <button onClick={() => paginate(1)} disabled={currentPage === 1} className="btn-page">&lt;&lt;</button>
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="btn-page">&lt;</button>
                <span className="text-sm">{currentPage}</span>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="btn-page">&gt;</button>
                <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} className="btn-page">&gt;&gt;</button>
              </div>
            </div>
          )}
        </div>

        {/* Reuse your existing modals (showModal & confirmDeleteId) here */}
        {/* ... [Modal & Delete Confirmation Code - unchanged] ... */}
      </div>
    </div>
  );
};

export default SystemRegistration;