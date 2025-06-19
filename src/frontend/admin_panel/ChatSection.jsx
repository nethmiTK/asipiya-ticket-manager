import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// Helper to detect URLs in text and convert them to links
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

export default function ChatSection({
  user,
  supportUser,
  ticketId,
  ticket,
  role,
}) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingFile, setSendingFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!ticketId) return;

    axios
      .get(`http://localhost:5000/messages/${ticketId}`)
      .then((res) => setChatMessages(res.data))
      .catch(console.error);
  }, [ticketId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() && !sendingFile) return;

    const optimisticId = Date.now();
    const localFileUrl = sendingFile ? URL.createObjectURL(sendingFile) : null;

    const newMsg = {
      id: optimisticId,
      ticketid: ticketId,
      userid: supportUser || null,
      role: role || "Supervisor",
      content: chatInput || (sendingFile && sendingFile.name),
      timestamp: new Date().toISOString(),
      type: sendingFile ? "file" : "text",
      file: sendingFile
        ? {
            name: sendingFile.name,
            url: localFileUrl,
          }
        : null,
      status: "sending",
    };

    setChatMessages((prev) => [...prev, newMsg]);

    try {
      const formData = new FormData();
      formData.append("TicketID", ticketId);
      formData.append("Type", sendingFile ? "file" : "text");
      formData.append("Note", chatInput || sendingFile.name);
      formData.append("UserID", supportUser || "");
      formData.append("Role", role || "Supervisor");
      if (sendingFile) {
        formData.append("File", sendingFile);
      }

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
        msgs.map((msg) =>
          msg.id === optimisticId
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
      );

      setChatInput("");
      setSendingFile(null);
    } catch (error) {
      console.error("Send failed:", error);
      setChatMessages((msgs) =>
        msgs.map((msg) =>
          msg.id === optimisticId ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto border-gray-400 rounded-lg shadow-lg">
      <header className="p-4 rounded-lg border-b bg-gray-50">
        <h2 className="text-lg font-bold">
          Chat for Ticket #{ticket?.id || ticketId}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {chatMessages.length === 0 && (
          <p className="text-center text-gray-400 mt-20">
            No chat messages yet.
          </p>
        )}

        {chatMessages.map((msg) => {
          const isClient = msg.role === "User";

          return (
            <div
              key={msg.id}
              className={`flex mb-3 ${
                !isClient ? "justify-end" : "justify-start"
              }`}
            >
              {isClient && (
                <img
                  src={
                    supportUser?.avatar || "https://i.pravatar.cc/40?u=user1"
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
                {msg.file
                  ? (() => {
                      const fileUrl = msg.file.url;
                      const fileName = msg.file.name.toLowerCase();

                      if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
                        return (
                          <div>
                            <img
                              src={fileUrl}
                              alt={fileName}
                              className="w-40 h-auto rounded-md mb-1"
                            />
                            <p className="text-sm break-words">
                              {msg.file.name}
                            </p>
                          </div>
                        );
                      } else if (fileName.match(/\.(mp4|webm|ogg|mov)$/i)) {
                        return (
                          <div>
                            <video
                              controls
                              src={fileUrl}
                              className="w-40 h-auto rounded-md mb-1"
                            />
                            <p className="text-sm break-words">
                              {msg.file.name}
                            </p>
                          </div>
                        );
                      } else if (fileName.match(/\.pdf$/i)) {
                        return (
                          <div>
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                              alt="PDF"
                              className="w-20 h-20 object-contain mb-1"
                            />
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 underline text-xs"
                            >
                              View Full PDF
                            </a>
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <p className="text-sm break-words font-semibold">
                              {msg.file.name}
                            </p>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 underline text-xs"
                            >
                              Download File
                            </a>
                          </div>
                        );
                      }
                    })()
                  : renderMessageWithLinks(msg.content)}

                <div className="flex justify-between text-xs mt-1 opacity-70">
                  <span>{new Date(msg.timestamp).toLocaleString()}</span>
                  {!isClient && (
                    <span>
                      {msg.status === "sending"
                        ? "🕓 Sending..."
                        : msg.status === "failed"
                        ? "❌ Failed"
                        : "✓ Delivered"}
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

        {/* Preview for file before sending */}
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
                      className="w-20 h-20"
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

        {isTyping && (
          <div className="flex items-center space-x-2 ml-10 mb-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-200" />
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-400" />
            <span className="text-gray-600 text-sm">Support is typing...</span>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="mt-3 flex items-center space-x-2 p-3 border-t border-gray-300 bg-white rounded-b-lg">
        <label
          htmlFor="file-upload"
          className="cursor-pointer p-2 border rounded-md hover:bg-gray-200"
          title="Attach file"
        >
          📎
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
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={!chatInput.trim() && !sendingFile}
        >
          Send
        </button>
      </div>
    </div>
  );
}
