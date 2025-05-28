import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";

const Tickets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // Fetch tickets from the backend
    axios
      .get("http://localhost:5000/api/tickets")
      .then((response) => {
        setTickets(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tickets:", error);
      });
  }, []);

  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen bg-gray-100 p-6 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
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
              <input
                type="text"
                placeholder="Search"
                className="flex-grow focus:outline-none"
              />
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
            {tickets.map((ticket) => (
              <tr key={ticket.TicketID}>
                <td className="border border-gray-200 px-2 py-1">
                  {ticket.TicketID}
                </td>
                <td className="border border-gray-200 px-2 py-1">
                  {ticket.Client}
                </td>
                <td className="border border-gray-200 px-2 py-1">
                  {ticket.System}
                </td>
                <td className="border border-gray-200 px-2 py-1">
                  {ticket.Category}
                </td>
                <td className="border border-gray-200 px-2 py-1 text-blue-500">
                  {ticket.Status}
                </td>
                <td className="border border-gray-200 px-2 py-1">
                  {ticket.Priority}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default Tickets;
