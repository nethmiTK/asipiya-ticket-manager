import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";
import ChatUI from "../../user_components/ChatUI/ChatUI";
import NotificationPanel from "../components/NotificationPanel";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const statusColors = {
  pending: "bg-orange-100 text-orange-800",
  open: "bg-yellow-100 text-yellow-800",
  "in progress": "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const truncateDescription = (text, maxLength = 80) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  let truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > -1) {
    truncated = truncated.substring(0, lastSpace);
  }
  return truncated + "...";
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  return date.toLocaleString();
};

const TicketView = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const modalRef = useRef(null);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const notificationRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // const filteredTickets = tickets.filter(ticket =>
  //   Object.values(ticket).some(value =>
  //     String(value).toLowerCase().includes(searchQuery.toLowerCase())
  //   )
  // );

  // States for custom dropdown visibility
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSystemDropdownOpen, setIsSystemDropdownOpen] = useState(false);

  // state variables for filter selections
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("");

  // state variables for unique filter options
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [uniqueSystems, setUniqueSystems] = useState([]);

  // useEffect to extract unique filter options whenever tickets data changes
  useEffect(() => {
    const statuses = new Set();
    const categories = new Set();
    const systems = new Set();

    tickets.forEach((ticket) => {
      if (ticket.status) statuses.add(ticket.status);
      if (ticket.category) categories.add(ticket.category);
      if (ticket.system_name) systems.add(ticket.system_name);
    });

    // Add empty string for "All" option and sort
    setUniqueStatuses(["", ...Array.from(statuses).sort()]);
    setUniqueCategories(["", ...Array.from(categories).sort()]);
    setUniqueSystems(["", ...Array.from(systems).sort()]);
  }, [tickets]);

  // only filters by ID and Description
  const filteredTickets = tickets.filter(
    (ticket) =>
      // String(ticket.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      // String(ticket.status).toLowerCase().includes(searchQuery.toLowerCase()) ||
      // String(ticket.category).toLowerCase().includes(searchQuery.toLowerCase()) ||
      // String(ticket.system_name).toLowerCase().(searchQuery.toLowerCase())
      String(ticket.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(ticket.description)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const finalFilteredTickets = filteredTickets.filter((ticket) => {
    if (selectedStatus && ticket.status !== selectedStatus) return false;
    if (selectedCategory && ticket.category !== selectedCategory) return false;
    if (selectedSystem && ticket.system_name !== selectedSystem) return false;
    return true;
  });

  const currentTickets = finalFilteredTickets.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(finalFilteredTickets.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Refs for custom dropdowns for click-outside detection
  const statusDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const systemDropdownRef = useRef(null);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setActiveTab("details");
    setIsModalOpen(true);
  };

  const handleViewTicket = (e, ticketId) => {
    e.stopPropagation();
    navigate(`/ticket/${ticketId}`);
  };

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

  // useEffect for closing custom dropdowns when clicked outside
  useEffect(() => {
    const handleStatusDropdownClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };
    const handleCategoryDropdownClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };
    const handleSystemDropdownClickOutside = (event) => {
      if (
        systemDropdownRef.current &&
        !systemDropdownRef.current.contains(event.target)
      ) {
        setIsSystemDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleStatusDropdownClickOutside);
    document.addEventListener("mousedown", handleCategoryDropdownClickOutside);
    document.addEventListener("mousedown", handleSystemDropdownClickOutside);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleStatusDropdownClickOutside
      );
      document.removeEventListener(
        "mousedown",
        handleCategoryDropdownClickOutside
      );
      document.removeEventListener(
        "mousedown",
        handleSystemDropdownClickOutside
      );
    };
  }, []);

  // useEffect for closing notification panel when clicked outside
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // useEffect for fetching unread notification count
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).UserID : null;

      if (!userId) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/notifications/count/${userId}`
        );
        setUnreadNotifications(response.data.count);
      } catch (error) {
        console.error("Error fetching unread notifications:", error);
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
      {/* <div
        className={`flex-1 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        } flex flex-col h-screen overflow-y-auto transition-all duration-300`}
      > */}
      <div
        className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300
          ml-0 
          lg:ml-20 ${isSidebarOpen ? 'lg:ml-72' : ''} 
        `}
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
                userId={JSON.parse(localStorage.getItem("user"))?.UserID}
                role={JSON.parse(localStorage.getItem("user"))?.Role}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          )}
          <h1 className="text-2xl font-bold mb-6 text-gray-800">My All Tickets</h1>
          {/* Filter Options Section */}
          <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Status Filter*/}
            <div
              className="flex flex-col flex-1 relative"
              ref={statusDropdownRef}
            >
              <label
                htmlFor="statusFilterCustom"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Status:
              </label>
              <button
                id="statusFilterCustom"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex justify-between items-center p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left cursor-pointer"
              >
                {selectedStatus || "All Statuses"}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isStatusDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {uniqueStatuses.map((statusOption) => (
                    <div
                      key={statusOption || "all-status"}
                      className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedStatus === statusOption
                        ? "bg-blue-100 font-semibold"
                        : ""
                        }`}
                      onClick={() => {
                        setSelectedStatus(statusOption);
                        setIsStatusDropdownOpen(false);
                        setCurrentPage(1); // Reset page on filter change
                      }}
                    >
                      {statusOption || "All Statuses"}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div
              className="flex flex-col flex-1 relative"
              ref={categoryDropdownRef}
            >
              <label
                htmlFor="categoryFilterCustom"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Category:
              </label>
              <button
                id="categoryFilterCustom"
                onClick={() =>
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                }
                className="flex justify-between items-center p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left cursor-pointer"
              >
                {selectedCategory || "All Categories"}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              {isCategoryDropdownOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {uniqueCategories.map((categoryOption) => (
                    <div
                      key={categoryOption || "all-category"} // Added unique key for "All" option
                      className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedCategory === categoryOption
                        ? "bg-blue-100 font-semibold"
                        : ""
                        }`}
                      onClick={() => {
                        setSelectedCategory(categoryOption);
                        setIsCategoryDropdownOpen(false);
                        setCurrentPage(1); // Reset page on filter change
                      }}
                    >
                      {categoryOption || "All Categories"}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System Filter */}
            <div
              className="flex flex-col flex-1 relative"
              ref={systemDropdownRef}
            >
              <label
                htmlFor="systemFilterCustom"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Filter by System:
              </label>
              <button
                id="systemFilterCustom"
                onClick={() => setIsSystemDropdownOpen(!isSystemDropdownOpen)}
                className="flex justify-between items-center p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left cursor-pointer"
              >
                {selectedSystem || "All Systems"}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isSystemDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              {isSystemDropdownOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {uniqueSystems.map((systemOption) => (
                    <div
                      key={systemOption || "all-system"} // Added unique key for "All" option
                      className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedSystem === systemOption
                        ? "bg-blue-100 font-semibold"
                        : ""
                        }`}
                      onClick={() => {
                        setSelectedSystem(systemOption);
                        setIsSystemDropdownOpen(false);
                        setCurrentPage(1); // Reset page on filter change
                      }}
                    >
                      {systemOption || "All Systems"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/*Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by ID or Description..."
              className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset page to 1 when search query changes
              }}
            />
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : tickets.length === 0 ? (
            <p>No tickets found.</p>
          ) : currentTickets.length === 0 && searchQuery !== "" ? (
            <p>No matching tickets found for "{searchQuery}".</p>
          ) : (
            <>
              {/* Mobile View - Card Layout */}
              <div className="block md:hidden space-y-4 mb-6">
                {currentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleTicketClick(ticket)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-gray-900 text-lg">#{ticket.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status?.toLowerCase()] || "bg-gray-200 text-gray-800"}`}>
                        {ticket.status}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                      {truncateDescription(ticket.description, 20)} 
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium text-gray-800">System:</span>
                        <br />
                        <span className="text-gray-600">{ticket.system_name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Category:</span>
                        <br />
                        <span className="text-gray-600">{ticket.category}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        {formatDateTime(ticket.datetime)}
                      </div>
                      <button
                        onClick={(e) => handleViewTicket(e, ticket.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table Layout */}
              <div className="hidden md:block overflow-x-auto rounded-lg shadow border border-gray-200 w-full mb-6">
                <table className="min-w-[768px] w-full text-sm text-left border-collapse table-auto">
                  <thead className="bg-gray-100 text-gray-700 uppercase">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">ID</th>
                      <th className="px-4 py-3 whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 whitespace-nowrap">Description</th>
                      <th className="px-4 py-3 whitespace-nowrap">System Name</th>
                      <th className="px-4 py-3 whitespace-nowrap">Category</th>
                      <th className="px-4 py-3 whitespace-nowrap">Date & Time</th>
                      <th className="px-4 py-3 rounded-tr-lg text-center whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => handleTicketClick(ticket)}
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
                        {/* Description cell */}
                        <td
                          className="px-4 py-2 text-justify whitespace-normal overflow-hidden break-words"
                          style={{
                            maxHeight: "3.6em",
                            lineHeight: "1.2em",
                          }}
                        >
                          {truncateDescription(ticket.description, 80)}
                        </td>

                        <td className="px-4 py-2 whitespace-nowrap">{ticket.system_name}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{ticket.category}</td>
                        <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                          {formatDateTime(ticket.datetime)}
                        </td>

                        {/* Action Column */}
                        <td className="px-4 py-2 flex justify-center items-center h-full">
                          <button
                            onClick={(e) => handleViewTicket(e, ticket.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                          >
                            <FaEye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        {/* Pagination Controls at the bottom */}
        {finalFilteredTickets.length > 0 && ( // Changed from filteredTickets.length
                              <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center mt-4 p-4 bg-white rounded-lg shadow flex-wrap gap-4">
            <div className="flex items-center flex-wrap gap-2 sm:space-x-4">
              <div className="flex items-center">
                <span className="text-gray-700 text-sm mr-2">
                  Entries per page :
                </span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <span className="text-gray-700 text-sm">
                {` ${indexOfFirstItem + 1}-${Math.min(
                  indexOfLastItem,
                  finalFilteredTickets.length
                )} of ${finalFilteredTickets.length}`}
              </span>
              <div className="flex items-center flex-wrap gap-1 sm:space-x-2">
                <button
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                >
                  &lt;&lt;
                </button>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                >
                  &lt;
                </button>
                <span className="text-gray-700 text-sm font-medium">
                  {currentPage}
                </span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                >
                  &gt;
                </button>
                <button
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketView;
