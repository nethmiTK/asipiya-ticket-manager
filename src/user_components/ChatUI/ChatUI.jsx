import React, { useState, useEffect, useRef } from "react";
import { IoMdAttach } from "react-icons/io";
import { MdSend } from "react-icons/md";
import * as pdfjsLib from "pdfjs-dist";
import { io } from "socket.io-client";
import axiosClient from "../../frontend/axiosClient";

const socket = io(`${axiosClient.defaults.baseURL}`);

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const iconBaseUrl = "https://cdn-icons-png.flaticon.com/512/";

const getIconUrl = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();

  const iconMap = {
    pdf: "136/136522.png",
    xls: "732/732220.png",
    xlsx: "732/732220.png",
    doc: "888/888883.png",
    docx: "888/888883.png",
    ppt: "7817/7817494.png",
    pptx: "7817/7817494.png",
    default: "833/833314.png",
  };

  const iconPath = iconMap[extension] || iconMap.default;
  return `${iconBaseUrl}${iconPath}`;
};

const ChatUI = ({ ticketID: propTicketID }) => {
  const [ticketID, setTicketID] = useState(null);
  const [userID, setUserID] = useState(null);
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const markMessagesAsSeen = async () => {
    if (!ticketID || !role || !userID) {
      console.log("ChatUI: markMessagesAsSeen - Missing ticketID, role, or userID, skipping.", { ticketID, role, userID });
      return;
    }
    console.log(`ChatUI: markMessagesAsSeen - Attempting to mark messages as seen for TicketID: ${ticketID}, Role: ${role}, UserID: ${userID}`);
    try {
       const res = await fetch(`${axiosClient.defaults.baseURL}/ticketchat/markSeen`, {
 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TicketID: ticketID, Role: role, UserID: userID }),
      });
      if (!res.ok) throw new Error("Failed to mark messages as seen");
      console.log(`ChatUI: markMessagesAsSeen - Successfully marked messages as seen for TicketID: ${ticketID}, Role: ${role}, UserID: ${userID}`);
    } catch (err) {
      console.error("ChatUI: markMessagesAsSeen - Error marking messages as seen:", err);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserID(storedUser.UserID || storedUser.id);
      setRole(storedUser.Role || storedUser.role || "");
      console.log("ChatUI: User data loaded.", { UserID: storedUser.UserID || storedUser.id, Role: storedUser.Role || storedUser.role });
    }
  }, []);

  useEffect(() => {
    const storedTicketID = localStorage.getItem("ticketID");
    const effectiveTicketID = propTicketID || Number(storedTicketID);
    if (effectiveTicketID) {
      setTicketID(effectiveTicketID);
      console.log("ChatUI: TicketID set.", { effectiveTicketID });
    }
  }, [propTicketID]);

  const fetchMessages = async () => {
    if (!userID || !ticketID) {
      console.log("ChatUI: fetchMessages - Missing userID or ticketID, skipping.", { userID, ticketID });
      return;
    }
    console.log(`ChatUI: fetchMessages - Attempting to fetch messages for TicketID: ${ticketID}, UserID: ${userID}`);
    try {
      const res = await fetch(
        `${axiosClient.defaults.baseURL}/api/ticketchatUser/${ticketID}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages((prev) =>
          data.map((msg) => {
            const existingMsg = prev.find((m) => m.id === msg.id);
            return {
              id: msg.id,
              ticketid: msg.ticketid,
              sender: String(msg.userid) === String(userID) ? "user" : "agent",
              text: msg.content,
              filePath: msg.file?.url ?? null,
              fileName: msg.file?.name ?? "",
              type: msg.type || "text",
              role: msg.role || "",
              timestamp: msg.timestamp || new Date().toISOString(),
              status: existingMsg?.status === "seen" ? "seen" : "✓",
            };
          })
        );
        console.log("ChatUI: fetchMessages - Messages fetched successfully. Calling markMessagesAsSeen.");
        markMessagesAsSeen(); // Mark as seen immediately after fetching messages
      }
    } catch (err) {
      console.error("ChatUI: fetchMessages - Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    if (userID && ticketID) {
      console.log("ChatUI: useEffect [userID, ticketID] - Fetching messages.");
      fetchMessages();
    }
  }, [ticketID, userID]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (message) => {
    setMessages((prev) => {
      const existingMsg = prev.find((m) => m.id === message.id);
      if (existingMsg) {
        return prev.map((m) =>
          m.id === message.id
            ? { ...m, status: m.status === "seen" ? "seen" : message.status }
            : m
        );
      }
      console.log("ChatUI: addMessage - New message received/added.", message);
      return [...prev, message];
    });
  };

  useEffect(() => {
    if (!userID || !ticketID) {
      console.log("ChatUI: useEffect for socket - Missing userID or ticketID, skipping socket setup.", { userID, ticketID });
      return;
    }

    console.log(`ChatUI: useEffect for socket - Joining ticket room ${ticketID}.`);
    socket.emit("joinTicketRoom", ticketID);

    const handleIncomingMessage = (message) => {
      const formattedMessage = {
        id: message.id || message.chatId || Date.now(),
        ticketid: message.ticketid || message.TicketID,
        sender: String(message.userid) === String(userID) ? "user" : "agent",
        text: message.content || message.Note || "",
        filePath: message.file?.url ?? null,
        fileName: message.file?.name ?? "",
        type: message.type || "text",
        role: message.role || "",
        timestamp: message.timestamp || new Date().toISOString(),
        status: message.status || "✓",
      };

      console.log("ChatUI: Socket - Received incoming message.", formattedMessage);
      addMessage(formattedMessage);

      // Mark messages as seen ONLY IF the current user is the recipient (i.e., message is from the other party)
      const isCurrentUserRecipient = 
        ((role.toLowerCase() === "supervisor" || role.toLowerCase() === "admin") && formattedMessage.sender === "user") ||
        (role.toLowerCase() === "user" && formattedMessage.sender === "agent");

      if (document.visibilityState === "visible" && isCurrentUserRecipient) {
        console.log("ChatUI: Socket - Document visible and current user is recipient. Calling markMessagesAsSeen.");
        markMessagesAsSeen();
      }
    };

    const handleSeenMessage = (seenData) => {
      console.log("ChatUI: Socket - Received messagesSeen event.", seenData);
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.ticketid) === String(seenData.TicketID) &&
          msg.role !== seenData.Role
            ? { ...msg, status: "✓✓" }
            : msg
        )
      );
    };

    socket.on("receiveTicketMessage", handleIncomingMessage);
    socket.on("messagesSeen", handleSeenMessage);

    return () => {
      console.log(`ChatUI: Socket - Leaving ticket room ${ticketID} and disconnecting.`);
      socket.off("receiveTicketMessage", handleIncomingMessage);
      socket.off("messagesSeen", handleSeenMessage);
      socket.emit("leaveTicketRoom", ticketID);
    };
  }, [ticketID, userID, role]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        ticketID &&
        role &&
        messages.length > 0
      ) {
        console.log("ChatUI: Visibility Change - Document became visible. Calling markMessagesAsSeen.");
        markMessagesAsSeen();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      console.log("ChatUI: Visibility Change - Removing event listener.");
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [ticketID, role, messages.length]);

  const handleFileDownload = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl, { mode: "cors" });
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileUrl.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("ChatUI: handleFileDownload - Download failed:", error);
      alert("File download failed.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("TicketID", ticketID);
      formData.append("Type", selectedFile ? "file" : "text");
      formData.append("Note", input || selectedFile?.name || "");
      formData.append("UserID", userID);
      formData.append("Role", role);
      if (selectedFile) formData.append("file", selectedFile);

      console.log("ChatUI: handleSend - Sending message.", { ticketID, userID, role, type: formData.get("Type"), note: formData.get("Note") });

      const res = await fetch(`${axiosClient.defaults.baseURL}/api/ticketchatUser`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to send message");

      console.log("ChatUI: handleSend - Message sent successfully.");
      setInput("");
      setSelectedFile(null);
    } catch (error) {
      console.error("ChatUI: handleSend - Send message failed:", error);
      alert("Message sending failed!");
    }
  };

  const linkifyText = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
      part.match(urlRegex) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 hover:text-blue-400"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  const getDateString = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="flex flex-col h-150 border-none rounded-md bg-white">
      <div className="flex-1 overflow-y-auto space-y-2 p-2 mt-2">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 mt-60">No messages yet</p>
        )}
        {messages.map((msg, idx) => {
          const showDateLabel =
            idx === 0 ||
            getDateString(messages[idx - 1]?.timestamp) !==
              getDateString(msg.timestamp);

          const isImage = msg.filePath?.match(
            /\.(jpeg|jpg|png|gif|webp|bmp|svg)$/i
          );

          return (
            <React.Fragment key={msg.id || idx}>
              {showDateLabel && (
                <div
                  className="text-center text-gray-500 text-sm my-2"
                  style={{ userSelect: "none" }}
                >
                  {new Date(msg.timestamp).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
              <div
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
                style={{ marginBottom: 8 }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "10px 16px",
                    borderRadius: 20,
                    backgroundColor:
                      msg.sender === "user" ? "#90cdf4" : "#e2e8f0",
                    color: "#1a202c",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    borderTopRightRadius: msg.sender === "user" ? 0 : 20,
                    borderTopLeftRadius: msg.sender === "user" ? 20 : 0,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender === "user" ? "" : "flex-start",
                  }}
                >
                  {msg.filePath ? (
                    <>
                      {isImage ? (
                        <img
                          src={msg.filePath}
                          alt="Sent"
                          loading="lazy"
                          style={{
                            maxWidth: "100%",
                            maxHeight: 180,
                            borderRadius: 12,
                            marginBottom: 8,
                            objectFit: "contain",
                            cursor: "pointer",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                            transition: "transform 0.3s ease",
                          }}
                          onClick={() => window.open(msg.filePath, "_blank")}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.transform = "scale(1.05)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />
                      ) : (
                        <div className="flex flex-col items-start">
                          <img
                            src={getIconUrl(msg.fileName || msg.text)}
                            alt="File Icon"
                            className="h-16 w-16 object-contain"
                          />
                          <a
                            href={msg.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 14,
                              textDecoration: "underline",
                              color: "#1a202c",
                            }}
                          >
                            📎 {msg.fileName || msg.text}
                          </a>
                          <button
                            onClick={() => handleFileDownload(msg.filePath)}
                            style={{
                              fontSize: 12,
                              padding: "4px 8px",
                              color: "#000",
                              backgroundColor: "rgba(255,255,255,0.7)",
                              borderRadius: 4,
                              cursor: "pointer",
                              marginTop: 4,
                              display: "block",
                              alignSelf: "flex-start",
                            }}
                          >
                            Download File
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <span>{linkifyText(msg.text)}</span>
                  )}

                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 11,
                      marginTop: 6,
                      color: "#4a5568",
                      userSelect: "none",
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.role && msg.role.toLowerCase() !== "supervisor"
                      ? `  ${msg.status}`
                      : null}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-2 border border-zinc-300 rounded bg-zinc-50 m-2">
          {selectedFile.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="h-20 object-contain rounded cursor-pointer"
              onClick={() =>
                window.open(URL.createObjectURL(selectedFile), "_blank")
              }
            />
          ) : (
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">{selectedFile.type}</span>
            </div>
          )}
          <button
            onClick={() => setSelectedFile(null)}
            className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-700 mr-3"
          >
            Remove
          </button>
        </div>
      )}

      <div className="p-2 border-zinc-300 border-t flex items-center space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        <IoMdAttach
          className="text-gray-900 size-7 cursor-pointer hover:text-gray-700"
          onClick={() => fileInputRef.current.click()}
          title="Attach or drop file"
        />
        <div
          className="flex-1 border border-zinc-300 rounded-full bg-zinc-50 px-4 py-2 text-sm"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) setSelectedFile(file);
          }}
        >
          <input
            type="text"
            className="w-full h-7 text-lg outline-none bg-transparent"
            placeholder="Type your message or drop a file..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() && !selectedFile}
        >
          <MdSend className="text-gray-900 hover:text-gray-700 size-8 cursor-pointer" />
        </button>
      </div>
    </div>
  );
};

export default ChatUI;
