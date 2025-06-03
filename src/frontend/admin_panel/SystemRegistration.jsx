import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';

const SystemRegistration = () => {
  const [form, setForm] = useState({ systemName: '', description: '' });
  const [systems, setSystems] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    setSuccess(null);
    setError(null);

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/system_registration_update/${editingId}`, form);
        setSuccess('System updated successfully.');
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/system_registration', form);
        setSuccess('System added successfully.');
      }

      setForm({ systemName: '', description: '' });
      fetchSystems(); // Refresh list
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this system?")) return;

    setSuccess(null);
    setError(null);

    try {
      const res = await axios.delete(`http://localhost:5000/api/system_registration_delete/${id}`);
      setSuccess(res.data.message || 'System deleted successfully.');
      fetchSystems(); // Refresh list
    } catch (error) {
      if (error.response?.status === 409) {
        setError("This system is already in use and cannot be deleted.");
      } else {
        setError("Delete Error: " + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">System Registration Management</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System Name</label>
                <input
                  type="text"
                  name="systemName"
                  placeholder="System Name"
                  className="border rounded px-4 py-2 w-full"
                  value={form.systemName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  className="border rounded px-4 py-2 w-full"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded transition-colors">
              {editingId ? 'Update System' : 'Add System'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ systemName: '', description: '' });
                  setEditingId(null);
                  setSuccess(null);
                }}
                className="ml-4 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel Edit
              </button>
            )}
          </form>

          <table className="w-full table-auto border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">System ID</th>
                <th className="p-2">System Name</th>
                <th className="p-2">Description</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {systems.map((system) => (
                <tr key={system.AsipiyaSystemID} className="border-t">
                  <td className="p-2">{system.AsipiyaSystemID}</td>
                  <td className="p-2">{system.SystemName}</td>
                  <td className="p-2">{system.Description}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleEdit(system)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(system.AsipiyaSystemID)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
};

export default SystemRegistration;
