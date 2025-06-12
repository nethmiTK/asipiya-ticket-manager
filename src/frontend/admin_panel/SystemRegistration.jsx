import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FileText, AlignLeft, X } from 'lucide-react';
import { toast } from 'react-toastify';

const SystemRegistration = () => {
  const [form, setForm] = useState({ systemName: '', description: '' });
  const [systems, setSystems] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // new state

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchSystems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/system_registration');
      setSystems(res.data);
    } catch (error) {
      setError('Error fetching systems: ' + error.message);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/system_registration_update/${editingId}`, form);
        toast.success('System updated successfully.');
      } else {
        await axios.post('http://localhost:5000/system_registration', form);
        toast.success('System added successfully.');
      }

      setForm({ systemName: '', description: '' });
      setEditingId(null);
      setShowModal(false);
      fetchSystems();
    } catch (error) {
      setError('Submit Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (system) => {
    setForm({
      systemName: system.SystemName,
      description: system.Description,
    });
    setEditingId(system.AsipiyaSystemID);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/system_registration_delete/${confirmDeleteId}`);
      toast.success(res.data.message || 'System deleted successfully.');
      fetchSystems();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("This system is already in use and cannot be deleted.");
      } else {
        setError("Delete Error: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">System Registration Management</h2>
            <button
              onClick={() => {
                setForm({ systemName: '', description: '' });
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

          <table className="w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">System ID</th>
                <th className="p-2">System Name</th>
                <th className="p-2">Description</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {systems.map((system) => (
                <tr key={system.AsipiyaSystemID} className="border-t">
                  <td className="p-2">{system.AsipiyaSystemID}</td>
                  <td className="p-2">{system.SystemName}</td>
                  <td className="p-2">{system.Description}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 text-sm font-semibold rounded ${system.Status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {system.Status}
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
            </tbody>
          </table>
        </div>

        {/* Add / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Name</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    {editingId ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                      setForm({ systemName: '', description: '' });
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
              <h4 className="text-lg font-semibold mb-4">Are you sure you want to delete this system?</h4>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemRegistration;
