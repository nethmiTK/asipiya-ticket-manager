import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { IoMdAttach } from "react-icons/io";
import { MdSend } from "react-icons/md";

function renderMessageWithLinks(text) {
  if (typeof text !== "string") return text;

  const urlRegex =
    /((https?:\/\/)?(www\.)?[\w\-]+\.[\w]{2,}([\/\w\-\.?=&%]*)?)/gi;

  return text.split(urlRegex).map((part, i) => {
    if (
      part &&
      typeof part === "string" &&
      part.match(urlRegex) &&
      !part.startsWith("http://") &&
      !part.startsWith("https://")
    ) {
      return (
        <a
          key={i}
          href={`https://${part}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {part}
        </a>
      );
    } else if (typeof part === "string" && part.startsWith("http")) {
      return (
        <a
          key={i}
          href={part}
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
  user,
  supportUser,
  ticketId,
  ticket,
  role,
}) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingFile, setSendingFile] = useState(null);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  // Helper: Deduplicate messages by id
  const deduplicateMessages = (messages) => {
    return messages.filter(
      (msg, index, self) =>
        index === self.findIndex((m) => String(m.id) === String(msg.id))
    );
  };

  // Mark messages as seen on server
  const markMessagesAsSeen = async () => {
    if (!ticketId || !role) return;
    try {
      await axios.post("http://localhost:5000/ticketchat/markSeen", {
        TicketID: ticketId,
        Role: role,
      });
    } catch (error) {
      console.error("Failed to mark messages as seen:", error);
    }
  };

  // Helper: Group messages by date
  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const messageDate = new Date(msg.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[messageDate]) {
        grouped[messageDate] = [];
      }
      grouped[messageDate].push(msg);
    });
    return grouped;
  };

  // Initialize socket, join room, listen to events
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
        return deduplicateMessages([...prevMsgs, { ...message, sender }]);
      });
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
  }, [ticketId]);

  // Fetch messages on ticket change, mark them as seen immediately
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

  // Mark messages as seen when tab/window regains focus
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

  // Handle send message (text or file)
  const handleSendMessage = async () => {
    if (!chatInput.trim() && !sendingFile) return;

    const optimisticId = `temp-${Date.now()}`;
    const localFileUrl = sendingFile ? URL.createObjectURL(sendingFile) : null;

    const newMsg = {
      id: optimisticId,
      ticketid: ticketId,
      userid: supportUser || null,
      role: role || "Supervisor",
      sender: "agent",
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
      formData.append("Note", chatInput || sendingFile.name);
      formData.append("UserID", supportUser || "");
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

  const groupedMessages = groupMessagesByDate(chatMessages);
  const sortedDates = Object.keys(groupedMessages).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div className="flex flex-col h-full w-6xl mx-auto border-gray-400 rounded-lg shadow-lg border">
      <header className="p-4 rounded-lg border-b bg-gray-50 border-gray-400">
        <h2 className="text-lg font-bold">
          Chat for Ticket #{ticket?.id || ticketId}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {chatMessages.length === 0 && (
          <p className="text-center text-gray-400 mt-50">
            No chat messages yet.
          </p>
        )}

        {sortedDates.map((date) => (
          <div key={date}>
            <div className="text-center my-4">
              <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {date}
              </span>
            </div>
            {groupedMessages[date].map((msg) => {
              const isClient = msg.sender === "user";

              return (
                <div
                  key={String(msg.id)}
                  className={`flex mb-3 ${
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
                      className="w-8 h-8 rounded-full mr-2 self-end"
                    />
                  )}

                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg break-words whitespace-pre-wrap ${
                      !isClient
                        ? "bg-blue-300 text-gray-800 rounded-br-none"
                        : "bg-gray-300 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.file ? (
                      <div className="flex flex-col items-center">
                        {/* Display an image or video preview if applicable */}
                        {msg.file.name
                          .toLowerCase()
                          .match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                          <img
                            src={msg.file.url}
                            alt={msg.file.name}
                            className="w-40 h-auto rounded-md mb-1 object-contain"
                          />
                        ) : msg.file.name
                            .toLowerCase()
                            .match(/\.(mp4|webm|ogg|mov)$/i) ? (
                          <video
                            controls
                            src={msg.file.url}
                            className="w-40 h-auto rounded-md mb-1 object-contain"
                          />
                        ) : msg.file.name.toLowerCase().endsWith(".pdf") ? (
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                            alt="PDF Icon"
                            className="w-20 h-20 object-contain mb-1"
                          />
                        ) : (
                          <img
                            src="https://freesoft.ru/storage/images/729/7282/728101/728101_normal.png" // Generic file icon
                            alt="File Icon"
                            className="w-20 h-20 object-contain mb-1"
                          />
                        )}
                        {/* Always show file name below icon/preview */}
                        <p className="text-sm font-medium text-gray-800 text-center break-words mb-2">
                          {msg.file.name}
                        </p>

                        {/* Dedicated Download Button */}
                        <a
                          href={msg.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={msg.file.name} // This attribute suggests a download filename
                          className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download
                        </a>
                      </div>
                    ) : (
                      renderMessageWithLinks(msg.content)
                    )}

                    <div className="flex justify-between text-xs mt-1 opacity-70">
                      <span>
                        {new Date(msg.timestamp).toLocaleString(undefined, {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {!isClient && (
                        <span>
                          {msg.status === "sending"
                            ? "🕓 sending..."
                            : msg.status === "failed"
                            ? "❌ failed"
                            : msg.status === "seen"
                            ? "  ✓✓ seen"
                            : "  ✓ delivered"}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isClient && (
                    <img
                      src={user?.avatar || "https://i.pravatar.cc/40?u=support"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full ml-2 self-end"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {sendingFile && (
          <div className="flex justify-center mb-2">
            <div className="relative bg-yellow-100 rounded-lg p-2 shadow-md max-w-[200px] max-h-[200px] overflow-hidden">
              {(() => {
                const fileUrl = URL.createObjectURL(sendingFile);
                const fileName = sendingFile.name.toLowerCase();

                if (sendingFile.type.startsWith("image/")) {
                  return (
                    <img
                      src={fileUrl}
                      alt="preview"
                      className="w-full h-full object-cover rounded"
                    />
                  );
                } else if (sendingFile.type.startsWith("video/")) {
                  return (
                    <video
                      src={fileUrl}
                      controls
                      className="w-full h-full object-cover rounded"
                    />
                  );
                } else if (fileName.endsWith(".pdf")) {
                  return (
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                      alt="PDF"
                      className="w-20 h-20 object-contain mb-1"
                    />
                  );
                } else {
                  return (
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-sm font-medium text-gray-800 text-center break-words">
                        {sendingFile.name}
                      </span>
                      <span className="text-xs text-blue-500">
                        (File ready to send)
                      </span>
                    </div>
                  );
                }
              })()}
              <button
                onClick={() => setSendingFile(null)}
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

      <div className="mt-3 flex items-center space-x-2 p-3 border-t border-gray-300 bg-white rounded-b-lg">
        <label
          htmlFor="file-upload"
          className="cursor-pointer "
          title="Attach file"
        >
          <IoMdAttach className="text-xl text-gray-900 size-7 cursor-pointer hover:text-gray-700" />
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
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border border-zinc-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        >
          <MdSend className="text-gray-900 hover:text-gray-700 size-8 cursor-pointer" />
        </button>
      </div>
    </div>
  );
}
