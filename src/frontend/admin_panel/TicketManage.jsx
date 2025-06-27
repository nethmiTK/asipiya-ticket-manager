import { useState, useEffect, useRef } from "react";
import { FaBell } from "react-icons/fa6";
import { MessageCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TicketCard from "./TicketCard";
import ChatSection from "./ChatSection";
import { useAuth } from "../../App";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import { toast } from "react-toastify";
import TicketLogView from "./TicketLogView";
import TicketDetailsTab from "./TicketDetailsTab";
import axios from "axios";
import { FaFilePdf, FaFileWord, FaFileArchive, FaFileAlt, FaFileImage } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';

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
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || "details");
  const [commentsList, setCommentsList] = useState([]);
  const [mentionableUsers, setMentionableUsers] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionDropdownPos, setMentionDropdownPos] = useState({
    top: 0,
    left: 0,
  });
  const [filteredMentions, setFilteredMentions] = useState([]);
  const textareaRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [userLikedComments, setUserLikedComments] = useState({});
  const [showAllComments, setShowAllComments] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [previewMenuIndex, setPreviewMenuIndex] = useState(null);

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
        const res = await axios.get(
          `http://localhost:5000/api/tickets/${selectedTicket.id}/comments?userId=${user.UserID}`
        );
        const data = res.data;
        setCommentsList(data);

        // Initialize userLikedComments state directly from fetched data
        const likedStatus = {};
        for (const comment of data) {
          likedStatus[comment.CommentID] = comment.UserHasLiked === 1; // Backend returns 1 or 0
        }
        setUserLikedComments(likedStatus);
      } catch (err) {
        console.error("Failed to load comments", err);
      }
    };
    fetchComments();
  }, [selectedTicket?.id, user.UserID]);

  useEffect(() => {
    if (selectedTicket) {
      fetch(`http://localhost:5000/api/mentionable-users?ticketId=${selectedTicket.id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch mentionable users');
          return res.json();
        })
        .then(data => {
          // ensure array
          const fetched = Array.isArray(data) ? data : [];
          let users = [...fetched];
          // add assigned supervisor
          const sup = supervisors.find(s => s.UserID === selectedTicket.assignedBy);
          if (sup && !users.some(u => u.UserID === sup.UserID)) {
            users.unshift(sup);
          }
          // add 'All Admins' option if admin
          if (user.Role === 'Admin') {
            users.unshift({ UserID: 'all-admins', FullName: 'All Admins' });
          }
          setMentionableUsers(users);
        })
        .catch(err => {
          console.error('Error fetching mentionable users:', err);
          setMentionableUsers([]);
        });
    }
  }, [selectedTicket, supervisors, user.Role]);

  const handleCardClick = (ticket) => {
    setSelectedTicket(ticket);
    setSearchParams({ ticketId: String(ticket.id), tab: 'details' });
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setComment("");
    setAttachments([]);
  };

  const handleAddComment = async () => {
    if (!selectedTicket || (!comment.trim() && attachments.length === 0)) {
      toast.warn("Comment text or an attachment is required.");
      return;
    }

    const formData = new FormData();
    formData.append("ticketId", selectedTicket.id);
    formData.append("userId", user.UserID);
    formData.append("comment", comment.trim());
    // Append each file under 'file' field for backend
    attachments.forEach(file => formData.append('file', file));

    // Extract mentions from comment text (e.g., @FullName)
    let mentionedUserIds = [];
    const processedComment = comment.trim(); // Keep original comment text for context
    const lowerCaseComment = processedComment.toLowerCase(); // Convert comment to lowercase once for efficiency

    // Sort mentionable users by length of FullName in descending order - with safety check
    const safeUsers = Array.isArray(mentionableUsers) ? mentionableUsers : [];
    const sortedMentionableUsers = [...safeUsers].sort((a, b) => b.FullName.length - a.FullName.length);

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
      formData.append("mentionedUserIds", mentionedUserIds.join(","));
    }

    try {
      await axios.post(
        `http://localhost:5000/api/tickets/${selectedTicket.id}/comments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      // Clear attachments after successful upload
      setAttachments([]);
      // Clear all form fields completely
      setComment("");
      setReplyingTo(null);
      
      // Clear file input field
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Reset textarea
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
      
      toast.success("Comment added successfully");
      
      // Refresh comments after adding
      const res = await axios.get(`http://localhost:5000/api/tickets/${selectedTicket.id}/comments?userId=${user.UserID}`); // Pass userId for likes
      setCommentsList(res.data);
      
      // Initialize userLikedComments state from refreshed data
      const likedStatus = {};
      for (const commentData of res.data) {
        likedStatus[commentData.CommentID] = commentData.UserHasLiked === 1;
      }
      setUserLikedComments(likedStatus);
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  // Handler to accumulate selected files and reset input
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length) {
      setAttachments(prev => [...prev, ...newFiles]);
    }
    e.target.value = null;
  };

  // Helper: Convert priority to a number for sorting
  const getPriorityValue = (priority) => {
    switch (priority) {
      case "High":
        return 1;
      case "Medium":
        return 2;
      case "Low":
        return 3;
      default:
        return 4;
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
    .sort(
      (a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority)
    );

  // In Progress
  const inProcess = tickets
    .filter((t) => t.status === "In Progress")
    .sort(
      (a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority)
    );

  // Resolved (show all even if overdue)
  const resolved = tickets
    .filter((t) => t.status === "Resolved" && !isExpired(t.dueDate))
    .sort(
      (a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority)
    );

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
      // Get the original resolution before update
      const originalTicket = tickets.find(t => t.id === selectedTicket.id);
      const oldResolution = originalTicket?.resolution || "";
      const newResolution = selectedTicket.resolution || "";
      
      const res = await fetch(
        `http://localhost:5000/tickets/${selectedTicket.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resolution: newResolution,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update ticket");

      // Log the resolution update to ticket log if resolution was added/changed
      if (newResolution && newResolution !== oldResolution) {
        try {
          await axios.post('http://localhost:5000/api/ticket-logs', {
            ticketId: selectedTicket.id,
            type: 'RESOLUTION_UPDATE',
            description: `Resolution summary updated: ${newResolution.substring(0, 100)}${newResolution.length > 100 ? '...' : ''}`,
            userId: user.UserID,
            oldValue: oldResolution,
            newValue: newResolution
          });
        } catch (logError) {
          console.error("Failed to log resolution update:", logError);
          // Don't fail the main update if logging fails
        }
      }

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
      setMentionDropdownPos({
        top: e.target.offsetTop + e.target.offsetHeight,
        left: e.target.offsetLeft,
      });
      setFilteredMentions(
        (Array.isArray(mentionableUsers) ? mentionableUsers : []).filter((u) =>
          u.FullName.toLowerCase().includes(match[1].toLowerCase())
        )
      );
    } else {
      setShowMentionDropdown(false);
      setMentionQuery("");
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
      setMentionQuery("");
      // Move caret after inserted mention
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          before.length + mentionText.length,
          before.length + mentionText.length
        );
      }, 0);
    }
  }

  // Function to handle liking/unliking a comment
  const handleLikeToggle = async (commentId) => {
    const hasLiked = userLikedComments[commentId];
    try {
      if (hasLiked) {
        // Unlike
        await axios.delete(
          `http://localhost:5000/api/comments/${commentId}/like`,
          { data: { userId: user.UserID } }
        );
        toast.info("Comment unliked.");
      } else {
        // Like
        await axios.post(
          `http://localhost:5000/api/comments/${commentId}/like`,
          { userId: user.UserID }
        );
        toast.success("Comment liked!");
      }
      // Toggle the local state immediately for responsiveness
      setUserLikedComments((prev) => ({ ...prev, [commentId]: !hasLiked }));
      // Re-fetch comments to get updated like counts from backend
      const res = await axios.get(`http://localhost:5000/api/tickets/${selectedTicket.id}/comments?userId=${user.UserID}`); // Pass userId for likes
      setCommentsList(res.data);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error(`Failed to ${hasLiked ? "unlike" : "like"} comment.`);
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

  const toggleExpandedReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const renderCommentTextWithMentions = (text) => {
    const parts = [];
    // Ensure mentionableUsers is an array before spreading
    const safeUsers = Array.isArray(mentionableUsers) ? mentionableUsers : [];
    // Sort mentionable users by length of FullName in descending order
    const sortedMentionableUsers = [...safeUsers].sort((a, b) => b.FullName.length - a.FullName.length);

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
          <span key={index} className="text-blue-600 font-semibold bg-blue-50 px-1 rounded">
            {segment.value}
          </span>
        );
      } else {
        return segment.value;
      }
    });
  };

  // Sync selectedTicket from URL param when tickets loaded
  useEffect(() => {
    const idParam = searchParams.get('ticketId');
    if (idParam && tickets.length) {
      const t = tickets.find(tkt => String(tkt.id) === idParam);
      if (t) setSelectedTicket(t);
    }
  }, [searchParams, tickets]);

  // Filter supervisors to only those assigned to tickets
  const availableSupervisors = supervisors.filter(s => tickets.some(t => t.assignedBy === s.UserID));

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
                  {availableSupervisors.map((sup) => (
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
                  className="absolute top-2 right-3 px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 text-xl font-bold"
                >
                  &larr; Back to Tickets
                </button>

                {/* Navigation Tabs */}
                <div className="border-b mb-4">
                  <nav className="flex gap-8">
                    <button
                      onClick={() => { setActiveTab("details"); setSearchParams({ ticketId: searchParams.get('ticketId'), tab: 'details' }); }}
                      className={`pb-2 text-base font-medium ${
                        activeTab === "details"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => { setActiveTab("activity"); setSearchParams({ ticketId: searchParams.get('ticketId'), tab: 'activity' }); }}
                      className={`pb-2 text-base font-medium ${
                        activeTab === "activity"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Activity Log
                    </button>
                    <button
                      onClick={() => { setActiveTab("comments"); setSearchParams({ ticketId: searchParams.get('ticketId'), tab: 'comments' }); }}
                      className={`pb-2 text-base font-medium ${
                        activeTab === "comments"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Comments
                    </button>
                    {/* NEW CHAT TAB */}
                    <button
                      onClick={() => { setActiveTab("chat"); setSearchParams({ ticketId: searchParams.get('ticketId'), tab: 'chat' }); }}
                      className={`pb-2 text-base font-medium ${
                        activeTab === "chat"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Chat
                    </button>
                  </nav>
                </div>

                <div className="h-[580px] overflow-y-auto">
                  {activeTab === "details" ? (
                    <TicketDetailsTab
                      selectedTicket={selectedTicket}
                      setSelectedTicket={setSelectedTicket}
                      user={user} // Pass user if needed
                      setTickets={setTickets} // Pass setTickets if updates need to propagate
                      evidenceList={evidenceList}
                      setShowProblemModal={setShowProblemModal}
                      showProblemModal={showProblemModal}
                      // Pass any other state variables or functions that TicketDetailsTab needs
                    />
                  ) : activeTab === "activity" ? (
                    <div className="space-y-4">
                      {selectedTicket && (
                        <TicketLogView ticketId={selectedTicket.id} />
                      )}
                    </div>
                  ) : activeTab === "comments" ? (
                    <div className="space-y-4">
                      <div className="relative mb-6 p-6 border border-gray-200 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative">
                            <img
                              src={
                                user?.ProfileImagePath
                                  ? `http://localhost:5000/uploads/profile_images/${user.ProfileImagePath}`
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.FullName || 'User')}&background=random&color=fff`
                              }
                              alt={user?.FullName || 'User'}
                              className="w-12 h-12 rounded-full object-cover ring-3 ring-blue-100 shadow-md"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <label className="block text-lg font-semibold text-gray-800 mb-1">
                              Share your thoughts
                            </label>
                            <p className="text-sm text-gray-500">
                              What would you like to discuss about this ticket?
                            </p>
                          </div>
                        </div>
                        {replyingTo && (
                          <div className="flex items-center gap-3 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <span className="text-blue-800 font-medium">Replying to</span>
                              <span className="font-bold text-blue-900 ml-2">@{replyingTo.userName}</span>
                            </div>
                            <button
                              onClick={handleCancelReply}
                              className="p-2 text-blue-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                              title="Cancel reply"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                        <div className="flex flex-col gap-4">
                          <div className="relative">
                            <textarea
                              ref={textareaRef}
                              rows={4}
                              value={comment}
                              onChange={handleCommentChange}
                              onKeyUp={handleMentionKeyUp}
                              className="block w-full rounded-2xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none p-4 text-base transition duration-300 ease-in-out placeholder-gray-400 bg-gray-50 focus:bg-white"
                              placeholder="Share your thoughts... Use @ to mention team members"
                              style={{
                                minHeight: 120,
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                fontSize: '16px',
                                lineHeight: '1.5'
                              }}
                            />
                            {/* Live mention preview overlay */}
                            {comment && (
                              <div
                                className="absolute inset-0 pointer-events-none p-4 text-base rounded-xl overflow-hidden"
                                style={{
                                  background: 'transparent',
                                  color: 'transparent',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  fontFamily: 'system-ui, -apple-system, sans-serif',
                                  lineHeight: '1.5'
                                }}
                              >
                                {(() => {
                                  // Sort mentionable users by length of FullName in descending order for better matching - with safety check
                                  const safeUsers = Array.isArray(mentionableUsers) ? mentionableUsers : [];
                                  const sortedMentionableUsers = [...safeUsers].sort((a, b) => b.FullName.length - a.FullName.length);
                                  
                                  let segments = [{ type: 'text', value: comment }];

                                  for (const mentionUser of sortedMentionableUsers) {
                                    const escapedFullName = mentionUser.FullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                    const mentionRegex = new RegExp(`@${escapedFullName}`, 'gi');
                                    const newSegments = [];

                                    for (const segment of segments) {
                                      if (segment.type === 'mention') {
                                        newSegments.push(segment);
                                        continue;
                                      }

                                      let lastSplitIndex = 0;
                                      let match;
                                      while ((match = mentionRegex.exec(segment.value)) !== null) {
                                        const preMatchText = segment.value.substring(lastSplitIndex, match.index);
                                        if (preMatchText) {
                                          newSegments.push({ type: 'text', value: preMatchText });
                                        }
                                        newSegments.push({ type: 'mention', value: match[0], user: mentionUser });
                                        lastSplitIndex = match.index + match[0].length;
                                      }
                                      const remainingText = segment.value.substring(lastSplitIndex);
                                      if (remainingText) {
                                        newSegments.push({ type: 'text', value: remainingText });
                                      }
                                    }
                                    segments = newSegments;
                                  }

                                  return segments.map((segment, index) => {
                                    if (segment.type === 'mention') {
                                      return (
                                        <span 
                                          key={index} 
                                          className="bg-blue-200 text-blue-800 px-1 rounded font-semibold"
                                          style={{ color: '#1e40af' }}
                                        >
                                          {segment.value}
                                        </span>
                                      );
                                    } else {
                                      return segment.value;
                                    }
                                  });
                                })()}
                              </div>
                            )}
                            {comment.trim() && (
                              <div className="absolute bottom-3 right-3 px-2 py-1 bg-white bg-opacity-90 rounded-lg shadow-sm">
                                <span className="text-xs text-gray-500 font-medium">
                                  {comment.length} characters
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50">
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4"
                          >
                            <div className="p-3 bg-white rounded-full shadow-sm">
                              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 font-medium">
                              Click to attach file or drag and drop
                            </span>
                            <span className="text-xs text-gray-500">
                              Images, Videos, Documents, PDFs supported (Max 10MB)
                            </span>
                          </label>
                        </div>
                        
                        {/* Preview selected attachments */}
                        {attachments.length > 0 && (
                          <div className="mt-3 py-3 px-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium text-gray-700">{attachments.length} files selected</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {attachments.map((file, idx) => {
                                // Determine icon based on extension and file type
                                const ext = file.name.split('.').pop().toLowerCase();
                                let FileIcon = FaFileAlt; // Default generic file icon

                                if (file.type.startsWith('image/')) FileIcon = FaFileImage;
                                else if (file.type.startsWith('video/')) FileIcon = FaFileAlt; // No specific video icon in Fa set, use generic for now
                                else if (ext === 'pdf') FileIcon = FaFilePdf;
                                else if (['doc', 'docx'].includes(ext)) FileIcon = FaFileWord;
                                else if (['zip', 'rar', '7z'].includes(ext)) FileIcon = FaFileArchive;
                                else if (['txt', 'csv'].includes(ext)) FileIcon = FaFileAlt;
                                else if (['pptx', 'ppt'].includes(ext)) FileIcon = FaFileAlt;
                                else if (['xls', 'xlsx'].includes(ext)) FileIcon = FaFileAlt;

                                return (
                                  <div key={idx} className="relative bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center space-x-3 group hover:bg-gray-100 transition-colors duration-200">
                                    <div className="flex-shrink-0">
                                      <FileIcon className="text-3xl text-blue-500" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                      <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <button onClick={() => setPreviewMenuIndex(previewMenuIndex === idx ? null : idx)} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200 transition-colors">
                                        <FiMoreVertical />
                                      </button>
                                      {previewMenuIndex === idx && (
                                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-36">
                                          <button onClick={() => window.open(URL.createObjectURL(file), '_blank')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md">Open</button>
                                          <button onClick={() => { const url = URL.createObjectURL(file); const a = document.createElement('a'); a.href = url; a.download = file.name; a.click(); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Download</button>
                                          <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-md">Remove</button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              {/* Add More button - new style */}
                              <button
                                onClick={() => document.getElementById('file-upload').click()}
                                className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors duration-200 aspect-square"
                                title="Add more attachments"
                              >
                                <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-sm font-medium">Add More</span>
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {showMentionDropdown && filteredMentions.length > 0 && (
                          <div
                            className="absolute z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl mt-2 max-h-64 overflow-y-auto backdrop-blur-sm"
                            style={{
                              top: mentionDropdownPos.top + 10,
                              left: mentionDropdownPos.left,
                              minWidth: 280,
                            }}
                          >
                            <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                              <h4 className="text-sm font-semibold text-gray-700">Mention Team Members</h4>
                            </div>
                            {filteredMentions.map((user, index) => (
                              <div
                                key={user.UserID}
                                className={`px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-all duration-200 ${
                                  index === filteredMentions.length - 1 ? 'rounded-b-2xl' : 'border-b border-gray-50'
                                }`}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleMentionSelect(user);
                                }}
                              >
                                <div className="relative">
                                  <img
                                    src={
                                      user.ProfileImagePath
                                        ? `http://localhost:5000/uploads/${user.ProfileImagePath}`
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.FullName)}&background=random&color=fff`
                                    }
                                    alt={user.FullName}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                                  />
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-blue-700">
                                      @{user.FullName}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      user.Role === 'Admin' ? 'bg-red-100 text-red-700' :
                                      user.Role === 'Supervisor' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      {user.Role}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    Click to mention
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>Use @ to mention teammates</span>
                            </div>
                            {attachments.length > 0 && (
                              <div className="flex items-center gap-1 text-green-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span>File attached</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={handleAddComment}
                            disabled={!comment.trim() && !attachments.length}
                            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            {replyingTo ? 'Post Reply' : 'Share Comment'}
                          </button>
                        </div>
                      </div>
                      <div className="mt-8 px-4">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="font-semibold text-xl text-gray-800">Comments ({commentsList.length})</h4>
                          {commentsList.length > 5 && (
                            <button
                              onClick={() => setShowAllComments(!showAllComments)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                            >
                              {showAllComments ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  View All Comments
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        {commentsList.length === 0 ? (
                          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-gray-500 text-lg">No comments yet</p>
                            <p className="text-gray-400 text-sm mt-1">Be the first to start the conversation!</p>
                          </div>
                        ) : (
                          <ul className="space-y-6">
                            {commentsList
                              .filter(comment => !comment.ReplyToCommentID)
                              .slice().reverse()
                              .slice(0, showAllComments ? undefined : 5)
                              .map((c) => (
                              <CommentItem
                                key={c.CommentID}
                                comment={c}
                                allComments={commentsList}
                                currentUser={user}
                                onReplyClick={handleReplyClick}
                                onLikeToggle={handleLikeToggle}
                                userLikedComments={userLikedComments}
                                mentionableUsers={mentionableUsers}
                                toggleExpandedReplies={toggleExpandedReplies}
                                expandedReplies={expandedReplies}
                              />
                            ))}
                          </ul>
                        )}
                        {commentsList.filter(comment => !comment.ReplyToCommentID).length > 5 && !showAllComments && (
                          <div className="text-center mt-6">
                            <button
                              onClick={() => setShowAllComments(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              View {commentsList.filter(comment => !comment.ReplyToCommentID).length - 5} more comments
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : activeTab === "chat" ? ( // NEW: Chat Section content
                    <div className="h-[580px] p-4 bg-gray-100 rounded-lg flex flex-col">
                      <ChatSection
                        user={selectedTicket.user}
                        supportUser={selectedTicket.assignedBy}
                        initialMessages={initialMessages}
                        ticket={selectedTicket}
                        ticketId={selectedTicket.id}
                        role={"Supervisor"} // Adjust role based on actual loggedInUser.Role
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
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
  toggleExpandedReplies,
  expandedReplies
}) {
  const nestedReplies = allComments
    .filter((c) => c.ReplyToCommentID === comment.CommentID)
    .sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));

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
    // Ensure mentionableUsers is an array before spreading
    const safeUsers = Array.isArray(mentionableUsers) ? mentionableUsers : [];
    // Sort mentionable users by length of FullName in descending order
    const sortedMentionableUsers = [...safeUsers].sort((a, b) => b.FullName.length - a.FullName.length);

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
          <span key={index} className="text-blue-600 font-semibold bg-blue-50 px-1 rounded">
            {segment.value}
          </span>
        );
      } else {
        return segment.value;
      }
    });
  };

  return (
    <li className="border border-gray-200 rounded-lg bg-white p-6 flex flex-col shadow-sm hover:shadow-md transition-all duration-200 ease-in-out">
      <div className="flex items-start flex-1">
        {/* Profile Picture */}
        <div className="relative">
          <img
            src={
              comment.ProfileImagePath
                ? `http://localhost:5000/uploads/${comment.ProfileImagePath}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.FullName)}&background=random&color=fff`
            }
            alt={comment.FullName}
            className="w-12 h-12 rounded-full mr-4 object-cover ring-2 ring-gray-100"
          />
          {/* Online status indicator could be added here */}
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="flex items-center mb-1">
            <span className="font-semibold text-gray-900 mr-2">{comment.FullName}</span>
            <span className="text-gray-500 text-sm">• {formatRelativeTime(comment.CreatedAt)}</span>
          </div>
          
          {/* Reply-to information */}
          {comment.ReplyToCommentID && comment.RepliedToUserName && (
            <div className="text-sm text-blue-600 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Replying to <span className="font-medium">@{comment.RepliedToUserName}</span>
            </div>
          )}

          {/* Comment text */}
          <div className={`text-gray-800 leading-relaxed mb-3 ${comment.ReplyToCommentID ? 'bg-gray-50 p-3 rounded-lg border-l-4 border-blue-200' : ''}`}>
            <div className="whitespace-pre-wrap">
              {renderCommentTextWithMentions(comment.CommentText)}
            </div>
          </div>

          {/* Display Attachment if exists */}
          {comment.AttachmentFullUrl && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2 font-medium">📎 Attachment:</p>
              {
                isImageAttachment(comment.AttachmentFileType) ? (
                  <a href={comment.AttachmentFullUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={comment.AttachmentFullUrl} alt={comment.AttachmentFileName} className="max-w-sm h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow" />
                  </a>
                ) : isVideoAttachment(comment.AttachmentFileType) ? (
                  <video controls src={comment.AttachmentFullUrl} className="max-w-sm h-auto rounded-lg shadow-sm"></video>
                ) : isAudioAttachment(comment.AttachmentFileType) ? (
                  <audio controls src={comment.AttachmentFullUrl} className="w-full max-w-sm"></audio>
                ) : isPDFAttachment(comment.AttachmentFileType) ? (
                  <a href={comment.AttachmentFullUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    {comment.AttachmentFileName}
                  </a>
                ) : (
                  <a href={comment.AttachmentFullUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                    </svg>
                    {comment.AttachmentFileName}
                  </a>
                )
              }
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLikeToggle(comment.CommentID)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  userLikedComments[comment.CommentID] 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className={`w-4 h-4 ${userLikedComments[comment.CommentID] ? 'fill-current text-red-600' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {comment.LikesCount || 0}
              </button>
            </div>
            
            <button
              onClick={() => onReplyClick(comment.CommentID, comment.FullName)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply
            </button>
          </div>
        </div>
      </div>
      
      {/* Nested replies */}
      {nestedReplies.length > 0 && (
        <div className="mt-4 pl-16">
          <div className="border-l-2 border-gray-200 pl-6">
            {nestedReplies.length > 2 && (
              <button 
                onClick={() => toggleExpandedReplies(comment.CommentID)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedReplies[comment.CommentID] ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
                {expandedReplies[comment.CommentID] ? 'Hide replies' : `View ${nestedReplies.length} replies`}
              </button>
            )}
            <ul className="space-y-4">
              {(expandedReplies[comment.CommentID] ? nestedReplies : nestedReplies.slice(0, 2)).map((reply) => (
                <CommentItem
                  key={reply.CommentID}
                  comment={reply}
                  allComments={allComments}
                  currentUser={currentUser}
                  onReplyClick={onReplyClick}
                  onLikeToggle={onLikeToggle}
                  userLikedComments={userLikedComments}
                  mentionableUsers={mentionableUsers}
                  toggleExpandedReplies={toggleExpandedReplies}
                  expandedReplies={expandedReplies}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}
