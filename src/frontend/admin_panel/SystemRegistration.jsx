import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';

const SystemRegistration = () => {
  const [form, setForm] = useState({ systemName: '', description: '' });
  const [systems, setSystems] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/system_registration', form);
      const newSystem = res.data;

      const current = JSON.parse(localStorage.getItem('registeredSystems')) || [];
      localStorage.setItem('registeredSystems', JSON.stringify([...current, newSystem]));

      setForm({ systemName: '', description: '' });
      fetchSystems();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const fetchSystems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/system_registration');
      setSystems(res.data);
      localStorage.setItem('registeredSystems', JSON.stringify(res.data));
    } catch (error) {
      console.error('Error fetching systems:', error);
    }
  };

  useEffect(() => {
    fetchSystems();
    const cached = localStorage.getItem('registeredSystems');
    if (cached) {
      setSystems(JSON.parse(cached));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center">
      <AdminSideBar />
      <div className="p-8 ml-85 min-h-screen mb-10">
        <h2 className="text-2xl font-bold mb-4">System Registration</h2>

        <form onSubmit={handleSubmit} className="flex gap-9 mb-10">
          <input
            type="text"
            name="systemName"
            placeholder="System Name"
            className="border rounded px-4 py-2 outline-none focus:ring-0 focus:border-black"
            value={form.systemName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            className="border rounded px-4 py-2 outline-none focus:ring-0 focus:border-black"
            value={form.description}
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
              <th className="p-2">System Name</th>
              <th className="p-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {systems.map((system, index) => (
              <tr key={system.id || index} className="border-t">
                <td className="p-2">{system.SystemName}</td>
                <td className="p-2">{system.Description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemRegistration;
