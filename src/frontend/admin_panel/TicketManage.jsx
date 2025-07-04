import { useState, useEffect, useRef, useCallback} from "react";
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
import axiosClient from "../axiosClient";
import { FaFilePdf, FaFileWord, FaFileArchive, FaFileAlt, FaFileImage } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';
import AdminNavBar from "../../user_components/NavBar/AdminNavBar";
import NotificationPanel from "../components/NotificationPanel";
import { io } from 'socket.io-client';

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

const handleForceDownload = async (url, filename) => {
  try {
    if (url.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/octet-stream',
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Download failed. Please try again.");
  }
};

const canPreviewInBrowser = (fileType) => {
  return (
    fileType.startsWith('image/') ||
    fileType === 'application/pdf' ||
    fileType.startsWith('video/') ||
    fileType.startsWith('audio/') ||
    fileType === 'text/plain' ||
    fileType === 'text/html' ||
    fileType === 'text/css' ||
    fileType === 'text/javascript' ||
    fileType === 'application/json'
  );
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

  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const notificationRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [error, setError] = useState(null); // New error state
  const [unreadChatCounts, setUnreadChatCounts] = useState({}); // New state for unread chat counts

  // Utility function to set cursor position reliably
  const setCursorPosition = (textarea, position) => {
    if (!textarea) return;

    try {
      textarea.focus();

      // Multiple attempts with different timing for better reliability
      const setPosition = () => {
        if (textarea.setSelectionRange) {
          textarea.setSelectionRange(position, position);
        }
      };

      // Immediate attempt
      setPosition();

      // Delayed attempts as fallback
      setTimeout(setPosition, 10);
      setTimeout(setPosition, 50);

    } catch (error) {
      console.warn('Could not set cursor position:', error);
    }
  };

  // This computes which supervisorId to use based on user role and selection
  const supervisorIdToUse =
    user.Role === "Admin" && selectedSupervisorId
      ? selectedSupervisorId
      : user.UserID;

  // Handle cursor positioning after comment changes (especially for mentions)
  useEffect(() => {
    if (textareaRef.current && textareaRef.current.pendingCursorPosition !== undefined) {
      const textarea = textareaRef.current;
      const position = textarea.pendingCursorPosition;

      // Clear the pending position
      delete textarea.pendingCursorPosition;

      // Set cursor position with multiple timing strategies for maximum reliability
      const setCursor = () => {
        if (textarea) {
          textarea.focus();
          try {
            textarea.setSelectionRange(position, position);
          } catch (e) {
            console.warn('Could not set cursor position:', e);
          }
        }
      };

      // Immediate attempt
      setCursor();

      // requestAnimationFrame for next repaint
      requestAnimationFrame(() => {
        setCursor();
      });

      // Additional fallbacks with timeouts
      setTimeout(setCursor, 10);
      setTimeout(setCursor, 50);
      setTimeout(setCursor, 100);
    }
  }, [comment]);

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

        // Fetch unread chat message counts for each ticket
        const chatCounts = {};
        for (const ticket of mappedTickets) {
          try {
            const response = await axiosClient.get(`/api/notifications/chat/count/${user.UserID}/${ticket.id}`);
            chatCounts[ticket.id] = response.data.count;
          } catch (chatError) {
            console.error(`Error fetching unread chat count for ticket ${ticket.id}:`, chatError);
            chatCounts[ticket.id] = 0;
          }
        }
        setUnreadChatCounts(chatCounts);

        setTickets(mappedTickets);
      } catch (err) {
        console.error("Error loading tickets", err);
      }
    };

    fetchTickets();
  }, [selectedSupervisorId, selectedSystem, user.UserID]);

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

        // Fetch unread chat message counts for each ticket
        const chatCounts = {};
        for (const ticket of mappedTickets) {
          try {
            const response = await axiosClient.get(`/api/notifications/chat/count/${user.UserID}/${ticket.id}`);
            chatCounts[ticket.id] = response.data.count;
          } catch (chatError) {
            console.error(`Error fetching unread chat count for ticket ${ticket.id}:`, chatError);
            chatCounts[ticket.id] = 0;
          }
        }
        setUnreadChatCounts(chatCounts);

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
        const res = await axiosClient.get(
          `/api/tickets/${selectedTicket.id}/comments?userId=${user.UserID}`
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

  // Close preview menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (previewMenuIndex !== null) {
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        let isClickInsideDropdown = false;

        dropdowns.forEach(dropdown => {
          if (dropdown.contains(event.target)) {
            isClickInsideDropdown = true;
          }
        });

        if (!isClickInsideDropdown) {
          setPreviewMenuIndex(null);
        }
      }

      // Handle preview modal click outside
      if (previewAttachment) {
        const modalContent = document.querySelector('.preview-modal-content');
        if (modalContent && !modalContent.contains(event.target)) {
          setPreviewAttachment(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [previewMenuIndex, previewAttachment]);

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
      await axiosClient.post(
        `/api/tickets/${selectedTicket.id}/comments`,
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
      const res = await axiosClient.get(`/api/tickets/${selectedTicket.id}/comments?userId=${user.UserID}`); // Pass userId for likes
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
          await axiosClient.post('/api/ticket-logs', {
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
    const newValue = e.target.value;
    const caretPosition = e.target.selectionStart;

    setComment(newValue);

    // Detect if user is typing @mention
    const text = newValue.slice(0, caretPosition);
    const match = text.match(/@([\w\s]*)$/);

    if (match) {
      setMentionQuery(match[1]);
      setShowMentionDropdown(true);

      // Calculate dropdown position relative to textarea
      const textarea = e.target;
      const rect = textarea.getBoundingClientRect();

      setMentionDropdownPos({
        top: rect.bottom - rect.top + 10,
        left: rect.left - rect.left + 10,
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

    // Store the current caret position for potential use
    if (textareaRef.current) {
      textareaRef.current.lastCaretPosition = caretPosition;
    }
  }

  function handleMentionKeyUp(e) {
    // Handle keyboard navigation in mention dropdown
    if (showMentionDropdown && filteredMentions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        // Could add keyboard navigation logic here
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        // Could add keyboard navigation logic here
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredMentions.length > 0) {
          handleMentionSelect(filteredMentions[0]);
        }
      } else if (e.key === 'Escape') {
        setShowMentionDropdown(false);
        setMentionQuery("");
      }
    }
  }

  function handleMentionSelect(user) {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const currentCaretPosition = textarea.selectionStart;
    const currentText = comment;

    // Find the @ symbol and the text after it up to the caret
    const textBeforeCaret = currentText.slice(0, currentCaretPosition);
    const match = textBeforeCaret.match(/@([\w\s]*)$/);

    if (match) {
      const mentionStartIndex = currentCaretPosition - match[0].length;
      const textBefore = currentText.slice(0, mentionStartIndex);
      const textAfter = currentText.slice(currentCaretPosition);
      const mentionText = `@${user.FullName} `;

      // Create the new comment text
      const newComment = textBefore + mentionText + textAfter;
      const newCaretPosition = textBefore.length + mentionText.length;

      // Debug logging
      console.log('Mention Selection Debug:', {
        mentionText,
        textBefore,
        textAfter,
        newCaretPosition,
        newCommentLength: newComment.length
      });

      // Close mention dropdown first
      setShowMentionDropdown(false);
      setMentionQuery("");

      // Store the cursor position for later use
      textarea.pendingCursorPosition = newCaretPosition;

      // Update the comment state
      setComment(newComment);

      // Use a more reliable cursor positioning approach
      // This ensures the cursor is set after React has updated the DOM
      Promise.resolve().then(() => {
        if (textarea && textarea.pendingCursorPosition !== undefined) {
          const targetPosition = textarea.pendingCursorPosition;

          // Ensure textarea is focused and positioned correctly
          textarea.focus();

          // Use multiple attempts with different timing
          const setCursor = () => {
            try {
              if (document.activeElement === textarea) {
                textarea.setSelectionRange(targetPosition, targetPosition);
                // Force cursor visibility
                textarea.style.caretColor = '#ef4444';
                // Debug: Verify cursor position was set correctly
                console.log('Cursor set to position:', targetPosition, 'Actual position:', textarea.selectionStart);
                // Clear pending position on success
                delete textarea.pendingCursorPosition;
                return true;
              }
            } catch (e) {
              console.warn('Cursor positioning attempt failed:', e);
            }
            return false;
          };

          // Immediate attempt
          if (!setCursor()) {
            // Fallback with requestAnimationFrame
            requestAnimationFrame(() => {
              if (!setCursor()) {
                // Final fallback with timeout
                setTimeout(setCursor, 10);
              }
            });
          }
        }
      });
    }
  }

  // Function to handle liking/unliking a comment
  const handleLikeToggle = async (commentId) => {
    const hasLiked = userLikedComments[commentId];
    try {
      if (hasLiked) {
        // Unlike
        await axiosClient.delete(
          `/api/comments/${commentId}/like`,
          { data: { userId: user.UserID } }
        );
        toast.info("Comment unliked.");
      } else {
        // Like
        await axiosClient.post(
          `/api/comments/${commentId}/like`,
          { userId: user.UserID }
        );
        toast.success("Comment liked!");
      }
      // Toggle the local state immediately for responsiveness
      setUserLikedComments((prev) => ({ ...prev, [commentId]: !hasLiked }));
      // Re-fetch comments to get updated like counts from backend
      const res = await axiosClient.get(`/api/tickets/${selectedTicket.id}/comments?userId=${user.UserID}`); // Pass userId for likes
      setCommentsList(res.data);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error(`Failed to ${hasLiked ? "unlike" : "like"} comment.`);
    }
  };

  // Function to initiate a reply
  const handleReplyClick = (commentId, userName) => {
    setReplyingTo({ commentId, userName });
    const mentionText = `@${userName} `;
    const position = mentionText.length;

    // Set the comment text first
    setComment(mentionText);

    // Store pending cursor position
    if (textareaRef.current) {
      textareaRef.current.pendingCursorPosition = position;
    }

    // Use the same reliable cursor positioning approach as mention select
    Promise.resolve().then(() => {
      if (textareaRef.current && textareaRef.current.pendingCursorPosition !== undefined) {
        const textarea = textareaRef.current;
        const targetPosition = textarea.pendingCursorPosition;

        // Ensure textarea is focused and positioned correctly
        textarea.focus();

        // Use multiple attempts with different timing
        const setCursor = () => {
          try {
            if (document.activeElement === textarea) {
              textarea.setSelectionRange(targetPosition, targetPosition);
              // Force cursor visibility
              textarea.style.caretColor = '#ef4444';
              // Clear pending position on success
              delete textarea.pendingCursorPosition;
              return true;
            }
          } catch (e) {
            console.warn('Cursor positioning attempt failed:', e);
          }
          return false;
        };

        // Immediate attempt
        if (!setCursor()) {
          // Fallback with requestAnimationFrame
          requestAnimationFrame(() => {
            if (!setCursor()) {
              // Final fallback with timeout
              setTimeout(setCursor, 10);
            }
          });
        }
      }
    });
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
          <span key={index} style={{ color: '#1e40af', fontWeight: '600' }}>
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

  // // Close preview menu when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     // Check if click is outside any open dropdown menu
  //     if (previewMenuIndex !== null) {
  //       const dropdowns = document.querySelectorAll('.dropdown-menu');
  //       let isClickInside = false;

  //       dropdowns.forEach(dropdown => {
  //         if (dropdown.contains(event.target)) {
  //           isClickInside = true;
  //         }
  //       });

  //       if (!isClickInside) {
  //         setPreviewMenuIndex(null);
  //       }
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [previewMenuIndex]);

  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    if (previewAttachment && previewAttachment.fileType === 'text/plain') {
      const fetchTextContent = async () => {
        try {
          const response = await fetch(previewAttachment.fullUrl);
          const text = await response.text();
          setTextContent(text);
        } catch (error) {
          console.error('Error loading text file:', error);
          setTextContent('Error loading file content');
        }
      };
      fetchTextContent();
    } else {
      setTextContent('');
    }
  }, [previewAttachment]);

  // --- Notification Handling ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!user?.UserID) return;
    try {
      const response = await axiosClient.get(`/api/notifications/count/${user.UserID}`);
      setUnreadNotifications(response.data.count);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      // Optionally set an error state here for notifications
    }
  }, [user?.UserID]);

  useEffect(() => {
    if (user?.UserID) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadNotifications]);

  // Socket listener for real-time notification updates
  useEffect(() => {
    if (user?.UserID) {
      const socket = io("http://localhost:5000");
      
      // Listen for new notifications
      socket.on(`notification-${user.UserID}`, () => {
        fetchUnreadNotifications();
      });
      
      // Listen for notification updates (like marking as read)
      socket.on(`notification-update-${user.UserID}`, () => {
        fetchUnreadNotifications();
      });
      
      return () => {
        socket.off(`notification-${user.UserID}`);
        socket.off(`notification-update-${user.UserID}`);
        socket.disconnect();
      };
    }
  }, [user?.UserID, fetchUnreadNotifications]);

  // Function to handle updates from NotificationPanel (e.g., notification marked as read)
  const handleNotificationPanelUpdate = () => {
    fetchUnreadNotifications(); // Re-fetch the actual count to ensure consistency
  };

  // --- User Management Logic ---
  const fetchSupervisors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get("/supervisor");
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load members. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    fetchSupervisors();
  }, [fetchSupervisors]); // Re-run when fetchSupervisors callback changes (which it won't due to useCallback)

  const handleProfileClick = () => {
    navigate('/admin-profile');
  };

  // Mark chat messages as read when chat tab is active
  useEffect(() => {
    if (activeTab === "chat" && selectedTicket?.id && user?.UserID) {
      axiosClient.put(`/api/notifications/chat/read/${user.UserID}/${selectedTicket.id}`)
        .then(response => {
          console.log(`Marked ${response.data.updatedCount} chat notifications as read for ticket ${selectedTicket.id}`);
          // Update the unread count in state to reflect the change immediately
          setUnreadChatCounts(prevCounts => ({
            ...prevCounts,
            [selectedTicket.id]: 0
          }));
          // Re-fetch global unread notifications if necessary, as this is a chat specific read
          fetchUnreadNotifications();
        })
        .catch(error => {
          console.error('Error marking chat notifications as read:', error);
        });
    }
  }, [activeTab, selectedTicket?.id, user?.UserID, fetchUnreadNotifications]); // Added fetchUnreadNotifications to dependencies

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <AdminNavBar
        pageTitle="Ticket Manage" 
        user={user}
        sidebarOpen={isSidebarOpen}
        onProfileClick={handleProfileClick}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        unreadNotifications={unreadNotifications}
        showNotifications={showNotifications}
        notificationRef={notificationRef}
      />
      <div
        className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"
          }`}
      >
        <div><h1 className="text-2xl font-bold mb-8"></h1></div>
        <div className="min-h-screen bg-gray-50">
          {/* Top Navigation */}
          <nav className="bg-white shadow-md px-6 py-4 flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 rounded-lg items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
              My Tickets
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
            </div>
          </nav>

          {/* Ticket Sections */}
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-10 ">
            {showNotifications && (
            <div ref={notificationRef} className="absolute right-4 top-14 z-50">
              <NotificationPanel
                userId={user?.UserID}
                role={user?.Role}
                onClose={() => setShowNotifications(false)}
                onNotificationUpdate={handleNotificationPanelUpdate}
              />
            </div>
          )}
            {!selectedTicket ? (
              <>
                <Section
                  title="Open"
                  tickets={open}
                  onCardClick={handleCardClick}
                  color="text-green-700"
                  unreadChatCounts={unreadChatCounts} // Pass unread chat counts
                />
                <hr className="border-t-2 border-gray-300" />
                <Section
                  title="In Progress"
                  tickets={inProcess}
                  onCardClick={handleCardClick}
                  color="text-yellow-700"
                  unreadChatCounts={unreadChatCounts} // Pass unread chat counts
                />
                <hr className="border-t-2 border-gray-300" />
                <Section
                  title="Resolved"
                  tickets={resolved}
                  onCardClick={handleCardClick}
                  color="text-blue-700"
                  unreadChatCounts={unreadChatCounts} // Pass unread chat counts
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
                      className={`pb-2 text-base font-medium ${activeTab === "details"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => { setActiveTab("activity"); setSearchParams({ ticketId: searchParams.get('ticketId'), tab: 'activity' }); }}
                      className={`pb-2 text-base font-medium ${activeTab === "activity"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Activity Log
                    </button>
                    <button
                      onClick={() => { setActiveTab("comments"); setSearchParams({ ticketId: searchParams.get('ticketId'), tab: 'comments' }); }}
                      className={`pb-2 text-base font-medium ${activeTab === "comments"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Comments
                    </button>
                    {/* NEW CHAT TAB */}
                    <button
                      onClick={() => { setActiveTab("chat"); setSearchParams({ ticketId: searchParams.get('ticketId'), tab: 'chat' }); }}
                      className={`pb-2 text-base font-medium ${activeTab === "chat"
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
                        <div className="space-y-6">
                          {/* Comment Text Area Section */}
                          <div className="bg-white border-2 border-gray-200 rounded-2xl p-1 shadow-sm focus-within:border-blue-500 focus-within:shadow-lg transition-all duration-300">
                            <div className="relative">
                              {/* Hidden textarea for input */}
                              <textarea
                                ref={textareaRef}
                                rows={4}
                                value={comment}
                                onChange={handleCommentChange}
                                onKeyUp={handleMentionKeyUp}
                                onFocus={(e) => {
                                  // Handle pending cursor position when textarea gains focus
                                  if (e.target.pendingCursorPosition !== undefined) {
                                    const position = e.target.pendingCursorPosition;
                                    delete e.target.pendingCursorPosition;
                                    setTimeout(() => {
                                      try {
                                        e.target.setSelectionRange(position, position);
                                      } catch (err) {
                                        console.warn('Could not set cursor position on focus:', err);
                                      }
                                    }, 0);
                                  }
                                }}
                                className="block w-full rounded-xl border-0 resize-none p-4 text-base placeholder-gray-400 focus:ring-0 focus:outline-none bg-transparent relative z-10"
                                placeholder="Share your thoughts... Use @ to mention team members"
                                spellCheck="false"
                                style={{
                                  minHeight: 120,
                                  fontFamily: 'system-ui, -apple-system, sans-serif',
                                  fontSize: '16px',
                                  lineHeight: '1.5',
                                  color: 'transparent',
                                  caretColor: '#374151',
                                }}
                              />

                              {/* Visible text with mention highlighting */}
                              <div
                                className="absolute inset-0 p-4 text-base rounded-xl overflow-hidden pointer-events-none"
                                style={{
                                  fontFamily: 'system-ui, -apple-system, sans-serif',
                                  fontSize: '16px',
                                  lineHeight: '1.5',
                                  color: '#374151',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  zIndex: 5,
                                }}
                              >
                                {comment ? (() => {
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
                                          className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded font-semibold"
                                        >
                                          {segment.value}
                                        </span>
                                      );
                                    } else {
                                      return segment.value;
                                    }
                                  });
                                })() : (
                                  <span className="text-gray-400">Share your thoughts... Use @ to mention team members</span>
                                )}
                              </div>

                              {comment.trim() && (
                                <div className="absolute bottom-3 right-3 px-3 py-1 bg-gray-100 rounded-lg z-20">
                                  <span className="text-xs text-gray-500 font-medium">
                                    {comment.length} characters
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* File Upload Section */}
                          <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-400 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                            <input
                              type="file"
                              multiple
                              onChange={handleFileChange}
                              className="hidden"
                              id="file-upload"
                              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                            />
                            <label
                              htmlFor="file-upload"
                              className="cursor-pointer flex flex-col items-center justify-center gap-3 py-8 px-6"
                            >
                              <div className="p-4 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-300">
                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                              </div>
                              <div className="text-center">
                                <span className="text-base text-gray-700 font-semibold block mb-1">
                                  Click to attach files or drag and drop
                                </span>
                                <span className="text-sm text-gray-500">
                                  Images, Videos, Documents, PDFs supported (Max 10MB each)
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* File Previews */}
                        {attachments.length > 0 && (
                          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-800">{attachments.length} files selected</span>
                              </div>
                              <button
                                onClick={() => setAttachments([])}
                                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Clear all
                              </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {attachments.map((file, idx) => {
                                const isImage = file.type.startsWith('image/');
                                const isVideo = file.type.startsWith('video/');
                                const ext = file.name.split('.').pop()?.toLowerCase() || '';
                                const isPDF = ext === 'pdf';
                                const isDoc = ['doc', 'docx'].includes(ext);
                                const isExcel = ['xls', 'xlsx'].includes(ext);
                                const isPowerPoint = ['ppt', 'pptx'].includes(ext);
                                const isText = ['txt', 'rtf'].includes(ext);
                                const isArchive = ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext);
                                const isAudio = file.type.startsWith('audio/');

                                const getFileIcon = () => {
                                  if (isPDF) return <FaFilePdf className="w-6 h-6" />;
                                  if (isDoc) return <FaFileWord className="w-6 h-6" />;
                                  if (isExcel) return <FaFileAlt className="w-6 h-6 text-green-600" />;
                                  if (isPowerPoint) return <FaFileAlt className="w-6 h-6 text-orange-600" />;
                                  if (isArchive) return <FaFileArchive className="w-6 h-6" />;
                                  if (isImage) return <FaFileImage className="w-6 h-6" />;
                                  if (isAudio) return <FaFileAlt className="w-6 h-6 text-purple-600" />;
                                  if (isVideo) return <FaFileAlt className="w-6 h-6 text-red-600" />;
                                  return <FaFileAlt className="w-6 h-6" />;
                                };

                                const getBackgroundColor = () => {
                                  if (isPDF) return 'bg-red-100 text-red-600';
                                  if (isDoc) return 'bg-blue-100 text-blue-600';
                                  if (isExcel) return 'bg-green-100 text-green-600';
                                  if (isPowerPoint) return 'bg-orange-100 text-orange-600';
                                  if (isArchive) return 'bg-yellow-100 text-yellow-600';
                                  if (isImage) return 'bg-pink-100 text-pink-600';
                                  if (isAudio) return 'bg-purple-100 text-purple-600';
                                  if (isVideo) return 'bg-red-100 text-red-600';
                                  return 'bg-gray-100 text-gray-600';
                                };

                                return (
                                  <div key={idx} className="relative group bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                                    {/* Remove button */}
                                    <button
                                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                      className="absolute top-2 right-2 z-10 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>

                                    {/* File preview */}
                                    <div className="aspect-square flex flex-col items-center justify-center p-4">
                                      {isImage ? (
                                        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300">
                                          <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover rounded-lg shadow-md"
                                          />
                                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                            <div className="bg-white bg-opacity-90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                              </svg>
                                            </div>
                                          </div>
                                        </div>
                                      ) : isVideo ? (
                                        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300">
                                          <video
                                            src={URL.createObjectURL(file)}
                                            className="w-full h-full object-cover rounded-lg shadow-md"
                                            muted
                                          />
                                          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                                            <div className="bg-white bg-opacity-90 rounded-full p-3">
                                              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                              </svg>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center justify-center h-full">
                                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ${getBackgroundColor()} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                            {getFileIcon()}
                                          </div>
                                          <div className="text-center">
                                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                              {ext.toUpperCase()}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* File info footer */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                      <p className="text-xs text-white font-medium truncate" title={file.name}>
                                        {file.name}
                                      </p>
                                      <div className="flex items-center justify-between text-xs text-gray-200 mt-1">
                                        <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Preview functionality
                                              if (isImage || isPDF) {
                                                const url = URL.createObjectURL(file);
                                                window.open(url, '_blank');
                                              }
                                            }}
                                            className="bg-white/20 hover:bg-white/30 rounded p-1 transition-colors"
                                            title="Preview"
                                          >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Download functionality
                                              const url = URL.createObjectURL(file);
                                              const a = document.createElement('a');
                                              a.href = url;
                                              a.download = file.name;
                                              document.body.appendChild(a);
                                              a.click();
                                              document.body.removeChild(a);
                                              URL.revokeObjectURL(url);
                                            }}
                                            className="bg-white/20 hover:bg-white/30 rounded p-1 transition-colors"
                                            title="Download"
                                          >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
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
                                className={`px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-all duration-200 ${index === filteredMentions.length - 1 ? 'rounded-b-2xl' : 'border-b border-gray-50'
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
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.Role === 'Admin' ? 'bg-red-100 text-red-700' :
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
                                  previewMenuIndex={previewMenuIndex}
                                  setPreviewMenuIndex={setPreviewMenuIndex}
                                  setPreviewAttachment={setPreviewAttachment}
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
                        currentUser={user} // Pass the logged-in admin/supervisor
                        initialMessages={initialMessages}
                        ticket={selectedTicket}
                        ticketId={selectedTicket.id}
                        role={user?.Role || "Supervisor"} // Use actual user role
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="preview-modal-content relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <button
              onClick={() => setPreviewAttachment(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-4">
              {previewAttachment.fileType.startsWith('image/') && (
                <img
                  src={previewAttachment.fullUrl}
                  alt={previewAttachment.fileName}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}

              {previewAttachment.fileType.startsWith('video/') && (
                <video
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[80vh]"
                  src={previewAttachment.fullUrl}
                />
              )}

              {previewAttachment.fileType.startsWith('audio/') && (
                <div className="p-8">
                  <audio
                    controls
                    autoPlay
                    className="w-full"
                    src={previewAttachment.fullUrl}
                  />
                  <p className="mt-4 text-center text-lg font-medium">
                    {previewAttachment.fileName}
                  </p>
                </div>
              )}

              {previewAttachment.fileType === 'application/pdf' && (
                <iframe
                  src={previewAttachment.fullUrl}
                  className="w-full h-[80vh]"
                  title={previewAttachment.fileName}
                />
              )}

              {previewAttachment.fileType === 'text/plain' && (
                <div className="h-[80vh] overflow-auto bg-gray-50 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {/* We'll load the text content here */}
                    {textContent || 'Loading text file...'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Section Component
function Section({ title, tickets, onCardClick, color, unreadChatCounts }) {
  return (
    <section>
      <h3 className={`text-lg sm:text-xl font-semibold ${color} mb-4`}>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onClick={onCardClick}
            unreadChatCount={unreadChatCounts[ticket.id] || 0} // Pass specific unread count
          />
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
  expandedReplies,
  previewMenuIndex,
  setPreviewMenuIndex,
  setPreviewAttachment
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
          <span key={index} style={{ color: '#1e40af', fontWeight: '600' }}>
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

          {/* Display Attachments if exist */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-blue-800">
                  {comment.attachments.length > 1 ? `${comment.attachments.length} Attachments` : '1 Attachment'}
                </span>
              </div>

              {/* Separate media and documents */}
              {(() => {
                const mediaFiles = comment.attachments.filter(att =>
                  att.fileType && (att.fileType.startsWith('image/') || att.fileType.startsWith('video/'))
                );
                const documentFiles = comment.attachments.filter(att =>
                  !att.fileType || (!att.fileType.startsWith('image/') && !att.fileType.startsWith('video/'))
                );
                return (
                  <div className="space-y-4">
                    {/* Media Files Section */}
                    {mediaFiles.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Media</h4>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 relative overflow-visible">
                          {mediaFiles.map((attachment, index) => {
                            const isImage = isImageAttachment(attachment.fileType);
                            const isVideo = isVideoAttachment(attachment.fileType);
                            const mediaMenuId = `${comment.CommentID}-media-${index}`;

                            return (
                              <div
                                key={index}
                                className="w-32 h-32 relative group bg-white rounded-xl border border-gray-200 overflow-visible shadow-sm hover:shadow-lg transition-all duration-300"
                              >
                                {/* Media thumbnail */}
                                <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                                  {isImage ? (
                                    <img
                                      src={attachment.fullUrl}
                                      alt={attachment.fileName}
                                       className="w-full h-full object-cover rounded-md"
                                    />
                                  ) : isVideo ? (
                                    <div className="relative w-full h-full">
                                      <video
                                        className="w-full h-full object-cover"
                                        src={attachment.fullUrl}
                                        muted
                                        playsInline
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>

                                {/* File info footer */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-xl">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-white font-medium truncate">{attachment.fileName}</p>
                                    <div className="flex gap-1 ml-2">
                                      <span className="bg-black/55 text-white text-[10px] px-1 py-0.5 rounded">
                                        {isImage ? 'IMAGE' : isVideo ? 'VIDEO' : 'FILE'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Menu Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewMenuIndex(previewMenuIndex === mediaMenuId ? null : mediaMenuId);
                                  }}
                                  className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-white bg-opacity-80 text-gray-500 rounded-full hover:bg-opacity-100 hover:text-gray-700 transition-all duration-200 shadow-sm cursor-pointer"
                                >
                                  <FiMoreVertical className="w-4 h-4" />
                                </button>

                                {/* Dropdown Menu */}
                                {previewMenuIndex === mediaMenuId && (
                                  <div
                                    className="dropdown-menu absolute z-50 top-10 right-0 w-44 bg-white border border-gray-200 rounded-lg shadow-xl"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="py-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPreviewAttachment(attachment);
                                          setPreviewMenuIndex(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Open
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleForceDownload(attachment.fullUrl, attachment.fileName);
                                          setPreviewMenuIndex(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download File
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(attachment.fullUrl);
                                          setPreviewMenuIndex(null);
                                          toast.success('File URL copied to clipboard!');
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy Link
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {/* Document Files */}
                    {documentFiles.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Documents</h4>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 relative overflow-visible">
                          {documentFiles.map((attachment, index) => {
                            const isPDF = attachment.fileType && attachment.fileType === 'application/pdf';
                            const isDoc = attachment.fileType && (
                              attachment.fileType === 'application/msword' ||
                              attachment.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            );
                            const isAudio = attachment.fileType && attachment.fileType.startsWith('audio/');

                            return (
                              <div
                                key={index}
                                className="w-32 h-32 relative group bg-white rounded-xl border border-gray-200 overflow-visible shadow-sm hover:shadow-lg transition-all duration-300"
                              >
                                {/* File Icon and Name */}
                                <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                                  {/* File Type Icon */}
                                  <div
                                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isPDF
                                      ? 'bg-red-100 text-red-600'
                                      : isDoc
                                        ? 'bg-blue-100 text-blue-600'
                                        : isAudio
                                          ? 'bg-green-100 text-green-600'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}
                                  >
                                    {isPDF ? (
                                      <FaFilePdf className="w-6 h-6" />
                                    ) : isDoc ? (
                                      <FaFileWord className="w-6 h-6" />
                                    ) : isAudio ? (
                                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                          fillRule="evenodd"
                                          d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : (
                                      <FaFileAlt className="w-6 h-6" />
                                    )}
                                  </div>

                                  {/* File Name */}
                                  <p className="text-xs font-semibold text-gray-900 truncate w-full px-1">{attachment.fileName}</p>
                                </div>

                                {/* 3-dot Menu Button */}
                                <div className="absolute top-2 right-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewMenuIndex(previewMenuIndex === index ? null : index);
                                    }}
                                    className="flex items-center justify-center w-6 h-6 bg-white bg-opacity-80 text-gray-500 rounded-full hover:bg-opacity-100 hover:text-gray-700 transition-all duration-200 shadow-sm cursor-pointer"
                                    title="More options"
                                  >
                                    <FiMoreVertical className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Dropdown Menu */}
                                <div className="absolute top-2 right-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const uniqueId = `${comment.CommentID}-doc-${index}`;
                                      setPreviewMenuIndex(previewMenuIndex === uniqueId ? null : uniqueId);
                                    }}
                                    className="flex items-center justify-center w-6 h-6 bg-white bg-opacity-80 text-gray-500 rounded-full hover:bg-opacity-100 hover:text-gray-700 transition-all duration-200 shadow-sm cursor-pointer"
                                    title="More options"
                                  >
                                    <FiMoreVertical className="w-4 h-4" />
                                  </button>
                                </div>

                                {previewMenuIndex === `${comment.CommentID}-doc-${index}` && (
                                  <div className="dropdown-menu absolute z-50 top-10 right-0 w-44 bg-white border border-gray-200 rounded-lg shadow-xl">
                                    <div className="py-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (canPreviewInBrowser(attachment.fileType)) {
                                            setPreviewAttachment(attachment);
                                          } else {
                                            toast.info(
                                              <div>
                                                <p className="font-medium">This file type cannot be previewed in browser</p>
                                                <p className="text-sm">Please download the file to view it</p>
                                              </div>,
                                              {
                                                autoClose: 5000,
                                                closeButton: true,
                                              }
                                            );
                                          }
                                          setPreviewMenuIndex(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Open
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleForceDownload(attachment.fullUrl, attachment.fileName);
                                          setPreviewMenuIndex(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download File
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(attachment.fullUrl);
                                          setPreviewMenuIndex(null);
                                          toast.success('File URL copied to clipboard!');
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy Link
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })()}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLikeToggle(comment.CommentID)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${userLikedComments[comment.CommentID]
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
                  previewMenuIndex={previewMenuIndex}
                  setPreviewMenuIndex={setPreviewMenuIndex}
                  setPreviewAttachment={setPreviewAttachment}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}
