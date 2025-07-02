import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import TicketTable from "./components/TicketTable";
import SearchBar from "./components/SearchBar";
import Pagination from "./components/Pagination";
import AdminNavBar from "../../user_components/NavBar/AdminNavBar"; // Import AdminNavBar
import { useAuth } from "../../App"; // Import useAuth for user context
import NotificationPanel from "../components/NotificationPanel"; // Import NotificationPanel

const Tickets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const ticketId = searchParams.get("id"); // Although ticketId isn't currently used in fetchTickets
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // States for AdminNavBar and Notifications
  const { loggedInUser: user } = useAuth(); // Get logged-in user from context
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
      const response = await axios.get(`http://localhost:5000/api/notifications/count/${user.UserID}`);
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
    // Re-fetch the actual count from the backend to ensure consistency
    fetchUnreadNotifications();
  }, [fetchUnreadNotifications]);
  // --- End Notification Handling ---

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true); // Start loading
      try {
        let url = 'http://localhost:5000/api/tickets/filter';
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

        const response = await axios.get(finalUrl);

        let fetchedTickets = response.data;
        // The backend filter should ideally handle 'resolved' type.
        // If it doesn't, this client-side filter will ensure correctness.
        if (type === 'resolved') {
          fetchedTickets = response.data.filter(ticket => ticket.Status?.toLowerCase() === 'resolved');
        }

        setTickets(fetchedTickets);
        // Apply initial search term filter immediately after fetching
        // This ensures that when new data arrives, the existing search term is applied.
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
        // Optionally set an error message for the user
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchTickets();
  }, [type, selectedSystem, selectedCompany, searchTerm]); // Added searchTerm here so that if the type/system/company changes, and there's a searchTerm already, it gets re-applied.

  useEffect(() => {
    // This effect now primarily handles changes to `searchTerm` or `tickets` *after* the initial fetch.
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
    setCurrentPage(1); // Reset to first page whenever filters change
  }, [searchTerm, tickets]); // Depend on `tickets` and `searchTerm`

  // Helper functions for styling and duration (no changes needed)
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

  // Pagination slicing (no changes needed)
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const showingFrom = filteredTickets.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, filteredTickets.length);

  // Loading state render
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Admin Side Bar */}
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      {/* Admin Nav Bar */}
      <AdminNavBar
        pageTitle="Tickets Overview" // Set a relevant page title
        user={user}
        sidebarOpen={isSidebarOpen}
        // Assuming you might want a profile click handler in the future
        onProfileClick={() => navigate('/admin-profile')}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        unreadNotifications={unreadNotifications}
        showNotifications={showNotifications}
        notificationRef={notificationRef}
      />

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-24" // Adjust margin based on sidebar state
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Notification Panel (conditionally rendered) */}
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
              {/* Filter Buttons */}
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

            {/* Search and Filters */}
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

          {/* Ticket Table */}
          {filteredTickets.length === 0 && !loading ? (
            <p className="text-center text-gray-600 mt-8">No tickets found matching your criteria.</p>
          ) : (
            <TicketTable
              tickets={paginatedTickets}
              // Pass helper functions to TicketTable if it uses them for display
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              calculateDuration={calculateDuration}
              // These props below might be redundant if TicketTable determines visibility itself
              // showStatus={type !== 'pending' && type !== 'resolved'}
              // showPriority={type !== 'pending'}
            />
          )}


          {/* Pagination */}
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