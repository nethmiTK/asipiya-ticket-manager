import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Using axios for all API calls for consistency
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { GrUserAdd } from "react-icons/gr";
import AddMemberModal from "./AddMember"; // Assuming these modal components exist and are functional
import EditMemberModal from "./EditMember"; // Assuming these modal components exist and are functional
import { FaEdit, FaTrash } from "react-icons/fa";
import AdminNavBar from "../../user_components/NavBar/AdminNavBar";
import { useAuth } from "../../App";
import NotificationPanel from "../components/NotificationPanel";

export default function AddSupervisor() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const { loggedInUser: user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const notificationRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [error, setError] = useState(null); // New error state

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  // --- Notification Handling ---
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
      // Optionally set an error state here for notifications
    }
  }, [user?.UserID]);

  useEffect(() => {
    if (user?.UserID) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadNotifications]);

  // Function to handle updates from NotificationPanel (e.g., notification marked as read)
  const handleNotificationPanelUpdate = () => {
    fetchUnreadNotifications(); // Re-fetch the actual count to ensure consistency
  };

  // --- User Management Logic ---
  const fetchSupervisors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/supervisor");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load members. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    fetchSupervisors();
  }, [fetchSupervisors]); // Re-run when fetchSupervisors callback changes (which it won't due to useCallback)

  const handleProfileClick = () => {
    navigate('/admin-profile');
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleAddClick = () => setShowAddModal(true);

  const roleColors = {
    Supervisor: "bg-purple-100 text-purple-800",
    Developer: "bg-blue-100 text-blue-800",
    Manager: "bg-green-100 text-green-800",
    Admin: "bg-yellow-100 text-orange-800", // Changed text color for better contrast
    // Add other roles if needed
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setIsLoading(true); // Indicate deletion is in progress
    setError(null);
    try {
      const res = await axios.delete(
        `http://localhost:5000/supervisor/${selectedUser.UserID}`
      );
      if (res.status === 200) { // Axios uses status, not res.ok
        setUsers(users.filter((u) => u.UserID !== selectedUser.UserID));
        alert("Member deleted successfully!"); // Simple success feedback
      } else {
        alert("Failed to delete member."); // Generic error message
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete member. Server error."); // More specific error feedback
    } finally {
      setShowDeleteModal(false);
      setSelectedUser(null);
      setIsLoading(false); // End loading
    }
  };

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <AdminNavBar
        pageTitle="Manage Members" 
        user={user}
        sidebarOpen={isSidebarOpen}
        onProfileClick={handleProfileClick}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        unreadNotifications={unreadNotifications}
        showNotifications={showNotifications}
        notificationRef={notificationRef}
      />
      <div
        className={`flex-1 min-h-screen bg-gray-50 p-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        <div><h1 className="text-2xl font-bold mb-8"></h1></div>
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
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

          <div className="flex flex-wrap justify-between items-center mb-6">
            <h1 className="text-1xl sm:text-3xl font-bold text-gray-800">
              👥 Members
            </h1>
            <button
              data-tooltip-id="tooltip"
              data-tooltip-content="Add New Member"
              onClick={handleAddClick}
              className="mt-2 sm:mt-0 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 flex items-center gap-2"
            >
              <GrUserAdd className="inline-block" />
            </button>
          </div>

          {/* Loading and Error Feedback */}
          {isLoading ? (
            <p className="text-center text-gray-600 py-8">Loading members...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-8">{error}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow text-sm sm:text-base">
                  <thead className="bg-gray-100 text-gray-700 font-normal">
                    <tr>
                      <th className="p-3 text-center">Name</th>
                      <th className="text-center p-3">Email</th>
                      <th className="text-center p-3">Role</th>
                      <th className="text-center p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <tr
                          key={user.UserID}
                          className="border-b border-gray-100 hover:bg-gray-50 transition"
                        >
                          <td className="p-3 text-gray-500 text-center text-sm">
                            {user.FullName}
                          </td>
                          <td className="p-3 text-gray-500 text-center text-sm">
                            {user.Email}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${
                                roleColors[user.Role] || "bg-gray-300 text-gray-500"
                              }`}
                            >
                              {user.Role}
                            </span>
                          </td>
                          <td className="p-3 flex justify-center gap-2">
                            <button
                              data-tooltip-id="tooltip"
                              data-tooltip-content="Edit Member"
                              onClick={() => {
                                setEditUserId(user.UserID);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FaEdit size={18} />
                            </button>

                            <button
                              data-tooltip-id="tooltip"
                              data-tooltip-content="Delete Member"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center text-gray-500 italic py-4"
                        >
                          No members available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {users.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center mb-3 sm:mb-0">
                    <label htmlFor="items-per-page" className="text-sm text-gray-700 mr-2">Entries per page:</label>
                    <select
                      id="items-per-page"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {[5, 10, 20, 50].map((num) => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                      Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, users.length)}</strong> of <strong>{users.length}</strong> entries
                    </span>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => paginate(1)} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-gray-200 text-sm text-gray-700 hover:bg-gray-300 disabled:opacity-50" aria-label="First Page">&lt;&lt;</button>
                      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-gray-200 text-sm text-gray-700 hover:bg-gray-300 disabled:opacity-50" aria-label="Previous Page">&lt;</button>
                      <span className="px-2 text-sm font-semibold text-gray-700">Page {currentPage} of {totalPages}</span>
                      <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md bg-gray-200 text-sm text-gray-700 hover:bg-gray-300 disabled:opacity-50" aria-label="Next Page">&gt;</button>
                      <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md bg-gray-200 text-sm text-gray-700 hover:bg-gray-300 disabled:opacity-50" aria-label="Last Page">&gt;&gt;</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Tooltip id="tooltip" place="top" />

      {showEditModal && (
        <EditMemberModal
          memberId={editUserId}
          onClose={() => {
            setShowEditModal(false);
            setEditUserId(null);
          }}
          onUpdate={fetchSupervisors} 
        />
      )}

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchSupervisors} 
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedUser?.FullName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}