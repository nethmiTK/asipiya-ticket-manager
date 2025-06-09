import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";
import ChatUI from "../../user_components/ChatUI/ChatUI";
import NotificationPanel from "../components/NotificationPanel";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  "in progress": "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const TicketView = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const modalRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const notificationRef = useRef(null);

  useEffect(() => {
    const fetchTickets = async () => {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).UserID : null;

      if (!userId) return;

      try {
        const res = await axios.get("http://localhost:5000/userTickets", {
          params: { userId },
        });
        setTickets(res.data);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  //useEffect for closing notification panel when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // useEffect for fetching unread notification count
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).UserID : null;

      if (!userId) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/notifications/count/${userId}`);
        setUnreadNotifications(response.data.count);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex">
      <title>My All Tickets</title>
     <SideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} /> 
      <div className={`flex-1 ${isSidebarOpen ? 'ml-72' : 'ml-20'} flex flex-col h-screen overflow-y-auto transition-all duration-300`}>
        <NavBar
          isSidebarOpen={isSidebarOpen}
          showNotifications={showNotifications}
          unreadNotifications={unreadNotifications}
          setShowNotifications={setShowNotifications}
          notificationRef={notificationRef}
        /> 
        <div className="p-6 mt-[60px]">
          {showNotifications && (
            <div ref={notificationRef} className="absolute right-4 top-[70px] z-50">
              <NotificationPanel
                userId={JSON.parse(localStorage.getItem("user"))?.UserID}
                role={JSON.parse(localStorage.getItem("user"))?.Role}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          )}
          <h1 className="text-2xl font-bold mb-4">My All Tickets</h1>

          {loading ? (
            <p>Loading...</p>
          ) : tickets.length === 0 ? (
            <p>No tickets found.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3 w-32">Status</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">System Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setActiveTab("details");
                        setIsModalOpen(true);
                      }}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-2 font-medium text-gray-900">
                        {ticket.id}
                      </td>
                      <td className="px-6 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status?.toLowerCase()] ||
                            "bg-gray-200 text-gray-800"
                            }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-justify">
                        {ticket.description}
                      </td>
                      <td className="px-4 py-2">{ticket.system_name}</td>
                      <td className="px-4 py-2">{ticket.category}</td>
                      <td className="px-4 py-2 text-gray-500">
                        {new Date(ticket.datetime).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isModalOpen && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div
              ref={modalRef}
              className="bg-gray-100 rounded-lg shadow-xl w-[90%] max-w-md min-h-[500px] border border-gray-300 relative"
            >
              <div className="flex border-b border-gray-300 relative">
                <button
                  className={`px-4 py-2 w-1/2 text-sm font-medium rounded-tl-lg ${activeTab === "details"
                      ? "bg-gray-900 text-white"
                      : "bg-purple-100 text-gray-900"
                    }`}
                  onClick={() => setActiveTab("details")}
                >
                  Ticket Details
                </button>
                <button
                  className={`px-4 py-2 w-1/2 text-sm font-medium rounded-tr-lg ${activeTab === "chat"
                      ? "bg-gray-900 text-white"
                      : "bg-purple-100 text-gray-900"
                    }`}
                  onClick={() => setActiveTab("chat")}
                >
                  Chat
                </button>
              </div>

              <div className="p-4 text-sm h-[450px] overflow-y-auto">
                {activeTab === "details" ? (
                  <div className="space-y-3">
                    <h2 className="font-bold mb-6 text-2xl">Ticket Details</h2>
                    <p>
                      <strong>Ticket ID:</strong> {selectedTicket.id}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedTicket.status}
                    </p>
                    <p>
                      <strong className="text-justify">Description:</strong>{" "}
                      {selectedTicket.description}
                    </p>
                    <p>
                      <strong>System Name:</strong> {selectedTicket.system_name}
                    </p>
                    <p>
                      <strong>Category:</strong> {selectedTicket.category}
                    </p>
                    <p>
                      <strong>Date & Time:</strong>{" "}
                      {new Date(selectedTicket.datetime).toLocaleString()}
                    </p>
                    <p>
                      <strong>Supervisor:</strong>{" "}
                      {selectedTicket.supervisor_name || "Not Assigned"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h2 className="font-semibold mb-2">Chat</h2>
                    <ChatUI />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketView;
