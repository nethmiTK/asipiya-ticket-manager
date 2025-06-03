// TicketManage.jsx
import { FaBell } from "react-icons/fa6";
import TicketCard from "./TicketCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ChatSection from "./ChatSection";
import { MessageCircle } from "lucide-react";

const USER = {
  id: "user1",
  name: "You",
  avatar: "https://i.pravatar.cc/40?u=user1",
};

const SUPPORT = {
  id: "support",
  name: "Support",
  avatar: "https://i.pravatar.cc/40?u=support",
};

export default function TicketManage() {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState([]);

  const handleNotificationClick = () => navigate("/ticket-request");

  const handleCardClick = (ticket) => {
    setSelectedTicket(ticket);
    setComment("");
    setAttachments([]);
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setComment("");
    setAttachments([]);
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      const newLog = `${new Date().toLocaleString()} - ${comment}`;
      setSelectedTicket((prev) => ({
        ...prev,
        logs: [...prev.logs, newLog],
      }));
      setComment("");
    }
  };

  const [chatMode, setChatMode] = useState(true);

  const initialMessages = [
    {
      id: 1,
      sender: SUPPORT,
      text: "Welcome to support chat!",
      timestamp: new Date().toLocaleTimeString(),
      status: "delivered",
    },
  ];

  const tickets = [
    {
      id: 1,
      status: "Accepted",
      problem: "System crash on login",
      date: "2025-05-20",
      logs: ["Login attempted", "Crash occurred", "Report sent"],
      priority: "High",
      assignedBy: "Admin",
    },
    {
      id: 2,
      status: "In Process",
      problem: "UI misalignment on dashboard",
      date: "2025-05-19",
      logs: ["UI rendered", "CSS load delayed"],
      priority: "Medium",
      assignedBy: "Supervisor 1",
    },
    {
      id: 3,
      status: "Completed",
      problem: "Database sync issue",
      date: "2025-05-18",
      logs: ["Sync initiated", "Conflict resolved"],
      priority: "Low",
      assignedBy: "Supervisor 2",
    },
  ];

  const accepted = tickets.filter((t) => t.status === "Accepted");
  const inProcess = tickets.filter((t) => t.status === "In Process");
  const completed = tickets.filter((t) => t.status === "Completed");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-700 ">
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

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[95%] max-w-5xl shadow-lg relative grid grid-cols-1 md:grid-cols-2 gap-8">
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
            >
              ×
            </button>

            {/* LEFT SIDE: Ticket Info */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Ticket #{selectedTicket.id} Details
              </h2>
              <p>
                <strong>Status:</strong> {selectedTicket.status}
              </p>
              <p>
                <strong>Date:</strong> {selectedTicket.date}
              </p>
              <p>
                <strong>Problem:</strong> {selectedTicket.problem}
              </p>
              <p>
                <strong>Priority:</strong> {selectedTicket.priority}
              </p>
              <p>
                <strong>Assigned By:</strong> {selectedTicket.assignedBy}
              </p>

              <div>
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
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option>Accepted</option>
                  <option>In Process</option>
                  <option>Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={selectedTicket.dueDate || ""}
                  onChange={(e) =>
                    setSelectedTicket({
                      ...selectedTicket,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Resolution Summary
                </label>
                <textarea
                  rows={3}
                  value={selectedTicket.resolution || ""}
                  onChange={(e) =>
                    setSelectedTicket({
                      ...selectedTicket,
                      resolution: e.target.value,
                    })
                  }
                  placeholder="Add summary..."
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            {/* RIGHT SIDE: Logs + Attachments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Logs & Comments
              </h3>

              <div className="bg-gray-100 p-3 rounded-lg h-48 overflow-y-auto">
                <ul className="text-sm text-gray-700 space-y-2">
                  {selectedTicket.logs?.map((log, index) => (
                    <li key={index} className="bg-white p-2 rounded shadow">
                      {log}
                    </li>
                  ))}
                </ul>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border rounded-md"
              />

              <div className=" justify-between flex">
                <button
                  onClick={handleAddComment}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 "
                >
                  Send
                </button>
              </div>
              {/* Chat popup or section */}
              {chatMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40 backdrop-blur-sm">
                  <div className="relative w-full max-w-lg p-4 bg-white rounded-lg shadow-lg">
                    {/* Close Button */}
                    <button
                      onClick={() => setChatMode(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
                      aria-label="Open Chat"
                    >
                      ❌
                    </button>

                    {/* Chat Section */}
                    <ChatSection
                      user={USER}
                      supportUser={SUPPORT}
                      initialMessages={initialMessages}
                    />
                  </div>
                </div>
              )}

              {/* Button to toggle chat */}
              <button
                onClick={() => setChatMode(!chatMode)}
                className="m-4 p-2 bg-blue-600 text-white rounded flex items-center gap-2"
              >
                <MessageCircle size={20} />
                {chatMode ? "Close Chat" : "Open Chat"}
              </button>
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
