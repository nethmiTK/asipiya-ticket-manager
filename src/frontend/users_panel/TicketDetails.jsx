import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ChatUI from "../../user_components/ChatUI/ChatUI";
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";
import NotificationPanel from "../components/NotificationPanel";

const TicketDetails = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [evidenceLoading, setEvidenceLoading] = useState(true);
  const [ticketError, setTicketError] = useState(null);
  const [evidenceError, setEvidenceError] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const notificationRef = useRef(null);

  const [activeTab, setActiveTab] = useState("details");

  const storedUser = localStorage.getItem("user");
  let parsedUser = null;
  try {
    parsedUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error("Failed to parse localStorage user:", err);
  }

  useEffect(() => {
    if (!ticketId) return;

    setTicketLoading(true);
    setTicketError(null);
    axios
      .get(`http://localhost:5000/userTicket/${ticketId}`)
      .then((res) => setTicket(res.data))
      .catch(() => setTicketError("Error fetching ticket details"))
      .finally(() => setTicketLoading(false));
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;

    setEvidenceLoading(true);
    setEvidenceError(null);
    axios
      .get(`http://localhost:5000/api/evidence/${ticketId}`)
      .then((res) => setEvidenceFiles(res.data))
      .catch(() => setEvidenceError("Error fetching evidence files"))
      .finally(() => setEvidenceLoading(false));
  }, [ticketId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      const currentUserId = parsedUser?.UserID;
      if (!currentUserId) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/notifications/count/${currentUserId}`
        );
        setUnreadNotifications(response.data.count);
      } catch (error) {
        console.error("Error fetching unread notifications:", error);
      }
    };

    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, [parsedUser]);

return (
  <div className="flex">
    <SideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

    <div
      className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300
        ml-0 
        lg:ml-20 ${isSidebarOpen ? 'lg:ml-72' : ''}`}
    >
      <NavBar
        isSidebarOpen={isSidebarOpen}
        showNotifications={showNotifications}
        unreadNotifications={unreadNotifications}
        setShowNotifications={setShowNotifications}
        notificationRef={notificationRef}
        setOpen={setIsSidebarOpen}
      />

      <div className="p-6 mt-[60px]">
        {showNotifications && (
          <div
            ref={notificationRef}
            className="absolute right-4 top-[70px] z-50"
          >
            <NotificationPanel
              userId={parsedUser?.UserID}
              role={parsedUser?.Role}
              onClose={() => setShowNotifications(false)}
            />
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">Ticket Details</h2>

        {/* Tabs for Mobile View */}
        <div className="flex lg:hidden justify-between border-b mb-4">
          <button
            onClick={() => setActiveTab("details")}
            className={`w-1/2 py-2 text-center font-medium ${
              activeTab === "details"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`w-1/2 py-2 text-center font-medium ${
              activeTab === "chat"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Chat
          </button>
        </div>

        {ticketLoading ? (
          <p>Loading ticket details...</p>
        ) : ticketError ? (
          <p className="text-red-600">{ticketError}</p>
        ) : !ticket ? (
          <p>No ticket found.</p>
        ) : (
          <>
            {/* Mobile View */}
            <div className="lg:hidden">
              {activeTab === "details" && (
                <div className="bg-gray-100 border border-zinc-300 rounded-lg shadow-lg p-4 mb-4">
                  <div className="space-y-3 text-lg text-justify">
                    <p><strong>Ticket ID:</strong> {ticket.id}</p>
                    <p><strong>Status:</strong> {ticket.status}</p>
                    <p><strong>Description:</strong> {ticket.description}</p>
                    <p><strong>System Name:</strong> {ticket.system_name}</p>
                    <p><strong>Category:</strong> {ticket.category}</p>
                    <p><strong>Date & Time:</strong> {new Date(ticket.datetime).toLocaleString()}</p>
                    <p><strong>Supervisor:</strong> {ticket.supervisor_name || "Not Assigned"}</p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-bold mb-2">Evidence</h3>
                    {evidenceLoading ? (
                      <p>Loading evidence files...</p>
                    ) : evidenceError ? (
                      <p className="text-red-600">{evidenceError}</p>
                    ) : evidenceFiles.length === 0 ? (
                      <p>No evidence files available.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {evidenceFiles.map((file, index) => {
                          const filePath = file.FilePath || file.filepath || "";
                          const fileUrl = `http://localhost:5000/${filePath}`;
                          const lowerPath = filePath.toLowerCase();

                          if (/\.(jpg|jpeg|png|gif)$/i.test(lowerPath)) {
                            return (
                              <div key={index} className="rounded p-1 bg-white shadow-sm">
                                <img src={fileUrl} alt={`Evidence ${index + 1}`} className="w-full h-20 object-cover rounded" />
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline block mt-1 text-center text-sm">View File</a>
                              </div>
                            );
                          } else if (/\.(pdf)$/i.test(lowerPath)) {
                            return (
                              <div key={index} className="rounded p-2 bg-white shadow-sm flex flex-col items-center justify-center text-center">
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">📄 PDF Document {index + 1}</a>
                              </div>
                            );
                          } else if (/\.(mp4|webm|ogg)$/i.test(lowerPath)) {
                            return (
                              <div key={index} className="rounded p-1 bg-white shadow-sm">
                                <video src={fileUrl} controls className="w-full h-32 rounded object-cover" />
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline block mt-1 text-center text-sm">View Video</a>
                              </div>
                            );
                          } else {
                            return (
                              <div key={index} className="rounded p-2 bg-white shadow-sm flex items-center justify-center">
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-700 underline font-medium">📁 File {index + 1}</a>
                              </div>
                            );
                          }
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "chat" && (
                <div className="bg-white border border-zinc-300 rounded-lg shadow-lg p-4">
                  <h2 className="font-bold text-xl mb-2">Chat</h2>
                  <ChatUI ticketID={ticket.id} />
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="bg-gray-100 border border-zinc-300 rounded-lg shadow-lg p-4">
                <div className="space-y-3 text-lg text-justify">
                  <p><strong>Ticket ID:</strong> {ticket.id}</p>
                  <p><strong>Status:</strong> {ticket.status}</p>
                  <p><strong>Description:</strong> {ticket.description}</p>
                  <p><strong>System Name:</strong> {ticket.system_name}</p>
                  <p><strong>Category:</strong> {ticket.category}</p>
                  <p><strong>Date & Time:</strong> {new Date(ticket.datetime).toLocaleString()}</p>
                  <p><strong>Supervisor:</strong> {ticket.supervisor_name || "Not Assigned"}</p>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-2">Evidence</h3>
                  {evidenceLoading ? (
                    <p>Loading evidence files...</p>
                  ) : evidenceError ? (
                    <p className="text-red-600">{evidenceError}</p>
                  ) : evidenceFiles.length === 0 ? (
                    <p>No evidence files available.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {evidenceFiles.map((file, index) => {
                        const filePath = file.FilePath || file.filepath || "";
                        const fileUrl = `http://localhost:5000/${filePath}`;
                        const lowerPath = filePath.toLowerCase();

                        if (/\.(jpg|jpeg|png|gif)$/i.test(lowerPath)) {
                          return (
                            <div key={index} className="rounded p-1 bg-white shadow-sm">
                              <img src={fileUrl} alt={`Evidence ${index + 1}`} className="w-full h-20 object-cover rounded" />
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline block mt-1 text-center text-sm">View File</a>
                            </div>
                          );
                        } else if (/\.(pdf)$/i.test(lowerPath)) {
                          return (
                            <div key={index} className="rounded p-2 bg-white shadow-sm flex flex-col items-center justify-center text-center">
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">📄 PDF Document {index + 1}</a>
                            </div>
                          );
                        } else if (/\.(mp4|webm|ogg)$/i.test(lowerPath)) {
                          return (
                            <div key={index} className="rounded p-1 bg-white shadow-sm">
                              <video src={fileUrl} controls className="w-full h-32 rounded object-cover" />
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline block mt-1 text-center text-sm">View Video</a>
                            </div>
                          );
                        } else {
                          return (
                            <div key={index} className="rounded p-2 bg-white shadow-sm flex items-center justify-center">
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-700 underline font-medium">📁 File {index + 1}</a>
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-zinc-300 rounded-lg shadow-lg p-4">
                <h2 className="font-bold text-xl mb-2">Chat</h2>
                <ChatUI ticketID={ticket.id} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);

};

export default TicketDetails;
