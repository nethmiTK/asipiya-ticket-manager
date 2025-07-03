import React, { useEffect, useState, useRef } from "react";
import axiosClient from "../axiosClient";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import AdminNavBar from "../../user_components/NavBar/AdminNavBar";
import TicketViewPage from "../admin_panel/TicketViewPage";
import NotificationPanel from "../components/NotificationPanel";
import { useAuth } from "../../App";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import Select from "react-select";
import { toast } from "react-toastify";

const PendingTicket = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTicketPopup, setShowTicketPopup] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [systemOptions, setSystemOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Auth and Notifications
  const { loggedInUser: user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axiosClient.get("/api/pending_ticket");
        const pendingTickets = response.data.filter(
          (ticket) => ticket.Status?.toLowerCase() === "pending"
        );
        setTickets(pendingTickets);
        setFilteredTickets(pendingTickets);

        const systems = [...new Set(pendingTickets.map(t => t.SystemName).filter(Boolean))];
        const companies = [...new Set(pendingTickets.map(t => t.CompanyName).filter(Boolean))];
        setSystemOptions(systems.map(s => ({ value: s, label: s })));
        setCompanyOptions(companies.map(c => ({ value: c, label: c })));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        toast.error("Failed to load pending tickets.");
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Notification click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadNotifications = async () => {
    if (!user?.UserID) return;
    try {
      const res = await axiosClient.get(`/api/notifications/count/${user.UserID}`);
      setUnreadNotifications(res.data.count);
    } catch (err) {
      console.error("Error fetching unread notifications", err);
    }
  };

  useEffect(() => {
    if (user?.UserID) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.UserID]);

  const handleTicketClick = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowTicketPopup(true);
  };

  useEffect(() => {
    let temp = [...tickets];
    if (selectedSystem) temp = temp.filter(ticket => ticket.SystemName === selectedSystem.value);
    if (selectedCompany) temp = temp.filter(ticket => ticket.CompanyName === selectedCompany.value);
    setFilteredTickets(temp);
    setCurrentPage(1);
  }, [selectedSystem, selectedCompany, tickets]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "open": return "text-red-500";
      case "in progress": return "text-yellow-500";
      case "closed": return "text-green-500";
      case "pending": return "text-blue-500";
      default: return "";
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <AdminNavBar
        pageTitle="Pending Tickets"
        user={user}
        sidebarOpen={isSidebarOpen}
        onProfileClick={() => navigate('/admin-profile')}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        unreadNotifications={unreadNotifications}
        showNotifications={showNotifications}
        notificationRef={notificationRef}
      />

      <main className={`flex-1 min-h-screen bg-gray-100 p-6 pt-24 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}>
        {showNotifications && (
          <div ref={notificationRef} className="absolute right-4 top-16 z-50">
            <NotificationPanel
              userId={user?.UserID}
              role={user?.Role}
              onClose={() => setShowNotifications(false)}
              onNotificationUpdate={fetchUnreadNotifications}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="w-64">
            <Select
              options={systemOptions}
              value={selectedSystem}
              onChange={setSelectedSystem}
              placeholder="Filter by System"
              isClearable
            />
          </div>
          <div className="w-64">
            <Select
              options={companyOptions}
              value={selectedCompany}
              onChange={setSelectedCompany}
              placeholder="Filter by Company"
              isClearable
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">System Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Company Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((ticket) => (
                <tr key={ticket.TicketID} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4">{ticket.TicketID}</td>
                  <td className="px-6 py-4">{ticket.SystemName || "N/A"}</td>
                  <td className="px-6 py-4">{ticket.CompanyName || "N/A"}</td>
                  <td className="px-6 py-4">{ticket.UserName || "N/A"}</td>
                  <td className="px-6 py-4">{ticket.DateTime ? new Date(ticket.DateTime).toLocaleString() : "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${getStatusColor(ticket.Status)}`}>
                      {ticket.Status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleTicketClick(ticket.TicketID)} className="text-blue-600 hover:text-blue-800">
                      <FaEdit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTickets.length > 0 && (
          <div className="flex justify-end items-center mt-4 p-4">
            <span className="text-sm text-gray-600 mr-4">
              {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredTickets.length)} of ${filteredTickets.length}`}
            </span>
            <div className="space-x-1">
              <button onClick={() => paginate(1)} disabled={currentPage === 1} className="btn-page">&lt;&lt;</button>
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="btn-page">&lt;</button>
              <span className="mx-2">{currentPage}</span>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="btn-page">&gt;</button>
              <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} className="btn-page">&gt;&gt;</button>
            </div>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="ml-4 p-1 border border-gray-300 rounded"
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}

        {/* Ticket Modal */}
        {showTicketPopup && (
          <div className="fixed inset-0 z-50 bg-black/55 flex justify-center items-center">
            <div className="rounded-lg w-[90%] max-w-4xl relative">
              <div className="bg-white rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto relative z-10">
                <TicketViewPage
                  ticketId={selectedTicketId}
                  popupMode={true}
                  onClose={() => setShowTicketPopup(false)}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PendingTicket;
