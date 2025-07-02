import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { IoMdAttach } from "react-icons/io";
import { MdSend } from "react-icons/md";
import { FaFilter, FaTimes } from "react-icons/fa"; // Added FaTimes for closing filters

function renderMessageWithLinks(text) {
  if (typeof text !== "string") return text;

  const urlRegex =
    /((https?:\/\/)?(www\.)?[\w\-]+\.[\w]{2,}([\/\w\-\.?=&%]*)?)/gi;

  return text.split(urlRegex).map((part, i) => {
    if (part && typeof part === "string" && part.match(urlRegex)) {
      // Ensure a protocol exists
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

export default function SupervisorChatSection({
  user, // This should be the current supervisor/agent's info (loggedInUser)
  supportUser, // This is the client/user's info (selectedTicket.user)
  ticketId,
  ticket,
  role,
  onNewMessageStatusChange, // Renamed prop as discussed earlier
}) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingFile, setSendingFile] = useState(null);
  const [stickyDate, setStickyDate] = useState("");
  const [hasNewUnseenMessage, setHasNewUnseenMessage] = useState(false);

  // NEW FILTER STATES FOR INLINE FILTERING
  const [showFilters, setShowFilters] = useState(false); // To toggle visibility of filter section
  const [filterSender, setFilterSender] = useState("all"); // 'all', 'user', 'agent'
  const [filterType, setFilterType] = useState("all"); // 'all', 'text', 'file'
  const [filterKeyword, setFilterKeyword] = useState("");

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
    if (!ticketId || !role) return;
    try {
      await axios.post("http://localhost:5000/ticketchat/markSeen", {
        TicketID: ticketId,
        Role: role,
      });
      setHasNewUnseenMessage(false);
      // Inform the parent component that new messages have been seen
      if (onNewMessageStatusChange) {
        onNewMessageStatusChange(false);
      }
    } catch (error) {
      console.error("Failed to mark messages as seen:", error);
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

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!ticketId) return;

    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("joinTicketRoom", ticketId);

    socketRef.current.on("receiveTicketMessage", (message) => {
      if (String(message.ticketid) !== String(ticketId)) return;
      const sender =
        (message.role || "").toLowerCase() === "user" ? "user" : "agent";

      setChatMessages((prevMsgs) => {
        if (prevMsgs.find((m) => String(m.id) === String(message.id)))
          return prevMsgs;

        if (sender === "user" && document.visibilityState === "hidden") {
          setHasNewUnseenMessage(true);
          // Notify parent about new message when tab is hidden
          if (onNewMessageStatusChange) {
            onNewMessageStatusChange(true);
          }
        }

        return deduplicateMessages([...prevMsgs, { ...message, sender }]);
      });

      if (document.visibilityState === "visible") {
        markMessagesAsSeen();
      }
    });

    socketRef.current.on("messagesSeen", (seenData) => {
      if (String(seenData.TicketID) !== String(ticketId)) return;

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
      if (socketRef.current) {
        socketRef.current.emit("leaveTicketRoom", ticketId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [ticketId, role, onNewMessageStatusChange]);

  useEffect(() => {
    if (!ticketId) return;

    axios
      .get(`http://localhost:5000/messages/${ticketId}`)
      .then((res) => {
        const formattedMessages = res.data.map((msg) => ({
          ...msg,
          sender: (msg.role || "").toLowerCase() === "user" ? "user" : "agent",
        }));
        setChatMessages(deduplicateMessages(formattedMessages));
      })
      .then(() => {
        markMessagesAsSeen();
      })
      .catch(console.error);
  }, [ticketId, role]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        markMessagesAsSeen();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [ticketId, role]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() && !sendingFile) return;

    const optimisticId = `temp-${Date.now()}`;
    const localFileUrl = sendingFile ? URL.createObjectURL(sendingFile) : null;

    const newMsg = {
      id: optimisticId,
      ticketid: ticketId,
      userid: role === "Supervisor" ? user?.id : supportUser?.id,
      role: role || "Supervisor",
      sender: role === "Supervisor" ? "agent" : "user",
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
      formData.append(
        "UserID",
        role === "Supervisor" ? user?.id : supportUser?.id
      );
      formData.append("Role", role || "Supervisor");
      if (sendingFile) formData.append("file", sendingFile);

      const res = await axios.post(
        "http://localhost:5000/ticketchat",
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

  const filteredMessages = useMemo(() => {
    let messagesToFilter = chatMessages;

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
          (msg.content &&
            msg.content.toLowerCase().includes(lowercasedKeyword)) ||
          (msg.file && msg.file.name.toLowerCase().includes(lowercasedKeyword))
      );
    }

    return messagesToFilter;
  }, [chatMessages, filterSender, filterType, filterKeyword]);

  const groupedMessages = groupMessagesByDate(filteredMessages);
  const sortedDates = Object.keys(groupedMessages).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, filteredMessages]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

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
    };
  }, [groupedMessages, sortedDates, filteredMessages]);

  return (
    <div className="flex flex-col h-full w-6xl mx-auto border-gray-400 rounded-lg shadow-lg border">
      <header className="p-4 rounded-t-lg border-b bg-gray-400 text-white shadow-md flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-700">
          Chat for Ticket #{ticket?.id || ticketId}
        </h2>
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
      </header>

      {/* NEW: Inline Filter Section - Conditionally rendered based on showFilters */}
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

          {/* Optional: Add a "Reset Filters" button if desired */}
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
        {filteredMessages.length === 0 && (
          <p className="text-center text-gray-600 mt-50">
            {chatMessages.length === 0
              ? "No chat messages yet. Start the conversation!"
              : "No messages match your filter criteria."}
          </p>
        )}

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

              return (
                <div
                  key={String(msg.id)}
                  className={`flex mb-2 ${
                    !isClient ? "justify-end" : "justify-start"
                  }`}
                >
                  {isClient && (
                    <img
                      src={
                        supportUser?.avatar ||
                        "https://i.pravatar.cc/40?u=user1"
                      }
                      alt="avatar"
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
                          {msg.file.name}
                        </p>
                        <a
                          href={msg.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={msg.file.name}
                          className="inline-flex items-center px-2 py-0.5 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1" // Make sure h-3 w-3 give you the desired size
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.5" // Often 1.5 is used for Heroicons outlined style
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75v-2.25M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>
                          Download
                        </a>
                      </div>
                    ) : (
                      renderMessageWithLinks(msg.content)
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
                      src={user?.avatar || "https://i.pravatar.cc/40?u=support"}
                      alt="avatar"
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
