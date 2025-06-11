import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import { FaEye } from 'react-icons/fa';
import Ticket_secret from "./Ticket_secret";
import TicketViewPage from "./TicketViewPage";

const Tickets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const ticketId = searchParams.get("id");
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        let url = 'http://localhost:5000/api/tickets/filter';
        if (type) {
          url += `?type=${type}`;
        }
        const response = await axios.get(url);
        
        // If type is 'resolved', filter only resolved tickets
        const filteredTickets = type === 'resolved' 
          ? response.data.filter(ticket => ticket.Status.toLowerCase() === 'resolved')
          : response.data;
        
        setTickets(filteredTickets);
        
        if (ticketId) {
          const ticket = filteredTickets.find(t => t.TicketID.toString() === ticketId);
          if (ticket) {
            setSelectedTicket(ticket);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setLoading(false);
      }
    };

    fetchTickets();
  }, [type, ticketId]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "text-blue-500";
      case "in progress":
        return "text-yellow-500";
      case "resolved":
        return "text-green-500";
      case "reject":
        return "text-purple-500";
      case "accept":
        return "text-blue-500";
      case "closed":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const calculateDuration = (dateTime) => {
    const ticketTime = new Date(dateTime);
    const currentTime = new Date();
    const duration = Math.abs(currentTime - ticketTime);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
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
        className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300 ${
          isSidebarOpen ? "ml-80" : "ml-24"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Tickets</h1>
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => navigate('/tickets')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  !type ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                All Tickets
              </button>
              <button
                onClick={() => navigate('/tickets?type=open')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  type === 'open' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Open Tickets
              </button>
              <button
                onClick={() => navigate('/tickets?type=today')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  type === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Today's Tickets
              </button>
              <button
                onClick={() => navigate('/tickets?type=pending')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  type === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Pending Tickets
              </button>
              <button
                onClick={() => navigate('/tickets?type=high-priority')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  type === 'high-priority' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                High Priority
              </button>
              <button
                onClick={() => navigate('/tickets?type=resolved')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  type === 'resolved' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Resolved Tickets
              </button>
            </div>
          </header>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TicketID
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.TicketID}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.TicketID}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.UserName || "N/A"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {ticket.Description}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${getStatusColor(ticket.Status)} font-medium`}>
                          {ticket.Status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${getPriorityColor(ticket.Priority)} font-medium`}>
                          {ticket.Priority}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewTicket(ticket)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Ticket Details"
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedTicket && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-3 right-4 text-2xl font-bold text-gray-500 hover:text-red-600"
                  onClick={() => setSelectedTicket(null)}
                >
                  ×
                </button>
                {type === 'pending' ? (
                  <TicketViewPage ticketId={selectedTicket.TicketID} popupMode={true} onClose={() => setSelectedTicket(null)} />
                ) : (
                  <Ticket_secret ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Tickets;
