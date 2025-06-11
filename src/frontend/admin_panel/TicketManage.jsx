import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa6";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TicketCard from "./TicketCard";
import ChatSection from "./ChatSection";
import { useAuth } from "../../App";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import { toast } from "react-toastify";

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
  const { loggedInUser: user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [chatMode, setChatMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleNotificationClick = () => navigate("/ticket-request");
  const [evidenceList, setEvidenceList] = useState([]);

  useEffect(() => {
  if (!selectedTicket?.id) return;

  const fetchEvidence = async () => {
    try {
      const res = await fetch(`http://localhost:5000/evidence/${selectedTicket.id}`);
      const data = await res.json();
      setEvidenceList(data);
    } catch (err) {
      console.error("Failed to load evidence", err);
    }
  };

  fetchEvidence();
}, [selectedTicket?.id]);


  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/tickets?supervisorId=${user.UserID}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        // Map backend ticket fields to frontend expected fields
        const mappedTickets = data.map((ticket) => ({
          id: ticket.TicketID,
          date: ticket.DateTime,
          problem: ticket.Description,
          priority: ticket.Priority,
          status: ticket.Status,
          assignedBy: ticket.SupervisorID,
          dueDate: ticket.DueDate ? ticket.DueDate.split("T")[0] : "",
          resolution: ticket.Resolution,
          user: ticket.UserId,
        }));
        setTickets(mappedTickets);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchTickets();
  }, []);

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
    if (!comment.trim()) return;
    const newLog = `${new Date().toLocaleString()} - ${comment}`;
    setSelectedTicket((prev) => ({
      ...prev,
      logs: [...(prev.logs || []), newLog],
    }));
    setComment("");
  };

  const open = tickets.filter((t) => t.status === "Open");
  const inProcess = tickets.filter((t) => t.status === "In Process");
  const resolved = tickets.filter((t) => t.status === "Resolved");

  const initialMessages = [
    {
      id: 1,
      sender: SUPPORT,
      text: "Welcome to support chat!",
      timestamp: new Date().toLocaleTimeString(),
      status: "delivered",
    },
  ];

  const handleUpdateTicket = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/tickets/${selectedTicket.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resolution: selectedTicket.resolution || "",
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update ticket");

      toast.success("Ticket updated successfully!");
      closeModal();

      // Optional: refresh tickets
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                resolution: selectedTicket.resolution,
              }
            : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update ticket");
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectedTicket((prev) => ({
      ...prev,
      status: newStatus,
    }));

    try {
      const res = await fetch(
        `http://localhost:5000/tickets/${selectedTicket.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      toast.success("Status updated successfully!");
      setTickets((prevTickets) =>
        prevTickets.map((t) =>
          t.id === selectedTicket.id ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleDueDateChange = async (e) => {
    const newDueDate = e.target.value;
    setSelectedTicket((prev) => ({
      ...prev,
      dueDate: newDueDate,
    }));

    try {
      const res = await fetch(
        `http://localhost:5000/tickets/${selectedTicket.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dueDate: newDueDate }),
        }
      );

      if (!res.ok) throw new Error("Failed to update due date");

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === selectedTicket.id
            ? { ...ticket, dueDate: newDueDate }
            : ticket
        )
      );

      toast.success("Due date updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update due date");
    }
  };

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div
        className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        <div className="min-h-screen bg-gray-50">
          {/* Top Navigation */}
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
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
            <Section
              title="Open"
              tickets={open}
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
              title="Resolved"
              tickets={resolved}
              onCardClick={handleCardClick}
              color="text-blue-700"
            />
          </div>

          {/* Modal View */}
          {selectedTicket && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-[95%] max-w-5xl shadow-lg relative grid grid-cols-1 md:grid-cols-2 gap-8">
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
                >
                  ×
                </button>

                {/* LEFT: Ticket Info */}
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
                      onChange={handleStatusChange}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option>Open</option>
                      <option>In Process</option>
                      <option>Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={selectedTicket.dueDate || ""}
                      onChange={handleDueDateChange}
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
                  <button
                    onClick={handleUpdateTicket}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
                  >
                    Save Changes
                  </button>
                </div>

                {/* RIGHT: Logs & Chat */}
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

                  <div className="flex justify-between">
                    <button
                      onClick={handleAddComment}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Evidence Files</h4>
                    {evidenceList.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No evidence files available.
                      </p>
                    ) : (
                      <ul className="list-disc list-inside text-blue-600 text-sm">
                        {evidenceList.map((evi) => (
                          <li >
                           <a
  href={`http://localhost:5000/uploads/${evi.fileName}`} // Assuming static folder
  target="_blank"
  rel="noopener noreferrer"
  className="hover:underline"
>
  {evi.fileName}
</a>
                              
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    onClick={() => setChatMode(!chatMode)}
                    className="mt-4 p-2 bg-green-600 text-white rounded flex items-center gap-2"
                  >
                    <MessageCircle size={20} />
                    {chatMode ? "Close Chat" : "Open Chat"}
                  </button>
                </div>
              </div>

              {/* Chat Modal */}
              {chatMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="relative w-full max-w-lg h-[600px] p-4 bg-white rounded-lg shadow-lg flex flex-col">
                    <button
                      onClick={() => setChatMode(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
                      aria-label="Close Chat"
                    >
                      ❌
                    </button>
                    <ChatSection
                      user={selectedTicket.user}
                      supportUser={selectedTicket.assignedBy}
                      initialMessages={initialMessages}
                      ticket={selectedTicket}
                      ticketId={selectedTicket.id}
                      role={"Supervisor"}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Section Component
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
