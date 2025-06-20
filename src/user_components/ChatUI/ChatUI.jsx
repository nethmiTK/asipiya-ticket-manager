import React, { useState, useEffect, useRef } from "react";
import { IoMdAttach } from "react-icons/io";
import { MdSend } from "react-icons/md";
import * as pdfjsLib from "pdfjs-dist";

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
        setMessages(
          data.map((msg) => ({
            id: msg.id,
            ticketid: msg.ticketid,
            sender: msg.userid === userID ? "user" : "agent",
            text: msg.content,
            filePath: msg.file?.url ?? null,
            type: msg.type || "text",
            role: msg.role || "",
            timestamp: msg.timestamp || new Date().toISOString(),
            status: "delivered",
            fileName: msg.file?.name || "",
          }))
        );
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

  const generatePdfPreview = async (file) => {
    if (!file || !canvasRef.current) return;
    const reader = new FileReader();
    reader.onload = async function () {
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
      const filename = fileUrl.split("/").pop() || "download";
      a.download = filename;
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

      if (res.ok) {
        fetchMessages();
        setInput("");
        setSelectedFile(null);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Send message failed:", error);
      alert("Message sending failed!");
    }
  };

  const linkifyText = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-200 hover:text-blue-400"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-150 border-none rounded-md bg-white">
      <div className="flex-1 overflow-y-auto space-y-2 p-2 mt-2">
        {messages.map((msg, idx) => {
          const isImage =
            msg.type === "file" &&
            msg.filePath?.match(/\.(jpeg|jpg|png|gif|webp|bmp|svg)$/i);
          const isVideo =
            msg.type === "file" && msg.filePath?.match(/\.(mp4|webm|ogg)$/i);
          const isPDF = msg.type === "file" && msg.filePath?.match(/\.pdf$/i);

          return (
            <div
              key={msg.id || idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl text-lg max-w-xs break-words whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-blue-300 text-gray-800 rounded-br-none"
                    : "bg-gray-300 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.role && (
                  <p className="text-lg text-white mb-1 font-semibold">
                    {msg.role}
                  </p>
                )}

                {msg.filePath ? (
                  <>
                    {isImage && (
                      <>
                        <img
                          src={msg.filePath}
                          alt="Sent"
                          className="rounded mb-2 shadow-sm object-contain max-h-30 max-w-full"
                        />
                        <button
                          onClick={() => handleFileDownload(msg.filePath)}
                          className="text-sm px-4 py-2 text-black bg-white/80 rounded mt-1 block cursor-pointer"
                        >
                          Download Image
                        </button>
                      </>
                    )}

                    {isVideo && (
                      <>
                        <video controls className="mb-2 max-w-full max-h-40">
                          <source src={msg.filePath} />
                        </video>
                        <button
                          onClick={() => handleFileDownload(msg.filePath)}
                          className="text-sm px-4 py-2 text-black bg-white/80 rounded mt-1 block cursor-pointer"
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
                          className="block"
                        >
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                            alt="PDF"
                            className="w-20 h-20 object-contain mb-1"
                          />
                        </a>
                        <button
                          onClick={() => handleFileDownload(msg.filePath)}
                          className="text-xs px-4 py-2 text-black bg-white/80 rounded mt-1 block cursor-pointer"
                        >
                          Download PDF
                        </button>
                      </>
                    )}

                    {!isImage && !isVideo && !isPDF && (
                      <>
                        <a
                          href={msg.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline text-white"
                        >
                          📎 {msg.fileName || msg.text}
                        </a>
                        <button
                          onClick={() => handleFileDownload(msg.filePath)}
                          className="text-xs px-4 py-2 text-black bg-white/80 rounded mt-1 block cursor-pointer"
                        >
                          Download File
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <span>{linkifyText(msg.text)}</span>
                )}

                <div className="text-xs text-white mt-1">
                  {new Date(msg.timestamp).toLocaleString()} -{" "}
                  {msg.status === "sending"
                    ? "Sending"
                    : msg.status === "failed"
                    ? "Failed"
                    : "Delivered"}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-2 border rounded bg-zinc-50 m-2">
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
          ) : (
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">{selectedFile.type}</span>
            </div>
          )}
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
        <div
          className="relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) setSelectedFile(file);
          }}
        >
          <IoMdAttach
            className="text-gray-900 size-7 cursor-pointer hover:text-gray-700"
            onClick={() => fileInputRef.current.click()}
            title="Attach or drop file"
          />
        </div>

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
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
        </div>

        <button onClick={handleSend} disabled={!input.trim() && !selectedFile}>
          <MdSend className="text-gray-900 hover:text-gray-700 size-8" />
        </button>
      </div>
    </div>
  );
};

export default ChatUI;
