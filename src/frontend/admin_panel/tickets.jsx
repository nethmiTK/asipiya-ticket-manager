import React from 'react';

const Tickets = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Tickets</h1>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <select className="border rounded px-4 py-2">
            <option>Status</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>
          <select className="border rounded px-4 py-2">
            <option>Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <div className="flex items-center border rounded px-4 py-2">
            <input type="text" placeholder="Search" className="flex-grow focus:outline-none" />
            <span className="ml-2">🔍</span>
          </div>
        </div>
      </header>

      <table className="w-full border-collapse border border-gray-200 text-sm">
        <thead>
          <tr>
            <th className="border border-gray-200 px-2 py-1">ID</th>
            <th className="border border-gray-200 px-2 py-1">Client</th>
            <th className="border border-gray-200 px-2 py-1">System</th>
            <th className="border border-gray-200 px-2 py-1">Category</th>
            <th className="border border-gray-200 px-2 py-1">Status</th>
            <th className="border border-gray-200 px-2 py-1">Priority</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-200 px-2 py-1">1</td>
            <td className="border border-gray-200 px-2 py-1">Client A</td>
            <td className="border border-gray-200 px-2 py-1">System X</td>
            <td className="border border-gray-200 px-2 py-1">Category Y</td>
            <td className="border border-gray-200 px-2 py-1 text-blue-500">Open</td>
            <td className="border border-gray-200 px-2 py-1">High</td>
          </tr>
          <tr>
            <td className="border border-gray-200 px-2 py-1">2</td>
            <td className="border border-gray-200 px-2 py-1">Client B</td>
            <td className="border border-gray-200 px-2 py-1">System Y</td>
            <td className="border border-gray-200 px-2 py-1">Category Z</td>
            <td className="border border-gray-200 px-2 py-1 text-yellow-500">In Progress</td>
            <td className="border border-gray-200 px-2 py-1">Medium</td>
          </tr>
          <tr>
            <td className="border border-gray-200 px-2 py-1">3</td>
            <td className="border border-gray-200 px-2 py-1">Client C</td>
            <td className="border border-gray-200 px-2 py-1">System Z</td>
            <td className="border border-gray-200 px-2 py-1">Category X</td>
            <td className="border border-gray-200 px-2 py-1 text-red-500">Closed</td>
            <td className="border border-gray-200 px-2 py-1">Low</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Tickets;
