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
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [userLikedComments, setUserLikedComments] = useState({});

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
        // Pass user.UserID to the backend to get UserHasLiked status
        const res = await axios.get(`http://localhost:5000/api/tickets/${selectedTicket.id}/comments?userId=${user.UserID}`);
        const data = res.data;
        setCommentsList(data);

        // Initialize userLikedComments state directly from fetched data
        const likedStatus = {};
        for (const comment of data) {
            likedStatus[comment.CommentID] = comment.UserHasLiked === 1; // Backend returns 1 or 0
        }
        setUserLikedComments(likedStatus);

      } catch (err) {
        console.error('Failed to load comments', err);
      }
    };
    fetchComments();
  }, [selectedTicket?.id, user.UserID]);

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
    if (!selectedTicket || (!comment.trim() && !attachmentFile)) {
      toast.warn("Comment text or an attachment is required.");
      return;
    }

    const formData = new FormData();
    formData.append("ticketId", selectedTicket.id);
    formData.append("userId", user.UserID);
    formData.append("comment", comment.trim());
    if (replyingTo) {
      formData.append("replyToCommentId", replyingTo.commentId);
    }
    if (attachmentFile) {
      formData.append("file", attachmentFile);
    }

    // Extract mentions from comment text (e.g., @FullName)
    let mentionedUserIds = [];
    const processedComment = comment.trim(); // Keep original comment text for context
    const lowerCaseComment = processedComment.toLowerCase(); // Convert comment to lowercase once for efficiency

    // Sort mentionable users by length of FullName in descending order
    const sortedMentionableUsers = [...mentionableUsers].sort((a, b) => b.FullName.length - a.FullName.length);

    for (const user of sortedMentionableUsers) {
      const lowerCaseFullName = user.FullName.toLowerCase().trim();
      // Check if "@full name" is present in the lowercased comment
      if (lowerCaseComment.includes(`@${lowerCaseFullName}`)) {
        mentionedUserIds.push(user.UserID);
      }
    }
    
    // Ensure unique IDs if a user is mentioned multiple times
    mentionedUserIds = [...new Set(mentionedUserIds)];
    console.log("Frontend - Mentions to send:", mentionedUserIds); // Debugging log

    if (mentionedUserIds.length > 0) {
        formData.append("mentionedUserIds", mentionedUserIds.join(','));
    }

    try {
      await axios.post(`http://localhost:5000/api/tickets/${selectedTicket.id}/comments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setComment('');
      setAttachmentFile(null);
      setReplyingTo(null);
      toast.success('Comment added successfully');
      // Refresh comments after adding
      const res = await axios.get(`http://localhost:5000/api/tickets/${selectedTicket.id}/comments?userId=${user.UserID}`); // Pass userId for likes
      setCommentsList(res.data);
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
        `http://localhost:5000/api/tickets/${selectedTicket.id}/status`,
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
    const newDueDate = rawDate;

    setSelectedTicket((prev) => ({
      ...prev,
      dueDate: rawDate,
    }));

    try {
      const res = await fetch(
        `http://localhost:5000/api/tickets/${selectedTicket.id}/due-date`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dueDate: newDueDate, userId: user.UserID }),
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
 

  // Function to handle liking/unliking a comment
  const handleLikeToggle = async (commentId) => {
    const hasLiked = userLikedComments[commentId];
    try {
      if (hasLiked) {
        // Unlike
        await axios.delete(`http://localhost:5000/api/comments/${commentId}/like`, { data: { userId: user.UserID } });
        toast.info("Comment unliked.");
      } else {
        // Like
        await axios.post(`http://localhost:5000/api/comments/${commentId}/like`, { userId: user.UserID });
        toast.success("Comment liked!");
      }
      // Toggle the local state immediately for responsiveness
      setUserLikedComments(prev => ({ ...prev, [commentId]: !hasLiked }));
      // Re-fetch comments to get updated like counts from backend
      const res = await axios.get(`http://localhost:5000/api/tickets/${selectedTicket.id}/comments?userId=${user.UserID}`); // Pass userId for likes
      setCommentsList(res.data);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error(`Failed to ${hasLiked ? 'unlike' : 'like'} comment.`);
    }
  };

  // Function to initiate a reply
  const handleReplyClick = (commentId, userName) => {
    setReplyingTo({ commentId, userName });
    setComment(`@${userName} `); // Pre-fill textarea with mention
    textareaRef.current.focus();
  };

  // Function to cancel a reply
  const handleCancelReply = () => {
    setReplyingTo(null);
    setComment("");
  };

  const renderCommentTextWithMentions = (text) => {
    const parts = [];
    // Sort mentionable users by length of FullName in descending order
    const sortedMentionableUsers = [...mentionableUsers].sort((a, b) => b.FullName.length - a.FullName.length);

    let segments = [{ type: 'text', value: text }];

    for (const user of sortedMentionableUsers) {
      const escapedFullName = user.FullName.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&'); // Correct escaping for regex
      const mentionRegex = new RegExp(`@${escapedFullName}`, 'gi');
      const newSegments = [];

      for (const segment of segments) {
        if (segment.type === 'mention') {
          newSegments.push(segment); // Already a mention, keep it
          continue;
        }

        let lastSplitIndex = 0;
        let match;
        while ((match = mentionRegex.exec(segment.value)) !== null) {
          const preMatchText = segment.value.substring(lastSplitIndex, match.index);
          if (preMatchText) {
            newSegments.push({ type: 'text', value: preMatchText });
          }
          newSegments.push({ type: 'mention', value: match[0], user: user });
          lastSplitIndex = match.index + match[0].length;
        }
        const remainingText = segment.value.substring(lastSplitIndex);
        if (remainingText) {
          newSegments.push({ type: 'text', value: remainingText });
        }
      }
      segments = newSegments;
    }

    // Convert segments into JSX elements
    return segments.map((segment, index) => {
      if (segment.type === 'mention') {
        return (
          <span key={index} className="text-blue-600 font-semibold">
            {segment.value}
          </span>
        );
      } else {
        return segment.value;
      }
    });
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
            {!selectedTicket ? (
              <>
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
              </>
            ) : (
              <div className="bg-white rounded-xl p-4 w-full shadow-lg relative mt-8">
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
                >
                  Back to Tickets
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
                      <div className="relative mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
                        <label className="block text-lg font-semibold text-gray-800 mb-3">Add Comment</label>
                        {replyingTo && (
                          <div className="flex items-center gap-2 mb-2 p-2 bg-blue-100 rounded-md text-blue-800">
                            Replying to <span className="font-semibold">@{replyingTo.userName}</span>
                            <button onClick={handleCancelReply} className="ml-auto text-blue-600 hover:text-blue-800 font-bold">
                              X
                            </button>
                          </div>
                        )}
                        <div className="flex flex-col gap-3">
                          <textarea
                            ref={textareaRef}
                            rows={4}
                            value={comment}
                            onChange={handleCommentChange}
                            onKeyUp={handleMentionKeyUp}
                            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y p-3 transition duration-200 ease-in-out"
                            placeholder="Type your comment here... Use @ to mention users."
                            style={{ minHeight: 80 }}
                          />
                        </div>
                        <input
                          type="file"
                          onChange={(e) => setAttachmentFile(e.target.files[0])}
                          className="mt-3 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        />
                        {attachmentFile && (
                          <p className="mt-2 text-sm text-gray-600">Attached: {attachmentFile.name}</p>
                        )}
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
                          disabled={!comment.trim() && !attachmentFile}
                          className="mt-4 inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition duration-200 ease-in-out"
                        >
                          Add Comment
                        </button>
                      </div>
                      <div className="mt-8 px-4">
                        <h4 className="font-semibold text-xl text-gray-800 mb-4">Comments</h4>
                        {commentsList.length === 0 ? (
                          <p className="text-gray-500 text-center py-4 border rounded-lg bg-white shadow-sm">No comments yet. Be the first to add one!</p>
                        ) : (
                          <ul className="space-y-4">
                            {commentsList
                              .filter(comment => !comment.ReplyToCommentID)
                              .slice().reverse().map((c) => (
                              <CommentItem
                                key={c.CommentID}
                                comment={c}
                                allComments={commentsList}
                                currentUser={user}
                                onReplyClick={handleReplyClick}
                                onLikeToggle={handleLikeToggle}
                                userLikedComments={userLikedComments}
                                mentionableUsers={mentionableUsers}
                              />
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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

// New CommentItem Component for rendering comments and replies
function CommentItem({
  comment,
  allComments,
  currentUser,
  onReplyClick,
  onLikeToggle,
  userLikedComments,
  mentionableUsers,
}) {
  const nestedReplies = allComments.filter(
    (c) => c.ReplyToCommentID === comment.CommentID
  ).sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));

  // Helper for relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const isImageAttachment = (fileType) => fileType && fileType.startsWith('image/');
  const isVideoAttachment = (fileType) => fileType && fileType.startsWith('video/');
  const isAudioAttachment = (fileType) => fileType && fileType.startsWith('audio/');
  const isPDFAttachment = (fileType) => fileType && fileType === 'application/pdf';

  const renderCommentTextWithMentions = (text) => {
    const parts = [];
    // Sort mentionable users by length of FullName in descending order
    const sortedMentionableUsers = [...mentionableUsers].sort((a, b) => b.FullName.length - a.FullName.length);

    let segments = [{ type: 'text', value: text }];

    for (const user of sortedMentionableUsers) {
      const escapedFullName = user.FullName.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&'); // Correct escaping for regex
      const mentionRegex = new RegExp(`@${escapedFullName}`, 'gi');
      const newSegments = [];

      for (const segment of segments) {
        if (segment.type === 'mention') {
          newSegments.push(segment); // Already a mention, keep it
          continue;
        }

        let lastSplitIndex = 0;
        let match;
        while ((match = mentionRegex.exec(segment.value)) !== null) {
          const preMatchText = segment.value.substring(lastSplitIndex, match.index);
          if (preMatchText) {
            newSegments.push({ type: 'text', value: preMatchText });
          }
          newSegments.push({ type: 'mention', value: match[0], user: user });
          lastSplitIndex = match.index + match[0].length;
        }
        const remainingText = segment.value.substring(lastSplitIndex);
        if (remainingText) {
          newSegments.push({ type: 'text', value: remainingText });
        }
      }
      segments = newSegments;
    }

    // Convert segments into JSX elements
    return segments.map((segment, index) => {
      if (segment.type === 'mention') {
        return (
          <span key={index} className="text-blue-600 font-semibold">
            {segment.value}
          </span>
        );
      } else {
        return segment.value;
      }
    });
  };

  return (
    <li className="border border-gray-200 rounded-lg bg-white p-4 flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
      <div className="flex items-start flex-1">
        {/* Profile Picture */}
        <img
          src={comment.ProfileImagePath ? `http://localhost:5000/${comment.ProfileImagePath}` : 'https://via.placeholder.com/40'} // Placeholder if no image
          alt={comment.FullName}
          className="w-10 h-10 rounded-full mr-4 object-cover"
        />
        <div className="flex-1 flex flex-col">
          <div className="font-bold text-base text-gray-900 flex items-center">
            {comment.FullName}
            <span className="text-gray-500 font-normal ml-2 text-xs">• {formatRelativeTime(comment.CreatedAt)}</span>
          </div>
          {/* Add reply-to information here */}
          {comment.ReplyToCommentID && comment.RepliedToUserName && (
            <div className="text-xs text-gray-600 mb-2 pl-3 border-l-2 border-blue-300 ml-1.5">
              Replying to <span className="font-semibold text-blue-600">@{comment.RepliedToUserName}</span>
            </div>
          )}

          <div className={`mt-1 text-sm ${comment.ReplyToCommentID ? 'bg-gray-50 p-2 rounded-lg' : ''}`}> {/* Conditional styling for reply bubble */}
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
              {renderCommentTextWithMentions(comment.CommentText)}
            </div>
          </div>

          {/* Display Attachment if exists */}
          {comment.AttachmentFullUrl && (
            <div className="mt-3 p-3 bg-gray-100 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Attachment:</p>
              {
                isImageAttachment(comment.AttachmentFileType) ? (
                  <a href={comment.AttachmentFullUrl} target="_blank" rel="noopener noreferrer">
                    <img src={comment.AttachmentFullUrl} alt={comment.AttachmentFileName} className="max-w-xs h-auto rounded-md shadow-sm" />
                  </a>
                ) : isVideoAttachment(comment.AttachmentFileType) ? (
                  <video controls src={comment.AttachmentFullUrl} className="max-w-xs h-auto rounded-md shadow-sm"></video>
                ) : isAudioAttachment(comment.AttachmentFileType) ? (
                  <audio controls src={comment.AttachmentFullUrl} className="w-full"></audio>
                ) : isPDFAttachment(comment.AttachmentFileType) ? (
                  <a href={comment.AttachmentFullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2h2v2H6V6zm4 0h4v2h-4V6zm0 4h4v2h-4v-2z" clipRule="evenodd" />
                    </svg>
                    {comment.AttachmentFileName}
                  </a>
                ) : (
                  <a href={comment.AttachmentFullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                    </svg>
                    {comment.AttachmentFileName}
                  </a>
                )
              }
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100 gap-4">
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.834 0 1.5.666 1.5 1.5v2.25H9.75a3 3 0 0 1 3 3v1.5a3 3 0 0 1-3 3H5.25A3 3 0 0 1 2.25 18V7.5M14.25 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.133-.658-2.278-1.637-2.75A1.012 1.012 0 0 1 15.126 3c-.668 0-1.348.052-1.996.148A6 6 0 0 1 9.75 5.55v2.757m-3.956 2.109l-2.672 2.672a2.25 2.25 0 0 0 0 3.182l.967.967a2.25 2.25 0 0 0 3.182 0l2.672-2.672M15.75 10.5l-1.5-1.5m1.5 1.5l1.5 1.5m-1.5-1.5L12 9M9 12H4.5"
                />
              </svg>
              {comment.LikesCount || 0} Likes
            </span>
            <button
              onClick={() => onLikeToggle(comment.CommentID)}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200
              ${userLikedComments[comment.CommentID] ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${userLikedComments[comment.CommentID] ? 'text-white' : 'text-gray-500'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.815 3 8.25c0 7.219 2.912 11.313 7.5 14.002 4.588-2.69 7.5-6.783 7.5-14.002z" />
              </svg>
              {userLikedComments[comment.CommentID] ? 'Unlike' : 'Like'}
            </button>
            <button
              onClick={() => onReplyClick(comment.CommentID, comment.FullName)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9.602 18.25M9.813 15.904c.007 0 .011.127.006.167L6.913 18.79M9.813 15.904l3.183 2.11M7.643 14.048c.007.117.02.242.032.365.011.123.024.248.037.37.048.449.139.897.272 1.328m-6.428-1.328l1.676 1.676c.47.47.854 1.066 1.165 1.696m-6.428-1.328C1.868 12.636 1.5 10.59 1.5 8.25c0-4.757 3.08-8.75 7.5-8.75s7.5 3.993 7.5 8.75c0 2.34-1.18 4.672-3.187 6.075m-8.995-6.075L7.643 14.048M16.5 19.103V12M15 19.103H9m-3.857-2.052c-.011-.123-.024-.248-.037-.37a3.493 3.493 0 01-.272-1.328H2.25c.007 0 .011.127.006.167L.583 18.79M15 12V9.75M15 12H9.75" />
              </svg>
              Reply
            </button>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-3 sm:mt-0 sm:ml-4 text-right flex-shrink-0 min-w-[140px] hidden"> {/* Hidden as timestamp moved next to name */}
        {formatRelativeTime(comment.CreatedAt)}
      </div>
      {nestedReplies.length > 0 && (
        <ul className="mt-4 pl-10 w-full space-y-4 border-l-2 border-gray-200">
          {nestedReplies.map((reply) => (
            <CommentItem 
              key={reply.CommentID} 
              comment={reply} 
              allComments={allComments} // Pass allComments for nested replies
              currentUser={currentUser} 
              onReplyClick={onReplyClick} 
              onLikeToggle={onLikeToggle} 
              userLikedComments={userLikedComments}
              mentionableUsers={mentionableUsers}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
