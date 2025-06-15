import { useEffect, useState } from "react";
import { BsFillTicketPerforatedFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa6";
import { GrSystem } from "react-icons/gr";

export default function TicketCard({ ticket, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "text-green-700";
      case "In Process":
        return "text-yellow-700";
      case "Resolved":
        return "text-blue-700";
      default:
        return "text-gray-700";
    }
  };

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (ticket.status !== "In Process" || !ticket.dueDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const due = new Date(ticket.dueDate);
      const diff = due - now;

      if (diff <= 0) {
        setTimeLeft("Time's up");
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket.status, ticket.dueDate]);

  const isOverdue =
    ticket.status === "In Process" &&
    ticket.dueDate &&
    new Date(ticket.dueDate) < new Date();

  return (
    <div
      onClick={() => onClick(ticket)}
      className={`relative bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition ${
        isOverdue ? "border-2 border-red-500" : ""
      }`}
    >
      {/* Header with Ticket ID and Status */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
          <BsFillTicketPerforatedFill className="text-indigo-600" />
          Ticket #{ticket.id}
        </h2>
        <span
          className={`text-sm font-bold px-2 py-1 rounded-full ${getStatusColor(
            ticket.status
          )}`}
        >
          {ticket.status}
        </span>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <FaUser className="text-blue-500" />
        <span className="font-medium">{ticket.userName || "Unknown User"}</span>
      </div>

      {/* System Info */}
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <GrSystem className="text-green-500" />
        <span className="font-medium">{ticket.systemName}</span>

        {/* Timer at bottom-right */}
        {ticket.status === "In Process" && (
          <div className="absolute bottom-2 right-3 text-xs text-red-600 font-semibold">
            ⏳ {timeLeft}
          </div>
        )}
      </div>
    </div>
  );
}
