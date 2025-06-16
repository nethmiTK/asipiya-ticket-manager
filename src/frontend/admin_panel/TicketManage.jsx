import { useState, useEffect } from "react";
import { FaArrowUpLong, FaBell } from "react-icons/fa6";
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
  const [evidenceList, setEvidenceList] = useState([]);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [systems, setSystems] = useState([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("");
  const [activeTab, setActiveTab] = useState('details');

  // This computes which supervisorId to use based on user role and selection
  const supervisorIdToUse =
    user.Role === "Admin" && selectedSupervisorId
      ? selectedSupervisorId
      : user.UserID;

  // Fetch tickets for the current supervisorIdToUse whenever it changes
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const url = `http://localhost:5000/getting/tickets?supervisorId=${supervisorIdToUse}&systemId=${selectedSystem}`;
        const res = await fetch(url);
        const data = await res.json();

        const mappedTickets = data.map((ticket) => ({
          id: ticket.TicketID,
          date: ticket.DateTime,
          problem: ticket.Description,
          priority: ticket.Priority,
          status: ticket.Status,
          assignedBy: ticket.SupervisorID,
          dueDate: ticket.DueDate
            ? new Date(ticket.DueDate).toISOString().split("T")[0]
            : "",
          resolution: ticket.Resolution,
          user: ticket.UserId,
          systemName: ticket.AsipiyaSystemName || "N/A",
          userName: ticket.UserName,
        }));
        setTickets(mappedTickets);
      } catch (err) {
        console.error("Error loading tickets", err);
      }
    };

    fetchTickets();
  }, [selectedSupervisorId, selectedSystem]);

  useEffect(() => {
    // Fetch asipiya systems
    fetch("http://localhost:5000/asipiyasystems")
      .then((res) => res.json())
      .then((data) => setSystems(data))
      .catch((err) => console.error("Error fetching systems", err));

    // Fetch supervisors if user is admin
    if (user.Role === "Admin") {
      fetch("http://localhost:5000/supervisors")
        .then((res) => res.json())
        .then((data) => setSupervisors(data))
        .catch((err) => console.error("Error fetching supervisors", err));
    }
  }, [user.Role]);

  useEffect(() => {
    if (!selectedTicket?.id) return;

    const fetchEvidence = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/evidence/${selectedTicket.id}`
        );
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
        const url =
          supervisorIdToUse === "all"
            ? `http://localhost:5000/tickets?role=${user.Role}`
            : `http://localhost:5000/tickets?supervisorId=${supervisorIdToUse}&role=${user.Role}`;

        const res = await fetch(url);
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
          dueDate: ticket.DueDate
            ? new Date(ticket.DueDate).toISOString().split("T")[0]
            : "",
          resolution: ticket.Resolution,
          user: ticket.UserId,
          systemName: ticket.AsipiyaSystemName || "N/A",
          userName: ticket.UserName,
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
    const rawDate = e.target.value;
    const newDueDate = new Date(rawDate).toISOString(); // ISO format with time

    setSelectedTicket((prev) => ({
      ...prev,
      dueDate: rawDate, // keep local viewable date
    }));

    try {
      const res = await fetch(
        `http://localhost:5000/tickets/${selectedTicket.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dueDate: newDueDate }), // send ISO date
        }
      );

      if (!res.ok) throw new Error("Failed to update due date");

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === selectedTicket.id
            ? { ...ticket, dueDate: rawDate }
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
          <nav className="bg-white shadow-md px-6 py-4 flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 rounded-lg items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
              Ticket Management
            </h1>

            <div className="flex gap-4 items-center">
              {/* Only for Admin: Supervisor Dropdown */}
              {user.Role === "Admin" && (
                <select
                  value={selectedSupervisorId}
                  onChange={(e) => setSelectedSupervisorId(e.target.value)}
                >
                  <option value={"all"}>All Supervisors</option>
                  {supervisors.map((sup) => (
                    <option key={sup.UserID} value={sup.UserID}>
                      {sup.FullName}
                    </option>
                  ))}
                </select>
              )}

              {/* Asipiya System Dropdown */}
              <select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
              >
                <option value="all">All Systems</option>
                {systems.map((sys) => (
                  <option key={sys.AsipiyaSystemID} value={sys.AsipiyaSystemID}>
                    {sys.SystemName}
                  </option>
                ))}
              </select>

              <div className="relative cursor-pointer">
                <FaBell className="text-2xl text-gray-700" />
                {/* Uncomment if you want notification badge */}
                {/* <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-2">3</span> */}
              </div>
            </div>
          </nav>

          {/* Ticket Sections */}
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-10 ">
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
              <div className="bg-white rounded-xl p-4 w-[800px] shadow-lg relative">
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
                >
                  🗙
                </button>

                {/* Navigation Tabs */}
                <div className="border-b mb-4">
                  <nav className="flex gap-8">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`pb-2 text-base font-medium ${
                        activeTab === 'details'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className={`pb-2 text-base font-medium ${
                        activeTab === 'activity'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Activity Log
                    </button>
                  </nav>
                </div>

                <div className="h-[600px] overflow-y-auto">
                  {activeTab === 'details' ? (
                    <div className="grid grid-cols-2 gap-6">
                      {/* LEFT: Ticket Info */}
                      <div className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
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
                          <strong>System Name:</strong> {selectedTicket.systemName}
                        </p>
                        <p>
                          <strong>User Name:</strong> {selectedTicket.userName}
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

                        <div className="flex justify-between pt-2">
                          <button
                            onClick={handleUpdateTicket}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setChatMode(!chatMode)}
                            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                          >
                            <MessageCircle size={20} />
                            {chatMode ? "Close Chat" : "Open Chat"}
                          </button>
                        </div>
                      </div>

                      {/* RIGHT: Evidence Files */}
                      <div className="space-y-4">
                        <h4 className="font-semibold mb-2">Evidence Files</h4>
                        {evidenceList.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No evidence files available.
                          </p>
                        ) : (
                          <div className="h-[450px] overflow-y-auto grid grid-cols-2 gap-4 p-2 border rounded bg-gray-50">
                            {evidenceList.map((evi, index) => {
                              const fileUrl = `http://localhost:5000/${evi.FilePath}`;
                              const fileName = evi.FilePath.split("/").pop();

                              const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
                              const isPDF = /\.pdf$/i.test(fileName);
                              const isVideo = /\.(mp4|webm|ogg)$/i.test(fileName);
                              const isAudio = /\.(mp3|wav|ogg)$/i.test(fileName);
                              const isDoc = /\.(docx?|xlsx?)$/i.test(fileName);

                              return (
                                <div
                                  key={index}
                                  className="border rounded p-2 bg-white shadow-sm flex flex-col items-center text-center"
                                >
                                  {isImage ? (
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                      <img
                                        src={fileUrl}
                                        alt={fileName}
                                        className="w-24 h-24 object-cover rounded hover:opacity-90 transition"
                                      />
                                    </a>
                                  ) : isPDF ? (
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
                                      📄 {fileName}
                                    </a>
                                  ) : isVideo ? (
                                    <video controls className="w-24 h-24 rounded" title={fileName}>
                                      <source src={fileUrl} type={`video/${fileName.split(".").pop()}`} />
                                      Your browser does not support the video tag.
                                    </video>
                                  ) : isAudio ? (
                                    <audio controls className="w-full" title={fileName}>
                                      <source src={fileUrl} type={`audio/${fileName.split(".").pop()}`} />
                                      Your browser does not support the audio element.
                                    </audio>
                                  ) : isDoc ? (
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                                      📄 {fileName}
                                    </a>
                                  ) : (
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      📎 {fileName}
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Status Updated</p>
                            <p className="text-gray-600">Changed from Open to In Process</p>
                          </div>
                          <span className="text-sm text-gray-500">2024-03-21 14:30</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Due Date Set</p>
                            <p className="text-gray-600">Due date set to 2024-05-29</p>
                          </div>
                          <span className="text-sm text-gray-500">2024-03-21 14:25</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Ticket Created</p>
                            <p className="text-gray-600">New ticket opened</p>
                          </div>
                          <span className="text-sm text-gray-500">2024-03-21 14:20</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chat Modal */}
          {chatMode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="relative max-w-lg h-[600px] p-4 bg-white rounded-lg shadow-lg flex flex-col">
                <button
                  onClick={() => setChatMode(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
                  aria-label="Close Chat"
                >
                  🗙
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
