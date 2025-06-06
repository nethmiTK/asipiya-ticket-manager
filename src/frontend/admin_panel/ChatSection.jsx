// ChatSection.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ChatSection({ user, supportUser, ticketId, ticket, role }) {
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
    if (!chatInput.trim()) return;

    const optimisticId = Date.now();

    const newMsg = {
      id: optimisticId,
      ticketid: ticketId,
      usercustomerid: user || null,
      userid: supportUser || null,
      role: role,
      content: chatInput,
      timestamp: new Date().toISOString(),
      type: "text",
      file: null,
      status: "sending",
    };

    setChatMessages((prev) => [...prev, newMsg]);

    try {
      const res = await axios.post("http://localhost:5000/ticketchat", {
        TicketID: ticketId,
        Note: chatInput,
        Type: "text",
        UserCustomerID: user || "",
        UserID: supportUser || "",
        Role:role,
      });

      const newId = res.data.chatId;

      setChatMessages((msgs) =>
        msgs.map((msg) =>
          msg.id === optimisticId
            ? { ...msg, id: newId, status: "delivered" }
            : msg
        )
      );

      setChatInput("");
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
    <div className="flex flex-col h-full max-w-md mx-auto border rounded-lg shadow-lg">
      <header className="p-4 border-b">
        <h2 className="text-lg font-bold">
          Chat for Ticket #{ticket?.id || ticketId}
        </h2>
        <p className="text-sm text-gray-600">
          {ticket?.problem || "Loading ticket..."}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {chatMessages.length === 0 && (
          <p className="text-center text-gray-400 mt-20">
            No chat messages yet.
          </p>
        )}

        {chatMessages.map((msg) => {
          const isClient = msg.usercustomerid === user?.usercustomerid;

          return (
            <div
              key={msg.id}
              className={`flex mb-3 ${
                !isClient ? "justify-end" : "justify-start"
              }`}
            >
              {isClient && (
                <img
                  src={supportUser?.avatar || "https://i.pravatar.cc/40?u=user1"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full mr-2 self-end"
                />
              )}

              <div
                className={`max-w-xs px-4 py-2 rounded-lg break-words whitespace-pre-wrap ${
                  !isClient
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-300 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.file ? (
                  <>
                    <strong>{msg.file.name}</strong>
                    <a
                      href={msg.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-200 underline mt-1"
                    >
                      View File
                    </a>
                  </>
                ) : (
                  msg.content
                )}
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

        {isTyping && (
          <div className="flex items-center space-x-2 ml-10 mb-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-200" />
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-400" />
            <span className="text-gray-600 text-sm">Support is typing...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="mt-3 flex items-center space-x-2 p-3 border-t border-gray-300 bg-white rounded-b-lg">
        <label
          htmlFor="file-upload"
          className="cursor-pointer p-2 border rounded-md hover:bg-gray-200"
          title="Attach file"
        >
          📎
        </label>
        {/*<input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={(e) => setSendingFile(e.target.files[0])}
        />*/}
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
        {sendingFile && (
          <button
            onClick={() => setSendingFile(null)}
            className="ml-1 text-red-600 hover:text-red-800"
            title="Cancel file"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
