import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { io } from "socket.io-client";
import { IoMdAttach } from "react-icons/io";
import { MdSend } from "react-icons/md";
import { FaFilter, FaTimes, FaChevronUp, FaChevronDown } from "react-icons/fa";
import axiosClient from "../axiosClient";

// Helper function to render messages with links (unchanged)
function renderMessageWithLinks(text) {
  if (typeof text !== "string") return text;

  const urlRegex =
    /((https?:\/\/)?(www\.)?[\w\-]+\.[\w]{2,}([\/\w\-\.?=&%]*)?)/gi;

  return text.split(urlRegex).map((part, i) => {
    if (part && typeof part === "string" && part.match(urlRegex)) {
      const href =
        part.startsWith("http://") || part.startsWith("https://")
          ? part
          : `https://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {part}
        </a>
      );
    } else {
      return part;
    }
  });
}

// Helper function to highlight text (unchanged)
function highlightText(text, keyword) {
  if (!keyword || typeof text !== 'string') return renderMessageWithLinks(text);

  const parts = [];
  let lastIndex = 0;
  const lowercasedText = text.toLowerCase();
  const lowercasedKeyword = keyword.toLowerCase();

  let match;
  const regex = new RegExp(lowercasedKeyword, 'gi');

  while ((match = regex.exec(lowercasedText)) !== null) {
    const startIndex = match.index;
    const endIndex = startIndex + keyword.length;

    if (startIndex > lastIndex) {
      parts.push(renderMessageWithLinks(text.substring(lastIndex, startIndex)));
    }

    parts.push(
      <mark key={startIndex} className="bg-yellow-300 rounded px-0.5">
        {text.substring(startIndex, endIndex)}
      </mark>
    );
    lastIndex = endIndex;
  }

  if (lastIndex < text.length) {
    parts.push(renderMessageWithLinks(text.substring(lastIndex)));
  }

  return parts;
}


export default function SupervisorChatSection({
  user,
  supportUser,
  currentUser, // The logged-in admin/supervisor
  ticketId,
  ticket,
  role,
  onNewMessageStatusChange,
}) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingFile, setSendingFile] = useState(null);
  const [stickyDate, setStickyDate] = useState("");
  const [hasNewUnseenMessage, setHasNewUnseenMessage] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterSender, setFilterSender] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterKeyword, setFilterKeyword] = useState("");

  // Highlight and Navigation states
  const [highlightedMessageIndex, setHighlightedMessageIndex] = useState(-1);
  // Store refs for *all* messages that potentially could be highlighted
  // This will be reset and rebuilt whenever chatMessages changes.
  const allMessageRefs = useRef({});

  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const deduplicateMessages = (messages) => {
    return messages.filter(
      (msg, index, self) =>
        index === self.findIndex((m) => String(m.id) === String(msg.id))
    );
  };

  const markMessagesAsSeen = async () => {
    if (!ticketId || !role || !currentUser?.UserID) {
      console.log("ChatSection: markMessagesAsSeen - Missing ticketId, role, or currentUser, skipping.", { ticketId, role, currentUser });
      return;
    }
    console.log(`ChatSection: markMessagesAsSeen - Attempting to mark messages as seen for TicketID: ${ticketId}, Role: ${role}, UserID: ${currentUser.UserID}`);
    try {
       await axiosClient.post("/api/ticketchat/markSeen", {

        TicketID: ticketId,
        Role: role,
        UserID: currentUser.UserID,
      });
      setHasNewUnseenMessage(false);
      if (onNewMessageStatusChange) {
        onNewMessageStatusChange(false);
      }
      console.log(`ChatSection: markMessagesAsSeen - Successfully marked messages as seen for TicketID: ${ticketId}, Role: ${role}, UserID: ${currentUser.UserID}`);
    } catch (error) {
      console.error("ChatSection: markMessagesAsSeen - Failed to mark messages as seen:", error);
    }
  };

  const formatDateForDisplay = (dateString) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(dateString);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // This function now operates on the full list of messages (`chatMessages`)
  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const messageDate = new Date(msg.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const displayDate = formatDateForDisplay(msg.timestamp);

      if (!grouped[messageDate]) {
        grouped[messageDate] = {
          displayDate: displayDate,
          messages: [],
        };
      }
      grouped[messageDate].messages.push(msg);
    });
    return grouped;
  };

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Scroll to a specific highlighted message using its ref from allMessageRefs
  const scrollToHighlighted = useCallback((messageId) => {
    if (allMessageRefs.current[messageId]) {
      allMessageRefs.current[messageId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  useEffect(() => {
    if (!ticketId) {
      console.log("ChatSection: useEffect for socket - Missing ticketId, skipping socket setup.");
      return;
    }

    console.log(`ChatSection: useEffect for socket - Joining ticket room ${ticketId}.`);
    socketRef.current = io(`${axiosClient.defaults.baseURL}`);
    socketRef.current.emit("joinTicketRoom", ticketId);

    socketRef.current.on("receiveTicketMessage", (message) => {
      console.log("ChatSection: Socket - Received incoming message.", message);
      if (String(message.ticketid) !== String(ticketId)) {
        console.log("ChatSection: Socket - Message ticket ID mismatch, skipping.");
        return;
      }
      const sender =
        (message.role || "").toLowerCase() === "user" ? "user" : "agent";

      setChatMessages((prevMsgs) => {
        if (prevMsgs.find((m) => String(m.id) === String(message.id))) {
          console.log("ChatSection: Socket - Duplicate message, skipping.");
          return prevMsgs;
        }

        // Only set new unseen message flag if the message is from the *other* party
        const isMessageFromOtherParty = (sender === "user" && (role === "Supervisor" || role === "Admin")) ||
                                       (sender === "agent" && role === "User");

        if (isMessageFromOtherParty && document.visibilityState === "hidden") {
          console.log("ChatSection: Socket - New unseen message from other party, document hidden. Setting flag.");
          setHasNewUnseenMessage(true);
          if (onNewMessageStatusChange) {
            onNewMessageStatusChange(true);
          }
        }

        return deduplicateMessages([...prevMsgs, { ...message, sender }]);
      });

      if (document.visibilityState === "visible") {
        console.log("ChatSection: Socket - Document visible. Calling markMessagesAsSeen.");
        markMessagesAsSeen();
      }
    });

    socketRef.current.on("messagesSeen", (seenData) => {
      console.log("ChatSection: Socket - Received messagesSeen event.", seenData);
      if (String(seenData.TicketID) !== String(ticketId)) {
        console.log("ChatSection: Socket - Seen data ticket ID mismatch, skipping.");
        return;
      }

      setChatMessages((prevMsgs) =>
        prevMsgs.map((msg) =>
          String(msg.ticketid) === String(seenData.TicketID) &&
          msg.role !== seenData.Role &&
          msg.status !== "seen"
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    });

    return () => {
      console.log(`ChatSection: Socket - Leaving ticket room ${ticketId} and disconnecting.`);
      if (socketRef.current) {
        socketRef.current.emit("leaveTicketRoom", ticketId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [ticketId, role, onNewMessageStatusChange]);

  useEffect(() => {
    if (!ticketId) {
      console.log("ChatSection: useEffect for initial fetch - Missing ticketId, skipping initial fetch.");
      return;
    }

    console.log(`ChatSection: useEffect for initial fetch - Fetching messages for ticket ${ticketId}.`);
    axiosClient
      .get(`/api/messages/${ticketId}`)
      .then((res) => {
        const formattedMessages = res.data.map((msg) => ({
          ...msg,
          sender: (msg.role || "").toLowerCase() === "user" ? "user" : "agent",
        }));
        setChatMessages(deduplicateMessages(formattedMessages));
        console.log("ChatSection: Initial fetch successful. Calling markMessagesAsSeen.");
        return markMessagesAsSeen(); // Mark as seen immediately after fetching messages
      })
      .catch((error) => {
        console.error("ChatSection: Initial fetch failed:", error);
      });
  }, [ticketId, role]); // Added role to dependency array as it's used in markMessagesAsSeen

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("ChatSection: Visibility Change - Document became visible. Calling markMessagesAsSeen.");
        markMessagesAsSeen();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      console.log("ChatSection: Visibility Change - Removing event listener.");
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [ticketId, role]); // Added ticketId and role to dependencies

  const handleSendMessage = async () => {
    if (!chatInput.trim() && !sendingFile) return;

    const optimisticId = `temp-${Date.now()}`;
    const localFileUrl = sendingFile ? URL.createObjectURL(sendingFile) : null;

    const newMsg = {
      id: optimisticId,
      ticketid: ticketId,
      userid: role === "Supervisor" || role === "Admin" ? currentUser?.UserID : supportUser?.UserID,
      role: role || "Supervisor",
      sender: role === "Supervisor" || role === "Admin" ? "agent" : "user",
      content: chatInput || sendingFile?.name,
      timestamp: new Date().toISOString(),
      type: sendingFile ? "file" : "text",
      file: sendingFile ? { name: sendingFile.name, url: localFileUrl } : null,
      status: "sending",
    };

    setChatMessages((prev) => deduplicateMessages([...prev, newMsg]));

    try {
      const formData = new FormData();
      formData.append("TicketID", ticketId);
      formData.append("Type", sendingFile ? "file" : "text");
      formData.append(
        "Note",
        chatInput || (sendingFile ? sendingFile.name : "")
      );
      const userIdToSend = role === "Supervisor" || role === "Admin" ? currentUser?.UserID : supportUser?.UserID;
      console.log("Sending message with UserID:", userIdToSend, "Role:", role, "CurrentUser:", currentUser);
      formData.append("UserID", userIdToSend);
      formData.append("Role", role || "Supervisor");
      if (sendingFile) formData.append("file", sendingFile);

      const res = await axiosClient.post(
        `/api/ticketchat`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const newId = res.data.chatId;
      const uploadedFileUrl = res.data.fileUrl || localFileUrl;

      setChatMessages((msgs) =>
        deduplicateMessages(
          msgs.map((msg) =>
            String(msg.id) === String(optimisticId)
              ? {
                  ...msg,
                  id: newId,
                  status: "delivered",
                  file: sendingFile
                    ? {
                        name: sendingFile.name,
                        url: uploadedFileUrl,
                      }
                    : null,
                }
              : msg
          )
        )
      );

      setChatInput("");
      setSendingFile(null);
    } catch (error) {
      console.error("Send failed:", error);
      setChatMessages((msgs) =>
        msgs.map((msg) =>
          String(msg.id) === String(optimisticId)
            ? { ...msg, status: "failed" }
            : msg
        )
      );
    }
  };

  // filteredMessages now determines which messages *should be highlighted and navigable*
  const filteredMessages = useMemo(() => {
    let messagesToFilter = chatMessages; // Start with all messages for the purpose of filtering

    if (filterSender !== "all") {
      messagesToFilter = messagesToFilter.filter(
        (msg) => msg.sender === filterSender
      );
    }

    if (filterType !== "all") {
      messagesToFilter = messagesToFilter.filter((msg) =>
        filterType === "file" ? msg.type === "file" : msg.type === "text"
      );
    }

    if (filterKeyword.trim() !== "") {
      const lowercasedKeyword = filterKeyword.toLowerCase();
      messagesToFilter = messagesToFilter.filter(
        (msg) =>
          (msg.content && msg.content.toLowerCase().includes(lowercasedKeyword)) ||
          (msg.file && msg.file.name.toLowerCase().includes(lowercasedKeyword))
      );
    }
    return messagesToFilter;
  }, [chatMessages, filterSender, filterType, filterKeyword]);

  // IMPORTANT: groupMessagesByDate now uses chatMessages (ALL messages)
  const groupedMessages = useMemo(() => groupMessagesByDate(chatMessages), [chatMessages]);
  const sortedDates = Object.keys(groupedMessages).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // Scroll to bottom when new messages arrive (only if no keyword filter is active)
  useEffect(() => {
    if (filterKeyword.trim() === "") {
      scrollToBottom();
    }
  }, [chatMessages, scrollToBottom, filterKeyword]);

  // Scroll to the currently highlighted message when highlightedMessageIndex changes
  useEffect(() => {
    if (highlightedMessageIndex !== -1 && filteredMessages[highlightedMessageIndex]) {
      scrollToHighlighted(filteredMessages[highlightedMessageIndex].id);
    }
  }, [highlightedMessageIndex, filteredMessages, scrollToHighlighted]);


  // Reset highlighted index when filters change, re-evaluate starting position
  useEffect(() => {
    if (filterKeyword.trim() === "") {
        setHighlightedMessageIndex(-1); // No keyword, no highlight navigation
    } else if (filteredMessages.length > 0) {
        setHighlightedMessageIndex(0); // If keyword, start at the first result
    } else {
        setHighlightedMessageIndex(-1); // Keyword but no results
    }
    // Clear refs when filters change to rebuild them correctly
    allMessageRefs.current = {};
  }, [filterKeyword, filteredMessages.length, filterSender, filterType]); // Add all filter dependencies

  // Sticky date header observer logic (unchanged from last time, but relies on all messages)
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    // Clear previous observers to prevent issues with changing DOM structure due to filtering
    const oldObservers = messagesContainer.dataset.observers;
    if (oldObservers) {
        JSON.parse(oldObservers).forEach(id => {
            const obs = window.__chat_date_observers__?.[id];
            if(obs) obs.disconnect();
            delete window.__chat_date_observers__?.[id];
        });
    }

    const observerId = `obs-${Date.now()}`;
    if (!window.__chat_date_observers__) window.__chat_date_observers__ = {};
    const observer = new IntersectionObserver(
      (entries) => {
        let currentStickyDate = "";
        for (let i = entries.length - 1; i >= 0; i--) {
          const entry = entries[i];
          if (entry.isIntersecting && entry.target.dataset.date) {
            currentStickyDate = entry.target.dataset.date;
            break;
          }
        }
        setStickyDate(currentStickyDate);
      },
      {
        root: messagesContainer,
        rootMargin: "-1px 0px 0px 0px",
        threshold: 0,
      }
    );
    window.__chat_date_observers__[observerId] = observer;
    messagesContainer.dataset.observers = JSON.stringify([observerId]);


    sortedDates.forEach((date) => {
      const dateElement = messagesContainer.querySelector(
        `[data-date-key="${date}"]`
      );
      if (dateElement) {
        observer.observe(dateElement);
      }
    });

    return () => {
      observer.disconnect();
      delete window.__chat_date_observers__?.[observerId];
    };
  }, [groupedMessages, sortedDates]); // Dependency on groupedMessages and sortedDates to re-run when messages change


  const handleNextHighlight = () => {
    setHighlightedMessageIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < filteredMessages.length) {
        return nextIndex;
      }
      return 0; // Wrap around to the first
    });
  };

  const handlePrevHighlight = () => {
    setHighlightedMessageIndex(prevIndex => {
      const prevIndexVal = prevIndex - 1;
      if (prevIndexVal >= 0) {
        return prevIndexVal;
      }
      return filteredMessages.length - 1; // Wrap around to the last
    });
  };

  const handleFileDownload = async (fileName) => {
    try {
      // For file downloads, if your backend's /download_evidence endpoint is also proxied
      // through axiosClient's base URL, you can use axiosClient here too.
      // Otherwise, keep it as fetch or adjust axiosClient's configuration.
      // Assuming it's still a direct path for simplicity if axiosClient isn't configured for blobs.
      const response = await fetch(
        `${axiosClient.defaults.baseURL}/uploads/profile_images/${fileName}`
      );
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed.");
    }
  };

  return (
    <div className="flex flex-col h-full w-6xl mx-auto border-gray-400 rounded-lg shadow-lg border">
      <header className="p-4 rounded-t-lg border-b bg-gray-400 text-white shadow-md flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-700">
          Chat for Ticket #{ticket?.id || ticketId}
        </h2>
        <div className="flex items-center space-x-2">
          {/* Navigation for highlighted results - only show if keyword filter is active and there are results */}
          {filterKeyword.trim() !== "" && filteredMessages.length > 0 && (
            <div className="flex items-center text-gray-700 bg-gray-100 rounded-full px-3 py-1 text-sm shadow-sm">
              <span className="mr-2">
                {highlightedMessageIndex + 1} of {filteredMessages.length}
              </span>
              <button
                onClick={handlePrevHighlight}
                className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={filteredMessages.length <= 1}
                title="Previous result"
              >
                <FaChevronUp className="size-4" />
              </button>
              <button
                onClick={handleNextHighlight}
                className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={filteredMessages.length <= 1}
                title="Next result"
              >
                <FaChevronDown className="size-4" />
              </button>
            </div>
          )}

          {/* Toggle filter visibility */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
            title={showFilters ? "Hide Filters" : "Show Filters"}
          >
            {showFilters ? (
              <FaTimes className="size-5" />
            ) : (
              <FaFilter className="size-5" />
            )}
          </button>
        </div>
      </header>

      {/* Inline Filter Section */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sender:
            </label>
            <select
              value={filterSender}
              onChange={(e) => setFilterSender(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All</option>
              <option value="user">Client</option>
              <option value="agent">Agent (You)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message Type:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All</option>
              <option value="text">Text</option>
              <option value="file">File</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Keyword:
            </label>
            <input
              type="text"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              placeholder="Search keywords..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {(filterSender !== "all" ||
            filterType !== "all" ||
            filterKeyword !== "") && (
            <div className="col-span-full text-right mt-2">
              <button
                onClick={() => {
                  setFilterSender("all");
                  setFilterType("all");
                  setFilterKeyword("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto p-4 relative"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/clean-textile.png')",
          backgroundColor: "#0000",
        }}
        ref={messagesContainerRef}
      >
        {/* Display message if ALL chatMessages are empty (i.e., no chat history) */}
        {chatMessages.length === 0 && (
          <p className="text-center text-gray-600 mt-50">
            No chat messages yet. Start the conversation!
          </p>
        )}
        {/* Display message if filter is active but NO results are found */}
        {filterKeyword.trim() !== "" && filteredMessages.length === 0 && chatMessages.length > 0 && (
            <p className="text-center text-gray-600 mt-50">
                No messages match your search.
            </p>
        )}


        {/* Loop through sortedDates derived from ALL chatMessages */}
        {sortedDates.map((dateKey) => (
          <div key={dateKey}>
            <div
              className="text-center my-4"
              data-date-key={dateKey}
              data-date={groupedMessages[dateKey].displayDate}
            >
              <span className="inline-block bg-green-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                {groupedMessages[dateKey].displayDate}
              </span>
            </div>
            {groupedMessages[dateKey].messages.map((msg) => {
              const isClient = msg.sender === "user";

              // Check if this message is part of the filtered results
              const isFiltered = filteredMessages.some(fm => fm.id === msg.id);

              // Check if this message is the currently highlighted message
              const isHighlighted = isFiltered &&
                                    highlightedMessageIndex !== -1 &&
                                    filteredMessages[highlightedMessageIndex]?.id === msg.id;

              return (
                <div
                  key={String(msg.id)}
                  ref={el => {
                    // Assign ref to ALL messages, so we can scroll to any of them
                    // This creates a mapping from message.id to its DOM element
                    allMessageRefs.current[msg.id] = el;
                  }}
                  className={`flex mb-2 ${
                    !isClient ? "justify-end" : "justify-start"
                  } ${
                    isHighlighted // Apply border only if it's the currently highlighted message
                      ? 'border-2 border-blue-500 p-1 rounded-lg transition-all duration-300'
                      : ''
                  }`}
                >
                  {isClient && (
                    <img
                      src={
                        user?.ProfileImagePath
                          ? `${axiosClient.defaults.baseURL}/uploads/profile_images/${user.ProfileImagePath}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.FullName || 'User')}&background=random&color=fff`
                      }
                      alt={user?.FullName || 'User'}
                      className="w-8 h-8 rounded-full mr-2 self-end shadow-md"
                    />
                  )}

                  <div
                    className={`relative max-w-[75%] px-3 py-2 rounded-lg shadow-md break-words whitespace-pre-wrap text-sm ${
                      !isClient
                        ? "bg-[#D9FDD3] text-gray-900 rounded-br-none ml-auto"
                        : "bg-white text-gray-900 rounded-bl-none mr-auto"
                    }`}
                    style={
                      !isClient
                        ? { borderBottomRightRadius: "0.25rem" }
                        : { borderBottomLeftRadius: "0.25rem" }
                    }
                  >
                    {msg.type === "file" && msg.file ? (
                      <div className="flex flex-col items-center p-2">
                        {msg.file.name
                          .toLowerCase()
                          .match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                          <img
                            src={msg.file.url}
                            alt={msg.file.name}
                            className="max-h-40 object-contain rounded-md mb-1 shadow-sm"
                          />
                        ) : msg.file.name
                            .toLowerCase()
                            .match(/\.(mp4|webm|ogg|mov)$/i) ? (
                          <video
                            controls
                            src={msg.file.url}
                            className="max-h-40 object-contain rounded-md mb-1 shadow-sm"
                          />
                        ) : msg.file.name.toLowerCase().endsWith(".pdf") ? (
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                            alt="PDF Icon"
                            className="w-12 h-12 object-contain mb-1"
                          />
                        ) : (
                          <img
                            src="https://freesoft.ru/storage/images/729/7282/728101/728101_normal.png" // Generic file icon
                            alt="File Icon"
                            className="w-12 h-12 object-contain mb-1"
                          />
                        )}
                        <p className="text-sm font-medium text-gray-800 text-center break-words mb-1">
                          {/* Highlight file name */}
                          {highlightText(msg.file.name, filterKeyword)}
                        </p>
                        <a
                    onClick={() => handleFileDownload(msg.file.name)}
                    className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors duration-200"
                  >
                    Download
                  </a>
                      </div>
                    ) : (
                      // Highlight message content
                      highlightText(msg.content, filterKeyword)
                    )}

                    <div
                      className={`text-[10px] mt-1 ${
                        !isClient ? "text-right" : "text-left"
                      } text-gray-500`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                      {!isClient && (
                        <span className="ml-1">
                          {msg.status === "sending"
                            ? "🕓"
                            : msg.status === "failed"
                            ? "❌"
                            : msg.status === "seen"
                            ? "✓✓"
                            : "✓"}
                        </span>
                      )}
                    </div>

                    {!isClient ? (
                      <div
                        className="absolute -right-2 bottom-0 w-3 h-3 bg-[#D9FDD3] transform rotate-45 origin-bottom-left rounded-sm"
                        style={{ boxShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}
                      ></div>
                    ) : (
                      <div
                        className="absolute -left-2 bottom-0 w-3 h-3 bg-white transform -rotate-45 origin-bottom-right rounded-sm"
                        style={{ boxShadow: "-1px 1px 2px rgba(0,0,0,0.1)" }}
                      ></div>
                    )}
                  </div>

                  {!isClient && (
                    <img
                      src={currentUser?.ProfileImagePath 
                        ? `${axiosClient.defaults.baseURL}/uploads/profile_images/${currentUser.ProfileImagePath}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.FullName || 'Admin')}&background=random&color=fff`
                      }
                      alt={currentUser?.FullName || 'Admin'}
                      className="w-8 h-8 rounded-full ml-2 self-end shadow-md"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {sendingFile && (
          <div className="flex justify-end mb-2">
            {" "}
            <div className="relative bg-blue-50 border border-blue-200 rounded-lg p-2 shadow-md max-w-xs w-full flex flex-col items-center">
              {sendingFile.type && sendingFile.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(sendingFile)}
                  alt="preview"
                  className="max-h-32 object-contain rounded mb-2"
                />
              ) : sendingFile.type && sendingFile.type.startsWith("video/") ? (
                <video
                  src={URL.createObjectURL(sendingFile)}
                  controls
                  className="max-h-32 object-contain rounded mb-2"
                />
              ) : (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                  alt="File Icon"
                  className="w-16 h-16 object-contain mb-1"
                />
              )}
              <p className="text-sm font-medium text-gray-800 text-center break-words">
                {sendingFile.name}
              </p>
              <span className="text-xs text-blue-500 mb-2">
                (File ready to send)
              </span>
              <button
                onClick={() => {
                  URL.revokeObjectURL(URL.createObjectURL(sendingFile));
                  setSendingFile(null);
                }}
                className="absolute top-1 right-2 text-red-600 hover:text-red-800 text-lg font-bold"
                title="Remove file"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="flex items-center space-x-2 p-3 bg-gray-100 border-t border-gray-200 rounded-b-lg">
        <label
          htmlFor="file-upload"
          className="cursor-pointer p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
          title="Attach file"
        >
          <IoMdAttach className="text-xl text-gray-600 size-7" />
        </label>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={(e) => setSendingFile(e.target.files[0])}
        />

        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Message"
          className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />

        <button
          onClick={handleSendMessage}
          disabled={!chatInput.trim() && !sendingFile}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <MdSend className="size-7" />
        </button>
      </div>
    </div>
  );
}