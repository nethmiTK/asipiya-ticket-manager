import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';

const TicketCategory = () => {

  const [form, setForm] = useState({ categoryName: '', categoryDescription: '' });
  const [categories, setCategories] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/ticket_category', form);
      setForm({ categoryName: '', categoryDescription: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/ticket_category');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching systems:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center">
      <AdminSideBar />
      <div className="p-8 ml-85 min-h-screen mb-10">
        <h2 className="text-2xl font-bold mb-4">Ticket Category</h2>

        <form onSubmit={handleSubmit} className="flex gap-9 mb-10">
          <input
            type="text"
            name="categoryName"
            placeholder="Ticket Category Name"
            className="border rounded px-4 py-2 outline-none focus:ring-0 focus:border-black"
            value={form.categoryName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="categoryDescription"
            placeholder="Ticket Category Description"
            className="border rounded px-4 py-2 outline-none focus:ring-0 focus:border-black"
            value={form.categoryDescription}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded"
          >
            + Add
          </button>
        </form>

        <table className="w-full table-auto border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Ticket Category Name</th>
              <th className="p-2">Ticket Category Description</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{category.CategoryName}</td>
                <td className="p-2">{category.Description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TicketCategory