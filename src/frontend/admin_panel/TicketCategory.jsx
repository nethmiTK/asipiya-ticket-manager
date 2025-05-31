import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TicketCategory = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [form, setForm] = useState({ categoryName: '', description: '' });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/ticket_category', {
        CategoryName: form.categoryName,
        Description: form.description
      });

      if (response.data) {
        toast.success('Ticket category added successfully!');
        setForm({ categoryName: '', description: '' });
        fetchCategories();
        navigate('/ticket-category');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to add ticket category');
      setError('Failed to add ticket category. Please try again.');
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/ticket_category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
        <div className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}>
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${
        isSidebarOpen ? "ml-72" : "ml-20"
      }`}>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Ticket Categories</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  name="categoryName"
                  placeholder="Enter category name"
                  className="w-full border rounded px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.categoryName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  placeholder="Enter category description"
                  className="w-full border rounded px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded transition-colors"
            >
              Add Category
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.TicketCategoryID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.TicketCategoryID}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.CategoryName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.Description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCategory;
