import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";

const Tickets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/tickets/filter?type=${type}`
        );
        setTickets(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setLoading(false);
      }
    };

    fetchTickets();
  }, [type]);

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

  if (loading) {
    return <p>Loading tickets...</p>;
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
          <h1 className="text-2xl font-bold mb-4">
            {type.replace("-", " ").toUpperCase()} Tickets
          </h1>
        </header>

        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="border px-4 py-2">TicketID</th>
              <th className="border px-4 py-2">UserId</th>
              <th className="border px-4 py-2">AsipiyaSystemID</th>
              <th className="border px-4 py-2">DateTime</th>
              <th className="border px-4 py-2">TicketCategoryID</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Priority</th>
              <th className="border px-4 py-2">FirstRespondedTime</th>
              <th className="border px-4 py-2">LastRespondedTime</th>
              <th className="border px-4 py-2">TicketDuration</th>
              <th className="border px-4 py-2">UserNote</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.TicketID}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/ticket_view_page/${ticket.TicketID}`)}
              >
                <td className="border px-4 py-2">{ticket.TicketID}</td>
                <td className="border px-4 py-2">{ticket.UserId}</td>
                <td className="border px-4 py-2">{ticket.AsipiyaSystemID}</td>
                <td className="border px-4 py-2">{ticket.DateTime}</td>
                <td className="border px-4 py-2">{ticket.TicketCategoryID}</td>
                <td className="border px-4 py-2">{ticket.Description}</td>
                <td
                  className={`border px-4 py-2 ${getStatusColor(ticket.Status)}`}
                >
                  {ticket.Status}
                </td>
                <td
                  className={`border px-4 py-2 ${getPriorityColor(ticket.Priority)}`}
                >
                  {ticket.Priority}
                </td>
                <td className="border px-4 py-2">
                  {ticket.FirstRespondedTime}
                </td>
                <td className="border px-4 py-2">
                  {ticket.LastRespondedTime}
                </td>
                <td className="border px-4 py-2">
                  {calculateDuration(ticket.DateTime)}
                </td>
                <td className="border px-4 py-2">{ticket.UserNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default Tickets;
