import React, { useEffect, useState, useRef, useCallback } from "react";
import axiosClient from "../axiosClient"; // Changed from axios to axiosClient
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import TicketTable from "./components/TicketTable";
import SearchBar from "./components/SearchBar";
import Pagination from "./components/Pagination";
import AdminNavBar from "../../user_components/NavBar/AdminNavBar";
import { useAuth } from "../../App";
import NotificationPanel from "../components/NotificationPanel";

const Tickets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const ticketId = searchParams.get("id");
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const { loggedInUser: user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const notificationRef = useRef(null);

  // --- Notification Handling (reused from AddSupervisor) ---
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

  const fetchUnreadNotifications = useCallback(async () => {
    if (!user?.UserID) return;
    try {
      // Use axiosClient for GET request
      const response = await axiosClient.get(`/api/notifications/count/${user.UserID}`);
      setUnreadNotifications(response.data.count);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  }, [user?.UserID]);

  useEffect(() => {
    if (user?.UserID) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadNotifications]);

  const handleNotificationPanelUpdate = useCallback(() => {
    fetchUnreadNotifications();
  }, [fetchUnreadNotifications]);
  // --- End Notification Handling ---

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        let url = '/api/tickets/filter'; // Use relative path with axiosClient
        const params = new URLSearchParams();

        if (type) {
          params.append('type', type);
        }
        if (selectedSystem) {
          params.append('system', selectedSystem.value);
        }
        if (selectedCompany) {
          params.append('company', selectedCompany.value);
        }

        const queryString = params.toString();
        const finalUrl = queryString ? `${url}?${queryString}` : url;

        // Use axiosClient for GET request
        const response = await axiosClient.get(finalUrl);

        let fetchedTickets = response.data;
        if (type === 'resolved') {
          fetchedTickets = response.data.filter(ticket => ticket.Status?.toLowerCase() === 'resolved');
        }

        setTickets(fetchedTickets);
        const initialFiltered = fetchedTickets.filter(ticket => {
          const searchString = searchTerm.toLowerCase();
          return (
            ticket.TicketID?.toString().includes(searchString) ||
            (ticket.Description || "").toLowerCase().includes(searchString) ||
            (ticket.SystemName || "").toLowerCase().includes(searchString) ||
            (ticket.CompanyName || "").toLowerCase().includes(searchString)
          );
        });
        setFilteredTickets(initialFiltered);

      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [type, selectedSystem, selectedCompany, searchTerm]);

  useEffect(() => {
    const filtered = tickets.filter(ticket => {
      const searchString = searchTerm.toLowerCase();
      return (
        ticket.TicketID?.toString().includes(searchString) ||
        (ticket.Description || "").toLowerCase().includes(searchString) ||
        (ticket.SystemName || "").toLowerCase().includes(searchString) ||
        (ticket.CompanyName || "").toLowerCase().includes(searchString)
      );
    });
    setFilteredTickets(filtered);
    setCurrentPage(1);
  }, [searchTerm, tickets]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "text-blue-500";
      case "in progress":
        return "text-yellow-500";
      case "resolved":
        return "text-green-500";
      case "reject":
        return "text-purple-500";
      case "accept":
        return "text-blue-500";
      case "closed":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const calculateDuration = (dateTime) => {
    const ticketTime = new Date(dateTime);
    const currentTime = new Date();
    const duration = Math.abs(currentTime - ticketTime);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleSystemFilterChange = (selected) => {
    setSelectedSystem(selected);
    setCurrentPage(1);
  };

  const handleCompanyFilterChange = (selected) => {
    setSelectedCompany(selected);
    setCurrentPage(1);
  };

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const showingFrom = filteredTickets.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, filteredTickets.length);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <AdminNavBar
        pageTitle="Tickets Overview"
        user={user}
        sidebarOpen={isSidebarOpen}
        onProfileClick={() => navigate('/admin-profile')}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        unreadNotifications={unreadNotifications}
        showNotifications={showNotifications}
        notificationRef={notificationRef}
      />

      <main
        className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {showNotifications && (
            <div ref={notificationRef} className="absolute right-4 top-14 z-50">
              <NotificationPanel
                userId={user?.UserID}
                role={user?.Role}
                onClose={() => setShowNotifications(false)}
                onNotificationUpdate={handleNotificationPanelUpdate}
              />
            </div>
          )}

          <header className="mb-6">
            <h1 className="text-2xl font-bold mb-8"></h1>
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => navigate('/tickets')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  !type ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                All Tickets
              </button>
              <button
                onClick={() => navigate('/tickets?type=open')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  type === 'open' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Open Tickets
              </button>
              <button
                onClick={() => navigate('/tickets?type=today')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  type === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Today's Tickets
              </button>
              <button
                onClick={() => navigate('/tickets?type=pending')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  type === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Pending Tickets
              </button>
              <button
                onClick={() => navigate('/tickets?type=high')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  type === 'high' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                High Priority
              </button>
              <button
                onClick={() => navigate('/tickets?type=resolved')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  type === 'resolved' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Resolved Tickets
              </button>
            </div>

            <div className="mb-6">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by ID, description, system, or company..."
                selectedSystem={selectedSystem}
                selectedCompany={selectedCompany}
                onSystemFilterChange={handleSystemFilterChange}
                onCompanyFilterChange={handleCompanyFilterChange}
              />
            </div>
          </header>

          {filteredTickets.length === 0 && !loading ? (
            <p className="text-center text-gray-600 mt-8">No tickets found matching your criteria.</p>
          ) : (
            <TicketTable
              tickets={paginatedTickets}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              calculateDuration={calculateDuration}
            />
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredTickets.length}
            showingFrom={showingFrom}
            showingTo={showingTo}
          />
        </div>
      </main>
    </div>
  );
};

export default Tickets;