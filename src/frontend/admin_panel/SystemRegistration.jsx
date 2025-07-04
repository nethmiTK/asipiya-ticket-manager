import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosClient from '../axiosClient';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FileText, AlignLeft, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import AdminNavBar from '../../user_components/NavBar/AdminNavBar';
import NotificationPanel from '../components/NotificationPanel';
import { useAuth } from '../../App';

const SystemRegistration = () => {
  const [form, setForm] = useState({ systemName: '', description: '', status: '1' });
  const [systems, setSystems] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Notifications and Auth
  const { loggedInUser: user } = useAuth();
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!user?.UserID) return;
    try {
      const res = await axiosClient.get(`/api/notifications/count/${user.UserID}`);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchSystems = async () => {
    try {
      const res = await axiosClient.get('/api/system_registration');
      setSystems(res.data);
    } catch (error) {
      setError('Error fetching systems: ' + error.message);
      toast.error('Failed to fetch systems.');
    }
  };

  useEffect(() => {
    fetchSystems();
  }, [editingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        await axiosClient.put(`/api/system_registration_update/${editingId}`, form);
        toast.success('System updated successfully.');

        setSystems((prev) =>
          prev.map((sys) =>
            sys.AsipiyaSystemID === editingId ? { ...sys, ...form } : sys
          )
        );
      } else {
        const newSystem = { ...form, status: '1' };
        await axiosClient.post('/api/systems', newSystem);
        toast.success('System added successfully.');
      }

      setForm({ systemName: '', description: '', status: '1' });
      setEditingId(null);
      setShowModal(false);
    } catch (error) {
      setError('Submit Error: ' + (error.response?.data?.message || error.message));
      toast.error(error.response?.data?.message || 'Failed to submit system data.');
    }
  };

  const handleEdit = (system) => {
    setForm({
      systemName: system.SystemName || '',
      description: system.Description || '',
      status: system.Status?.toString() || '1',
    });
    setEditingId(system.AsipiyaSystemID);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSystems = systems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(systems.length / itemsPerPage);
  const paginate = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const confirmDelete = async () => {
    try {
      const res = await axiosClient.delete(`/api/system_registration_delete/${confirmDeleteId}`);
      toast.success(res.data.message || 'System deleted successfully.');
      await fetchSystems();
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
        pageTitle="System Registration Management"
        user={user}
        sidebarOpen={isSidebarOpen}
        onProfileClick={() => navigate('/admin-profile')}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        unreadNotifications={unreadNotifications}
        showNotifications={showNotifications}
        notificationRef={notificationRef}
      />

      <div className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {showNotifications && (
          <div ref={notificationRef} className="absolute right-4 top-16 z-50">
            <NotificationPanel
              userId={user?.UserID}
              role={user?.Role}
              onClose={() => setShowNotifications(false)}
              onNotificationUpdate={fetchUnreadNotifications}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mt-10">
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
                <th className="w-20 p-2 text-left text-xs md:text-sm">System ID</th>
                <th className="w-64 p-2 text-left text-xs md:text-sm">System Name</th>
                <th className="w-[500px] p-2 text-left text-xs md:text-sm">Description</th>
                <th className="w-24 p-2 text-left text-xs md:text-sm">Status</th>
                <th className="w-24 p-2 text-left text-xs md:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSystems.map((system) => (
                <tr key={system.AsipiyaSystemID}>
                  <td className="p-2 text-xs md:text-sm">{system.AsipiyaSystemID}</td>
                  <td className="p-2 text-xs md:text-sm">{system.SystemName}</td>
                  <td className="p-2 text-xs md:text-sm">{system.Description}</td>
                  <td className="p-2 text-xs md:text-sm">
                    <span className={`px-2 py-1 text-sm font-semibold rounded 
                      ${parseInt(system.Status) === 1 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-600'}`}>
                      {parseInt(system.Status) === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-2 text-xs md:text-sm">
                    <button
                      onClick={() => handleEdit(system)}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(system.AsipiyaSystemID)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* Add / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-lg relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                <X />
              </button>
              <h3 className="text-xl font-semibold mb-4">{editingId ? 'Update System' : 'Add System'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">System Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <FileText size={16} />
                    </span>
                    <input
                      type="text"
                      name="systemName"
                      value={form.systemName}
                      onChange={handleChange}
                      className="border rounded px-4 py-2 w-full pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <div className="relative">
                    <span className="absolute top-3 left-3 text-gray-400">
                      <AlignLeft size={16} />
                    </span>
                    <textarea
                      name="description"
                      rows="4"
                      value={form.description}
                      onChange={handleChange}
                      className="border rounded px-4 py-2 w-full pl-10"
                      required
                    />
                  </div>
                </div>
                {editingId && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="border rounded px-4 py-2 w-full"
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                )}
                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    {editingId ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                      setForm({ systemName: '', description: '', status: '1' });
                    }}
                    className="ml-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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

        {/* Confirm Delete Modal */}
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
              <h4 className="text-lg font-semibold mb-4">Are you sure you want to delete this system?</h4>
              <div className="flex justify-center gap-4">
                <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Yes, Delete</button>
                <button onClick={() => setConfirmDeleteId(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemRegistration;