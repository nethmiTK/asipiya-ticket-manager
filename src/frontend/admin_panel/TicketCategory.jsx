import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';

const TicketCategory = () => {
  const [form, setForm] = useState({ CategoryName: '', Description: '' });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchCategory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/ticket_category');
      setCategories(res.data);
    } catch (error) {
      setError('Error fetching categories: ' + error.message);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/ticket_category_update/${editingId}`, form);
        setSuccess('Category updated successfully.');
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/ticket_category', form);
        setSuccess('Category added successfully.');
      }

      setForm({ CategoryName: '', Description: '' });
      fetchCategory(); // Refresh list
    } catch (error) {
      setError('Submit Error: ' + (error.response?.data?.message || error.message));
    }
  };


  const handleEdit = (category) => {
    setForm({
      CategoryName: category.CategoryName,
      Description: category.Description,
    });
    setEditingId(category.TicketCategoryID);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    setSuccess(null);
    setError(null);

    try {
      const res = await axios.delete(`http://localhost:5000/api/ticket_category_delete/${id}`);
      setSuccess(res.data.message || 'Category deleted successfully.');
      fetchCategory(); // Refresh list
    } catch (error) {
      if (error.response?.status === 409) {
        setError("This category is already in use and cannot be deleted.");
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
          <h2 className="text-2xl font-bold mb-4">Ticket Category Management</h2>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  name="CategoryName"
                  placeholder="Category Name"
                  className="border rounded px-4 py-2 w-full"
                  value={form.CategoryName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="Description"
                  placeholder="Description"
                  className="border rounded px-4 py-2 w-full"
                  value={form.Description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded transition-colors">
              {editingId ? 'Update Category' : 'Add Category'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ CategoryName: '', Description: '' });
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
                <th className="p-2">Category ID</th>
                <th className="p-2">Category Name</th>
                <th className="p-2">Description</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.TicketCategoryID} className="border-t">
                  <td className="p-2">{category.TicketCategoryID}</td>
                  <td className="p-2">{category.CategoryName}</td>
                  <td className="p-2">{category.Description}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.TicketCategoryID)}
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

export default TicketCategory;
