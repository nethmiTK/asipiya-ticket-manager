import { useEffect, useState } from "react";
import { BsFillTicketPerforatedFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa6";
import { GrSystem } from "react-icons/gr";

// Priority icons and colors
const getPriorityDetails = (priority) => {
  switch (priority) {
    case "High":
      return { color: "text-red-600", icon: "🔴" };
    case "Medium":
      return { color: "text-yellow-600", icon: "🟡" };
    case "Low":
      return { color: "text-green-600", icon: "🟢" };
    default:
      return { color: "text-gray-500", icon: "❔" };
  }
};

// Status colors
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

export default function TicketCard({ ticket, onClick }) {
  const [timeText, setTimeText] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let output = "";

      if (ticket.status === "In Process" && ticket.dueDate) {
        const due = new Date(ticket.dueDate);
        const diff = due - now;
        if (diff <= 0) {
          output = "⏳ Time's up";
        } else {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const m = Math.floor((diff / (1000 * 60)) % 60);
          const s = Math.floor((diff / 1000) % 60);
          output = `⏳ ${d}d ${h}h ${m}m left`;
        }
      } else if (ticket.status === "Open" && ticket.date) {
        const created = new Date(ticket.date);
        const diff = now - created;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        output = `🕒 Opened: ${d}d ${h}h ${m}m ago`;
      }

      setTimeText(output);
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket.status, ticket.dueDate, ticket.date]);

  const isOverdue =
    ticket.status === "In Process" &&
    ticket.dueDate &&
    new Date(ticket.dueDate) < new Date();

  const priority = getPriorityDetails(ticket.priority);

  return (
    <div
      onClick={() => onClick(ticket)}
      className={`relative bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition duration-300 ${
        isOverdue ? "border-2 border-red-500 " : ""
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
        ></span>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
        <FaUser className="text-blue-500" />
        <span className="font-medium">{ticket.userName || "Unknown User"}</span>
      </div>

      {/* System Info */}
      <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
        <GrSystem className="text-green-500" />
        <span className="font-medium">{ticket.systemName || "N/A"}</span>
      </div>

      {/* Priority */}
      <div className="absolute top-2 right-3 text-xs font-semibold flex items-center gap-1">
        <span className={priority.color} title={`Priority: ${ticket.priority}`}>
          {priority.icon}
        </span>
      </div>

      {/* Timer */}
      {timeText && (
        <div className={`absolute bottom-2 right-3 text-xs text-green-600 font-semibold ${
        isOverdue ? " text-red-500 " : ""
      }`}>
          {timeText}
        </div>
      )}
    </div>
  );
}
