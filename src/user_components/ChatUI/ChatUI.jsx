import React, { useState, useEffect, useRef } from "react";
import { IoMdAttach } from "react-icons/io";
import { MdSend } from "react-icons/md";

const ChatUI = ({ ticketID: propTicketID }) => {
  const [ticketID, setTicketID] = useState(null);
  const [userID, setUserID] = useState(null);
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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
      const res = await fetch(`http://localhost:5000/api/ticketchat/${ticketID}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setMessages(
          data.map((msg) => ({
            sender: msg.UserID === userID ? "user" : "agent",
            text: msg.Note,
            filePath: msg.Path || null,
            role: msg.Role || "",
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  useEffect(() => {
    if (userID && ticketID) {
      fetchMessages();
    }
  }, [ticketID, userID]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    const formData = new FormData();
    formData.append("TicketID", ticketID);
    formData.append("Type", selectedFile ? "file" : "text");
    formData.append("Note", input || "");
    formData.append("UserID", userID);
    formData.append("Role", role); 
    if (selectedFile) formData.append("file", selectedFile);

    console.log("Sending chat message:", {
      TicketID: ticketID,
      Type: selectedFile ? "file" : "text",
      Note: input || "",
      UserID: userID,
      Role: role,
    });

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
            role: role,
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

  return (
    <div className="flex flex-col h-full border-none rounded-md bg-white">
      <div className="flex-1 overflow-y-auto space-y-2 p-2 mt-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl text-sm max-w-xs break-words ${
                msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-400 text-white"
              }`}
            >
              <p className="text-xs text-gray-200 mb-1 font-semibold">{msg.role}</p>
              {msg.filePath ? (
                <>
                  <a
                    href={`http://localhost:5000/${msg.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline block"
                  >
                    📎 File
                  </a>
                  {msg.text && <p>{msg.text}</p>}
                </>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {selectedFile && selectedFile.type.startsWith("image/") && (
        <div className="flex items-center justify-between p-2 border rounded bg-zinc-50 m-2">
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Preview"
            className="h-20 object-contain rounded"
          />
          <button
            onClick={() => setSelectedFile(null)}
            className="text-red-500 text-sm ml-4"
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
