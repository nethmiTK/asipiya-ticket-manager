import React, { useEffect, useState } from "react";
import axios from "axios";
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  "in progress": "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const TicketView = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).UserID : null;

      if (!userId) return;

      try {
        const res = await axios.get("http://localhost:5000/tickets", {
          params: { userId },
        });
        setTickets(res.data);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="flex">
    <title>My All Tickets</title>
      <SideBar />
      <div className="flex-1 ml-72 flex flex-col h-screen overflow-y-auto">
        <NavBar />
        <div className="p-6 mt-[60px]">
          <h1 className="text-2xl font-bold mb-4">My All Tickets</h1>

          {loading ? (
            <p>Loading...</p>
          ) : tickets.length === 0 ? (
            <p>No tickets found.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3 w-32">Status</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">System Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">
                        {ticket.id}
                      </td>
                      <td className="px-6 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[ticket.status?.toLowerCase()] ||
                            "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-justify">
                        {ticket.description}
                      </td>
                      <td className="px-4 py-2">{ticket.system_name}</td>
                      <td className="px-4 py-2">{ticket.category}</td>
                      <td className="px-4 py-2 text-gray-500">
                        {new Date(ticket.datetime).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketView;
