import React, { useState, useEffect, useRef } from "react";

export default function ChatSection({ user, supportUser, initialMessages = [] }) {
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sendingFile, setSendingFile] = useState(null);
  const chatEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  function addMessage(msg) {
    setChatMessages((prev) => [...prev, msg]);
  }

  const handleSendMessage = () => {
    if (!chatInput.trim() && !sendingFile) return;

    if (sendingFile) {
      const fileMsg = {
        id: Date.now(),
        sender: user,
        text: "",
        file: sendingFile,
        timestamp: new Date().toLocaleTimeString(),
        status: "sent",
      };
      addMessage(fileMsg);
      setSendingFile(null);
    }

    if (chatInput.trim()) {
      const newMsg = {
        id: Date.now(),
        sender: user,
        text: chatInput.trim(),
        timestamp: new Date().toLocaleTimeString(),
        status: "sent",
      };
      addMessage(newMsg);
      setChatInput("");
    }
  };

  // Simulate delivery status
  useEffect(() => {
    const pending = chatMessages.filter((msg) => msg.status === "sent");
    if (pending.length === 0) return;

    const timer = setTimeout(() => {
      setChatMessages((msgs) =>
        msgs.map((msg) =>
          msg.status === "sent" ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 2000);

    return () => clearTimeout(timer);
  }, [chatMessages]);

  // File change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSendingFile(file);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col bg-gray-50 rounded-lg p-3 border border-gray-300 flex-1 overflow-y-auto h-96">
        {chatMessages.length === 0 && (
          <p className="text-center text-gray-400 mt-20">No chat messages yet.</p>
        )}

        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-3 ${
              msg.sender.id === user.id ? "justify-end" : "justify-start"
            }`}
          >
            <img
              src={msg.sender.avatar}
              alt={msg.sender.name}
              className="w-8 h-8 rounded-full mr-2 self-end"
            />
            <div
              className={`max-w-xs px-4 py-2 rounded-lg break-words whitespace-pre-wrap ${
                msg.sender.id === user.id
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-300 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.file ? (
                <div>
                  <strong>{msg.file.name}</strong>
                  <a
                    href={URL.createObjectURL(msg.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-700 underline mt-1"
                  >
                    View File
                  </a>
                </div>
              ) : (
                msg.text
              )}
              <div className="flex justify-between text-xs mt-1 opacity-70">
                <span>{msg.timestamp}</span>
                <span>
                  {msg.sender.id === user.id
                    ? msg.status === "sent"
                      ? "🕓 Sending..."
                      : "✓ Delivered"
                    : ""}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 ml-10 mb-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-200"></div>
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-400"></div>
            <span className="text-gray-600 text-sm">Support is typing...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Chat input */}
      <div className="mt-3 flex items-center space-x-2">
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
          onChange={handleFileChange}
        />
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={
            sendingFile
              ? `Ready to send file: ${sendingFile.name}`
              : "Type your message..."
          }
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={sendingFile !== null}
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={!chatInput.trim() && !sendingFile}
          aria-label="Send message"
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
