import React, { useState, useEffect, useRef } from "react";
import { IoMdAttach } from "react-icons/io";
import { MdSend } from "react-icons/md";

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);


  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/ticketchat/${ticketID}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data.map((msg) => ({
          sender: msg.UserID === userID ? "user" : "agent",
          text: msg.Note,
          filePath: msg.Path || null,
        })));
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    const formData = new FormData();
    formData.append("TicketID", ticketID);
    formData.append("Type", selectedFile ? "file" : "text");
    formData.append("Note", input || "");
    formData.append("UserCustomerID", userCustomerID);
    formData.append("UserID", userID);
    if (selectedFile) formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:5000/api/ticketchat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "user",
            text: input || "📎 File sent",
            filePath: data.filePath || null,
          },
        ]);
        setInput("");
        setSelectedFile(null);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, [ticketID]);

  return (
    <div className="flex flex-col h-full border-none rounded-md bg-white">
      <div className="flex-1 overflow-y-auto space-y-2 p-2 mt-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl text-sm max-w-xs ${
                msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-400 text-white"
              }`}
            >
              {msg.filePath ? (
                <a
                  href={`http://localhost:5000/${msg.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  📎 File
                </a>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 border-zinc-300 border-t flex items-center space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        <IoMdAttach
          className="text-gray-500 size-5 cursor-pointer"
          onClick={() => fileInputRef.current.click()}
        />
        <input
          type="text"
          className="flex-1 border border-zinc-300 rounded-full px-4 py-2 text-sm bg-zinc-50"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>
          <MdSend className="text-gray-900 hover:text-gray-700 size-7" />
        </button>
      </div>
    </div>
  );
};

export default ChatUI;
