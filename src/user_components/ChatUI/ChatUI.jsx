import React, { useState, useEffect, useRef } from "react";
import { IoMdAttach } from "react-icons/io";
import { MdSend } from "react-icons/md";
import * as pdfjsLib from "pdfjs-dist";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

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
    if (!ticketID || !role) return;

    try {
      const res = await fetch("http://localhost:5000/ticketchat/markSeen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TicketID: ticketID, Role: role }),
      });
      if (!res.ok) throw new Error("Failed to mark messages as seen");
      console.log("Messages marked as seen");
    } catch (err) {
      console.error("Error marking messages as seen:", err);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserID(storedUser.UserID || storedUser.id);
      setRole(storedUser.Role || storedUser.role || "");
    }
  }, []);

  useEffect(() => {
    const storedTicketID = localStorage.getItem("ticketID");
    const effectiveTicketID = propTicketID || Number(storedTicketID);
    if (effectiveTicketID) {
      setTicketID(effectiveTicketID);
    }
  }, [propTicketID]);

  const fetchMessages = async () => {
    if (!userID || !ticketID) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/ticketchatUser/${ticketID}`
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
              status: existingMsg?.status === "seen" ? "seen" : "✓ delivered",
            };
          })
        );
        markMessagesAsSeen();
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  useEffect(() => {
    if (userID && ticketID) fetchMessages();
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
      return [...prev, message];
    });
  };

  useEffect(() => {
    if (!userID || !ticketID) return;

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
        status: message.status || "✓ delivered",
      };

      addMessage(formattedMessage);

      if (
        (role.toLowerCase() === "supervisor" &&
          formattedMessage.sender === "user") ||
        (role.toLowerCase() !== "supervisor" &&
          formattedMessage.sender === "agent")
      ) {
        markMessagesAsSeen();
      }
    };

    const handleSeenMessage = (seenData) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.ticketid) === String(seenData.TicketID) &&
          msg.role !== seenData.Role
            ? { ...msg, status: "✓✓ seen" }
            : msg
        )
      );
    };

    socket.on("receiveTicketMessage", handleIncomingMessage);
    socket.on("messagesSeen", handleSeenMessage);

    return () => {
      socket.off("receiveTicketMessage", handleIncomingMessage);
      socket.off("messagesSeen", handleSeenMessage);
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
        markMessagesAsSeen();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [ticketID, role, messages]);

  const generatePdfPreview = async (file) => {
    if (!file || !canvasRef.current) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: reader.result }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
      } catch (err) {
        console.error("PDF render error:", err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (selectedFile?.type === "application/pdf") {
      generatePdfPreview(selectedFile);
    }
  }, [selectedFile]);

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
      console.error("Download failed:", error);
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

      const res = await fetch("http://localhost:5000/api/ticketchatUser", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to send message");

      setInput("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Send message failed:", error);
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

  return (
    <div className="flex flex-col h-150 border-none rounded-md bg-white">
      <div className="flex-1 overflow-y-auto space-y-2 p-2 mt-2">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 mt-60">No messages yet</p>
        )}
        {messages.map((msg, idx) => {
          const isImage = msg.filePath?.match(
            /\.(jpeg|jpg|png|gif|webp|bmp|svg)$/i
          );
          const isVideo = msg.filePath?.match(/\.(mp4|webm|ogg)$/i);
          const isPDF = msg.filePath?.match(/\.pdf$/i);
          const isExcel = msg.filePath?.match(/\.(xls|xlsx)$/i);
          const isWord = msg.filePath?.match(/\.(doc|docx)$/i);

          return (
            <div
              key={msg.id || idx}
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
                }}
              >
                {msg.filePath ? (
                  <>
                    {isImage && (
                      <>
                        <img
                          src={msg.filePath}
                          alt="Sent"
                          style={{
                            maxWidth: "100%",
                            maxHeight: 180,
                            borderRadius: 12,
                            marginBottom: 8,
                            objectFit: "contain",
                          }}
                        />
                        <button
                          onClick={() => handleFileDownload(msg.filePath)}
                          style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            color: "#000",
                            backgroundColor: "rgba(255,255,255,0.7)",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          Download Image
                        </button>
                      </>
                    )}
                    {isVideo && (
                      <>
                        <video
                          controls
                          style={{
                            maxWidth: "100%",
                            maxHeight: 180,
                            marginBottom: 8,
                          }}
                        >
                          <source src={msg.filePath} />
                        </video>
                        <button
                          onClick={() => handleFileDownload(msg.filePath)}
                          style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            color: "#000",
                            backgroundColor: "rgba(255,255,255,0.7)",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          Download Video
                        </button>
                      </>
                    )}
                    {isPDF && (
                      <>
                        <a
                          href={msg.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "block", marginBottom: 4 }}
                        >
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                            alt="PDF"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "contain",
                            }}
                          />
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
                          }}
                        >
                          Download PDF
                        </button>
                      </>
                    )}
                    {isExcel && (
                      <>
                        <a
                          href={msg.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "block", marginBottom: 4 }}
                        >
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
                            alt="Excel"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "contain",
                            }}
                          />
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
                          }}
                        >
                          Download Excel
                        </button>
                      </>
                    )}
                    {isWord && (
                      <>
                        <a
                          href={msg.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "block", marginBottom: 4 }}
                        >
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/732/732221.png"
                            alt="Word"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "contain",
                            }}
                          />
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
                          }}
                        >
                          Download Word
                        </button>
                      </>
                    )}
                    {!isImage && !isVideo && !isPDF && !isExcel && !isWord && (
                      <>
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
                          }}
                        >
                          Download File
                        </button>
                      </>
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
                  }}
                >
                  {new Date(msg.timestamp).toLocaleString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {msg.role && msg.role.toLowerCase() !== "supervisor"
                    ? `  ${msg.status}`
                    : null}
                </div>
              </div>
            </div>
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
              className="h-20 object-contain rounded"
            />
          ) : selectedFile.type.startsWith("video/") ? (
            <video
              className="h-20 object-contain rounded"
              src={URL.createObjectURL(selectedFile)}
              controls
            />
          ) : selectedFile.type === "application/pdf" ? (
            <canvas ref={canvasRef} className="h-20 rounded border shadow" />
          ) : selectedFile.type ===
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            selectedFile.type === "application/vnd.ms-excel" ? (
            <img
              src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
              alt="Excel file"
              className="h-20 object-contain rounded"
            />
          ) : selectedFile.type ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            selectedFile.type === "application/msword" ? (
            <img
              src="https://cdn-icons-png.flaticon.com/512/732/732221.png"
              alt="Word file"
              className="h-20 object-contain rounded"
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
              if (e.key === "Enter") {
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
