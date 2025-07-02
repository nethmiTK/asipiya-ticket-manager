import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import { toast } from 'react-toastify';
import { X, AlignLeft, FileText } from 'lucide-react';

const ClientRegistration = () => {
  const [form, setForm] = useState({
    CompanyName: '',
    ContactNo: '',
    ContactPersonEmail: '',
    MobileNo: ''
  });
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/clients');
      setClients(res.data);

      localStorage.setItem('clients', JSON.stringify(res.data));
    } catch (err) {
      setError('Failed to fetch clients: ' + err.message);
    }
  };


  useEffect(() => {
    const storedClients = localStorage.getItem('clients');
    if (storedClients) {
      setClients(JSON.parse(storedClients));
    }
    fetchClients();
  }, []);


  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  try {
    const res = await axios.post('http://localhost:5000/api/clients', form);
    const createdClient = res.data.client;

    localStorage.setItem("client", JSON.stringify(createdClient));
    const client = JSON.parse(localStorage.getItem("client"));
    console.log("ClientID:", client?.ClientID);

    toast.success('Client registered successfully!');
    setForm({ CompanyName: '', ContactNo: '', ContactPersonEmail: '', MobileNo: '' });
    setShowModal(false);
    fetchClients();
  } catch (err) {
    setError('Submit error: ' + (err.response?.data?.message || err.message));
  }
};


  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Client Registration</h2>
            <button
              onClick={() => {
                setForm({ CompanyName: '', ContactNo: '', ContactPersonEmail: '', MobileNo: '' });
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Register New
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
                <th className="p-2 text-left">Client ID</th>
                <th className="p-2 text-left">Company Name</th>
                <th className="p-2 text-left">Contact No</th>
                <th className="p-2 text-left">Contact Person Email</th>
                <th className="p-2 text-left">Mobile No</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.ClientID}>
                  <td className="p-2">{client.ClientID}</td>
                  <td className="p-2">{client.CompanyName}</td>
                  <td className="p-2">{client.ContactNo}</td>
                  <td className="p-2">{client.ContactPersonEmail}</td>
                  <td className="p-2">{client.MobileNo}</td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">No clients registered</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-lg relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                <X />
              </button>
              <h3 className="text-xl font-semibold mb-4">Register Client</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <FileText size={16} />
                    </span>
                    <input
                      type="text"
                      name="CompanyName"
                      value={form.CompanyName}
                      onChange={handleChange}
                      className="border rounded px-4 py-2 w-full pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Contact No</label>
                  <input
                    type="text"
                    name="ContactNo"
                    value={form.ContactNo}
                    onChange={handleChange}
                    className="border rounded px-4 py-2 w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="ContactPersonEmail"
                    value={form.ContactPersonEmail}
                    onChange={handleChange}
                    className="border rounded px-4 py-2 w-full"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Mobile No</label>
                  <input
                    type="text"
                    name="MobileNo"
                    value={form.MobileNo}
                    onChange={handleChange}
                    className="border rounded px-4 py-2 w-full"
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="ml-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientRegistration;
