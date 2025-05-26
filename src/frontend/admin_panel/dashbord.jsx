import React from 'react';
import { FaTicketAlt, FaExclamationCircle, FaCalendarDay, FaTasks } from 'react-icons/fa';

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Dashboard</h1>
        <input type="text" placeholder="Search..." className="border rounded px-4 py-2 w-full md:w-auto" />
        <div className="text-2xl mt-4 md:mt-0">🔔</div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500 text-white p-4 rounded shadow text-center">
          <FaTicketAlt className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">1248</h2>
          <p>Total Tickets</p>
        </div>
        <div className="bg-gray-800 text-white p-4 rounded shadow text-center">
          <FaTasks className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">78</h2>
          <p>Open Tickets</p>
        </div>
        <div className="bg-gray-500 text-white p-4 rounded shadow text-center">
          <FaCalendarDay className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">125</h2>
          <p>Tickets Today</p>
        </div>
        <div className="bg-red-500 text-white p-4 rounded shadow text-center">
          <FaExclamationCircle className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">76</h2>
          <p>High Priority</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Recently Activity</h2>
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr>
                <th className="border border-gray-200 px-2 py-1">Tickets</th>
                <th className="border border-gray-200 px-2 py-1">Clients</th>
                <th className="border border-gray-200 px-2 py-1">Category</th>
                <th className="border border-gray-200 px-2 py-1">Status</th>
                <th className="border border-gray-200 px-2 py-1">Priority</th>
                <th className="border border-gray-200 px-2 py-1">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {/* Add dynamic rows here */}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Ticket by Status</h2>
          <div className="text-center text-gray-500">[Pie Chart Placeholder]</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Tickets by System</h2>
          <div className="text-center text-gray-500">[Chart]</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Active Clients</h2>
          <div className="text-center text-gray-500">[Clients]</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
