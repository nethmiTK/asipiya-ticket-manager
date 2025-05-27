import { FaBell } from "react-icons/fa6";
import TicketCard from "./TicketCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function TicketManage() {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleNotificationClick = () => navigate("/tickets-request");
  const handleCardClick = (ticket) => setSelectedTicket(ticket);
  const closeModal = () => setSelectedTicket(null);

  const tickets = [
    {
      id: 1,
      status: "Accepted",
      problem: "System crash on login",
      date: "2025-05-20",
      logs: ["Login attempted", "Crash occurred", "Report sent"],
    },
    {
      id: 2,
      status: "In Process",
      problem: "UI misalignment on dashboard",
      date: "2025-05-19",
      logs: ["UI rendered", "CSS load delayed"],
    },
    {
      id: 3,
      status: "Completed",
      problem: "Database sync issue",
      date: "2025-05-18",
      logs: ["Sync initiated", "Conflict resolved"],
    },
  ];

  const accepted = tickets.filter((t) => t.status === "Accepted");
  const inProcess = tickets.filter((t) => t.status === "In Process");
  const completed = tickets.filter((t) => t.status === "Completed");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
          Ticket Management
        </h1>
        <div
          onClick={handleNotificationClick}
          className="relative cursor-pointer"
        >
          <FaBell className="text-2xl text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-2">
            3
          </span>
        </div>
      </nav>

      {/* Ticket Sections */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        <Section
          title="Accepted"
          tickets={accepted}
          onCardClick={handleCardClick}
          color="text-green-700"
        />
        <hr className="border-t-2 border-gray-300" />
        <Section
          title="In Process"
          tickets={inProcess}
          onCardClick={handleCardClick}
          color="text-yellow-700"
        />
        <hr className="border-t-2 border-gray-300" />
        <Section
          title="Completed"
          tickets={completed}
          onCardClick={handleCardClick}
          color="text-blue-700"
        />
      </div>

      {/* Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-lg font-bold"
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Ticket #{selectedTicket.id} Details
            </h2>
            <p>
              <strong>Status:</strong> {selectedTicket.status}
            </p>
            <p>
              <strong>Date:</strong> {selectedTicket.date}
            </p>
            <p className="mt-2">
              <strong>Problem:</strong> {selectedTicket.problem}
            </p>
            <div className="mt-3">
              <strong>Logs:</strong>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {selectedTicket.logs?.map((log, index) => (
                  <li key={index}>{log}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Change Status
              </label>
              <select
                value={selectedTicket.status}
                onChange={(e) =>
                  setSelectedTicket({
                    ...selectedTicket,
                    status: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              >
                <option>Accepted</option>
                <option>In Process</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, tickets, onCardClick, color }) {
  return (
    <section>
      <h3 className={`text-lg sm:text-xl font-semibold ${color} mb-4`}>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} onClick={onCardClick} />
        ))}
      </div>
    </section>
  );
}
