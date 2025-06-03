import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import TicketViewPage from "../admin_panel/TicketViewPage"

const PendingTicket = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTicketPopup, setShowTicketPopup] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/pending_ticket");
        const filteredTickets = response.data.filter(
          (ticket) => ticket.Status?.toLowerCase() === "pending"
        );
        setTickets(filteredTickets);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "open":
        return "text-red-500";
      case "in progress":
        return "text-yellow-500";
      case "closed":
        return "text-green-500";
      case "pending":
        return "text-blue-500";
      default:
        return "";
    }
  };

  const handleTicketClick = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowTicketPopup(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <main
        className={`flex-1 min-h-screen bg-gray-100 p-6 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Pending Tickets</h1>
        </header>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr
                  key={ticket.TicketID}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleTicketClick(ticket.TicketID)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.TicketID}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{ticket.SystemName || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{ticket.CategoryName || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{ticket.UserName || "N/A"}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <span className={getStatusColor(ticket.Status)}>
                      {ticket.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showTicketPopup && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-4 text-2xl font-bold text-gray-500 hover:text-red-600"
              onClick={() => setShowTicketPopup(false)}
            >
              ×
            </button>
            <TicketViewPage ticketId={selectedTicketId} popupMode={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingTicket;
