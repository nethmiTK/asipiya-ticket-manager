import { useState, useEffect, useRef } from "react";
import { FaBell } from "react-icons/fa6";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TicketCard from "./TicketCard";
import ChatSection from "./ChatSection";
import { useAuth } from "../../App";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import { toast } from "react-toastify";
import TicketLogView from "./TicketLogView";
import axios from "axios";

export const USER = {
  id: "user1",
  name: "You",
  avatar: "https://i.pravatar.cc/40?u=user1",
};

export const SUPPORT = {
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [evidenceList, setEvidenceList] = useState([]);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [systems, setSystems] = useState([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("");
  const [activeTab, setActiveTab] = useState('details');
  const [commentsList, setCommentsList] = useState([]);
  const [mentionableUsers, setMentionableUsers] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionDropdownPos, setMentionDropdownPos] = useState({ top: 0, left: 0 });
  const [filteredMentions, setFilteredMentions] = useState([]);
  const textareaRef = useRef(null);

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

  useEffect(() => {
    if (!selectedTicket?.id) return;
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/tickets/${selectedTicket.id}/comments`);
        const data = await res.json();
        setCommentsList(data);
      } catch (err) {
        console.error('Failed to load comments', err);
      }
    };
    fetchComments();
  }, [selectedTicket?.id]);

  useEffect(() => {
    if (selectedTicket) {
      fetch('http://localhost:5000/api/mentionable-users')
        .then(res => res.json())
        .then(setMentionableUsers)
        .catch(console.error);
    }
  }, [selectedTicket]);

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

  const handleAddComment = async () => {
    if (!selectedTicket || !comment.trim()) return;

    // Extract mentions from comment text (e.g., @FullName)
    const mentionMatches = comment.match(/@([\w\s]+)/g) || [];
    const mentionedNames = mentionMatches.map(m => m.slice(1).trim());
    const mentionedUserIds = mentionableUsers
      .filter(u => mentionedNames.includes(u.FullName))
      .map(u => u.UserID);

    try {
      await axios.post(`http://localhost:5000/api/tickets/${selectedTicket.id}/comments`, {
        comment: comment.trim(),
        userId: user.UserID,
        mentions: mentionMatches.join(','),
        mentionedUserIds,
      });
      setComment('');
      toast.success('Comment added successfully');
      // Refresh comments
      const res = await fetch(`http://localhost:5000/api/tickets/${selectedTicket.id}/comments`);
      setCommentsList(await res.json());
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Helper: Convert priority to a number for sorting
const getPriorityValue = (priority) => {
  switch (priority) {
    case "High": return 1;
    case "Medium": return 2;
    case "Low": return 3;
    default: return 4;
  }
};

// Helper: Check if due date is more than 2 days ago
const isExpired = (dueDateStr) => {
  if (!dueDateStr) return false;
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  const diffInTime = today - dueDate;
  const diffInDays = diffInTime / (1000 * 3600 * 24);
  return diffInDays > 2;
};

// Filter & Sort: Open
const open = tickets
  .filter((t) => t.status === "Open")
  .sort((a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority));

// In Progress
const inProcess = tickets
  .filter((t) => t.status === "In Progress")
  .sort((a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority));

// Resolved (show all even if overdue)
const resolved = tickets
  .filter((t) => t.status === "Resolved" && (!isExpired(t.dueDate)))
  .sort((a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority));


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
          body: JSON.stringify({ status: newStatus, userId: user.UserID }),
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
          body: JSON.stringify({ dueDate: newDueDate, userId: user.UserID }), // send ISO date and userId
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

  function handleCommentChange(e) {
    setComment(e.target.value);

    // Detect if user is typing @mention
    const caret = e.target.selectionStart;
    const text = e.target.value.slice(0, caret);
    const match = text.match(/@([\w\s]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setShowMentionDropdown(true);
      setMentionDropdownPos({ top: e.target.offsetTop + e.target.offsetHeight, left: e.target.offsetLeft });
      setFilteredMentions(
        mentionableUsers.filter(u =>
          u.FullName.toLowerCase().includes(match[1].toLowerCase())
        )
      );
    } else {
      setShowMentionDropdown(false);
      setMentionQuery('');
    }
  }

  function handleMentionKeyUp(e) {
    // If dropdown is open and user presses ArrowDown/ArrowUp/Enter, handle navigation/selection
    // (Optional: for keyboard navigation)
  }

  function handleMentionSelect(user) {
    // Insert @FullName at the current caret position
    const textarea = textareaRef.current;
    const caret = textarea.selectionStart;
    const text = comment;
    const match = text.slice(0, caret).match(/@([\w\s]*)$/);
    if (match) {
      const before = text.slice(0, caret - match[0].length);
      const after = text.slice(caret);
      const mentionText = `@${user.FullName} `;
      const newComment = before + mentionText + after;
      setComment(newComment);
      setShowMentionDropdown(false);
      setMentionQuery('');
      // Move caret after inserted mention
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(before.length + mentionText.length, before.length + mentionText.length);
      }, 0);
    }
  }
 


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
              title="In Progress"
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
                    <button
                      onClick={() => setActiveTab('comments')}
                      className={`pb-2 text-base font-medium ${
                        activeTab === 'comments'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Comments
                    </button>
                  </nav>
                </div>

                <div className="h-[580px] overflow-y-auto">
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
                          <strong>Priority:</strong> {selectedTicket.priority}
                        </p>
                        <p className="text-sm">
                    <strong>Problem:</strong>{" "}
                    {selectedTicket.problem.length > 100 ? (
                      <>
                        {selectedTicket.problem.slice(0, 100)}...
                        <button
                          onClick={() => setShowProblemModal(true)}
                          className="text-blue-600 hover:underline ml-1"
                        >
                          See More
                        </button>
                      </>
                    ) : (
                      selectedTicket.problem
                    )}
                  </p>
                  {showProblemModal && (
                    <div className="fixed inset-0 z-50 bg-black/40 bg-opacity-40 flex justify-center items-center">
                      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full max-h-[80vh]">
                        <h2 className="text-lg font-semibold mb-4">
                          Full Problem Description
                        </h2>
                        <div className="text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-60 pr-2">
                          {selectedTicket.problem}
                        </div>
                        <div className="text-right mt-4">
                          <button
                            onClick={() => setShowProblemModal(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
                            <option>In Progress</option>
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
                      </div>

                      {/* RIGHT: Evidence Files */}
                      <div className="space-y-4 h-[430px]">
                        <h4 className="font-semibold mb-2">Evidence Files</h4>
                        {evidenceList.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No evidence files available.
                          </p>
                        ) : (
                          <div className=" overflow-y-auto grid grid-cols-2 gap-4 p-2 border rounded bg-gray-50">
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
                    </div>
                  ) : activeTab === 'activity' ? (
                    <div className="space-y-4">
                      {selectedTicket && <TicketLogView ticketId={selectedTicket.id} />}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Comments Section */}
                      <div className="relative mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
                        <label className="block text-lg font-semibold text-gray-800 mb-3">Add Comment</label>
                        <div className="flex flex-col gap-3">
                          <textarea
                            ref={textareaRef}
                            rows={4} // Increased rows for better initial visibility
                            value={comment}
                            onChange={handleCommentChange}
                            onKeyUp={handleMentionKeyUp}
                            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y p-3 transition duration-200 ease-in-out"
                            placeholder="Type your comment here... Use @ to mention users."
                            style={{ minHeight: 80 }}
                          />
                        
                        </div>
                        {showMentionDropdown && filteredMentions.length > 0 && (
                          <div
                            className="absolute z-50 bg-white border border-blue-300 rounded-lg shadow-xl mt-2 max-h-48 overflow-y-auto w-full md:w-auto"
                            style={{ top: mentionDropdownPos.top + 10, left: mentionDropdownPos.left, minWidth: 200 }}
                          >
                            {filteredMentions.map(user => (
                              <div
                                key={user.UserID}
                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                                onMouseDown={e => { e.preventDefault(); handleMentionSelect(user); }}
                              >
                                <span className="font-medium text-blue-700">@{user.FullName}</span> <span className="text-sm text-gray-500">({user.Role})</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={handleAddComment}
                          disabled={!comment.trim()}
                          className="mt-4 inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition duration-200 ease-in-out"
                        >
                          Add Comment
                        </button>
                      </div>
                      <div className="mt-8">
                        <h4 className="font-semibold text-xl text-gray-800 mb-4">Comments</h4>
                        {commentsList.length === 0 ? (
                          <p className="text-gray-500 text-center py-4 border rounded-lg bg-white shadow-sm">No comments yet. Be the first to add one!</p>
                        ) : (
                          <ul className="space-y-4">
                            {commentsList.slice().reverse().map((c) => (
                              <li key={c.CommentID} className="border border-gray-200 rounded-lg bg-white p-4 flex flex-col sm:flex-row sm:items-start justify-between shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
                                <div className="flex-1">
                                  <div className="font-bold text-lg text-gray-900 mb-1">{c.FullName}</div>
                                  {c.Mentions && c.Mentions.trim() && (
                                    <div className="text-sm text-blue-600 font-medium mb-2 flex flex-wrap items-center gap-x-2">
                                      {c.Mentions.split(',').map((m, idx) =>
                                        m.trim() ? (
                                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">{m.trim()}</span>
                                        ) : null
                                      )}
                                    </div>
                                  )}
                                  <div className="mt-2 text-gray-800 leading-relaxed whitespace-pre-wrap text-base">{c.CommentText}</div>
                                </div>
                                <div className="text-xs text-gray-500 mt-3 sm:mt-0 sm:ml-4 text-right flex-shrink-0 min-w-[140px]">
                                  {new Date(c.CreatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
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
              <div className="relative max-w-lg h-[600px] p-4 bg-gray-200 rounded-lg shadow-lg flex flex-col">
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
