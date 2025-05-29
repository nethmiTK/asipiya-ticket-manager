import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";

const Tickets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tickets")
      .then((response) => {
        setTickets(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tickets:", error);
      });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "text-red-500";
      case "In Progress":
        return "text-yellow-500";
      case "Closed":
        return "text-green-500";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-500";
      case "Medium":
        return "text-yellow-500";
      case "Low":
        return "text-green-500";
      default:
        return "";
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

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <main
        className={`flex-1 min-h-screen bg-gray-100 p-6 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Tickets</h1>
        </header>

        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr>
              <th className="border border-gray-200 px-2 py-1">ID</th>
              <th className="border border-gray-200 px-2 py-1">User Email</th>
              <th className="border border-gray-200 px-2 py-1">System</th>
              <th className="border border-gray-200 px-2 py-1">Category</th>
              <th className="border border-gray-200 px-2 py-1">Status</th>
              <th className="border border-gray-200 px-2 py-1">Priority</th>
              <th className="border border-gray-200 px-2 py-1">Duration</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.TicketID}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/ticket_view_page/${ticket.TicketID}`)}
              >
                <td className="border border-gray-200 px-2 py-1">
                  {ticket.TicketID}
                </td>
                <td className="border border-gray-200 px-2 py-1">
                  {ticket.UserEmail}
                </td>
                <td className="border border-gray-200 px-2 py-1">
                  {ticket.System}
                </td>
                <td className="border border-gray-200 px-2 py-1">
                  {ticket.Category}
                </td>
                <td
                  className={`border border-gray-200 px-2 py-1 ${getStatusColor(
                    ticket.Status
                  )}`}
                >
                  {ticket.Status}
                </td>
                <td
                  className={`border border-gray-200 px-2 py-1 ${getPriorityColor(
                    ticket.Priority
                  )}`}
                >
                  {ticket.Priority}
                </td>
                <td className="border border-gray-200 px-2 py-1">
                  {calculateDuration(ticket.DateTime)}
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
