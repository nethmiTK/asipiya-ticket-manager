import React, { useState, useEffect } from 'react';
import axiosClient from '../axiosClient'; // Changed from axios to axiosClient
  
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { X } from 'lucide-react';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import AdminNavBar from '../../user_components/NavBar/AdminNavBar';
import NotificationPanel from '../components/NotificationPanel';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

const TicketCategory = () => {
  const [form, setForm] = useState({ CategoryName: '', Description: '', Status: '1' });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Navbar + Notifications
  const navigate = useNavigate();
  const { loggedInUser: user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const notificationRef = useRef(null);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchCategories = async () => {
    try {
      // Use axiosClient and remove base URL
      const res = await axiosClient.get('/ticket_category');
      setCategories(res.data);
    } catch (error) {
      setError('Error fetching categories: ' + error.message);
      toast.error('Failed to fetch categories.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        // Use axiosClient and remove base URL
        await axiosClient.put(`/api/ticket_category_update/${editingId}`, form);
        toast.success('Category updated successfully.');
      } else {
        // Use axiosClient and remove base URL
        await axiosClient.post('/api/ticket_category', { ...form, Status: '1' });
        toast.success('Category added successfully.');
      }

      setForm({ CategoryName: '', Description: '', Status: '1' });
      setEditingId(null);
      setIsModalOpen(false);
      await fetchCategories(); // Re-fetch categories to update the list
    } catch (error) {
      setError('Submit Error: ' + (error.response?.data?.message || error.message));
      toast.error(error.response?.data?.message || 'Failed to submit category data.');
    }
  };

  const handleEdit = (category) => {
    setForm({
      CategoryName: category.CategoryName || '',
      Description: category.Description || '',
      Status: category.Status?.toString() || '1'
    });
    setEditingId(category.TicketCategoryID);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      // Use axiosClient and remove base URL
      const res = await axiosClient.delete(`/api/ticket_category_delete/${confirmDeleteId}`);
      toast.success(res.data.message || 'Category deleted successfully.');
      await fetchCategories(); // Re-fetch categories after successful deletion
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("This category is already in use and cannot be deleted.");
      } else {
        setError("Delete Error: " + (error.response?.data?.message || error.message));
        toast.error("Failed to delete category: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <AdminNavBar
        pageTitle="Ticket Category"
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
            <h2 className="text-2xl font-bold">Ticket Category Management</h2>
            <button
              onClick={() => {
                setForm({ CategoryName: '', Description: '', Status: '1' });
                setEditingId(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add New
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          )}

          <table className="table-fixed w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="w-20 p-2 text-left">Category ID</th>
                <th className="w-44 p-2 text-left">Category Name</th>
                <th className="w-[500px] p-2 text-left">Description</th>
                <th className="w-24 p-2 text-left">Status</th>
                <th className="w-24 p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCategories.map((category) => (
                <tr key={category.TicketCategoryID}>
                  <td className="p-2">{category.TicketCategoryID}</td>
                  <td className="p-2">{category.CategoryName}</td>
                  <td className="p-2">{category.Description}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 text-sm font-semibold rounded 
                      ${parseInt(category.Status) === 1 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-600'}`}>
                      {parseInt(category.Status) === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-2">
                    <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800 mr-4"><FaEdit /></button>
                    <button onClick={() => handleDelete(category.TicketCategoryID)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                  </td>
                </tr>
              ))}
              {currentCategories.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">No categories available</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {categories.length > 0 && (
            <div className="flex justify-end items-center mt-4 p-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm">Entries per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="p-2 border border-gray-300 rounded-md text-sm"
                >
                  {[5, 10, 20, 50].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <span className="text-gray-700 text-sm">
                  {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, categories.length)} of ${categories.length}`}
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

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-lg relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black"><X /></button>
              <h3 className="text-xl font-semibold mb-4">{editingId ? 'Update Category' : 'Add Category'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Category Name</label>
                  <input
                    type="text"
                    name="CategoryName"
                    value={form.CategoryName}
                    onChange={handleChange}
                    className="border rounded px-4 py-2 w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="Description"
                    rows="4"
                    value={form.Description}
                    onChange={handleChange}
                    className="border rounded px-4 py-2 w-full"
                    required
                  />
                </div>
                {editingId && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      name="Status"
                      value={form.Status}
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
                      setIsModalOpen(false);
                      setEditingId(null);
                      setForm({ CategoryName: '', Description: '', Status: '1' });
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

        {/* Confirm Delete Modal */}
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
              <h4 className="text-lg font-semibold mb-4">Are you sure you want to delete this category?</h4>
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

export default TicketCategory;
