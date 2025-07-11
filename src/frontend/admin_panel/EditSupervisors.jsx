import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import { toast } from "react-toastify";
import { IoArrowBack, IoClose } from "react-icons/io5";
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import AdminNavBar from '../../user_components/NavBar/AdminNavBar';
import NotificationPanel from '../components/NotificationPanel';
import { useAuth } from '../../App.jsx';

const EditSupervisors = ({ ticketId, popupMode = false, onClose }) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const id = popupMode ? ticketId : routeId;
  const { loggedInUser: user } = useAuth();

  const [ticketData, setTicketData] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef();

  // Navbar & Notifications
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const notificationRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketRes = await axiosClient.get(`/api/ticket_view/${id}`);
        setTicketData(ticketRes.data);
        setSelectedSupervisors((ticketRes.data.supervisor_id || []).map((id) => String(id)));

        const supervisorRes = await axiosClient.get(`/api/supervisors`);
        setSupervisors(supervisorRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load ticket or supervisor data");
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Notification click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread notifications count
  const fetchUnreadNotifications = useCallback(async () => {
    if (!user?.UserID) return;
    try {
      const res = await axiosClient.get(`/api/notifications/count/${user.UserID}`);
      setUnreadNotifications(res.data.count);
    } catch (error) {
      console.error("Error fetching unread notifications", error);
    }
  }, [user?.UserID]);

  useEffect(() => {
    if (user?.UserID) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadNotifications]);

  const handleNotificationPanelUpdate = () => {
    fetchUnreadNotifications();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "text-blue-500";
      case "in progress":
        return "text-yellow-500";
      case "closed":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      case "pending":
        return "text-orange-500";
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

  const handleSave = async () => {
    if (selectedSupervisors.length === 0) {
      toast.error("At least one supervisor must be assigned to the ticket.");
      return;
    }
    try {
      await axiosClient.put(`/api/update-supervisors/${id}`, {
        supervisorIds: selectedSupervisors.map((id) => parseInt(id)),
        currentUserId: user?.UserID,
      });
      toast.success("Supervisors updated successfully");
      navigate(-1);
    } catch (error) {
      console.error("Error updating supervisors:", error);
      toast.error("Failed to update supervisors");
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <AdminNavBar
        pageTitle="Edit Supervisors"
        user={user}
        sidebarOpen={isSidebarOpen}
        onProfileClick={() => navigate('/admin-profile')}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        unreadNotifications={unreadNotifications}
        showNotifications={showNotifications}
        notificationRef={notificationRef}
      />

      <div className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}>
        {showNotifications && (
          <div ref={notificationRef} className="absolute right-4 top-16 z-50">
            <NotificationPanel
              userId={user?.UserID}
              role={user?.Role}
              onClose={() => setShowNotifications(false)}
              onNotificationUpdate={handleNotificationPanelUpdate}
            />
          </div>
        )}

        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto relative mt-20">
          <button
            onClick={() => (popupMode ? onClose() : navigate(-1))}
            className="flex items-center text-gray-600 hover:text-gray-900 p-2 rounded-sm font-bold"
          >
            <IoArrowBack className="mr-2" /> Back
          </button>
          <h2 className="text-2xl font-semibold text-center mb-8">Edit Supervisors</h2>

          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Ticket ID</label>
                <div className="bg-gray-50 rounded-lg p-2 text-gray-800">#{ticketData.TicketID}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">User Name</label>
                <div className="bg-gray-50 rounded-lg p-2 text-gray-800">{ticketData.UserName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <div
                  className={`bg-gray-50 rounded-lg p-2 font-semibold ${getStatusColor(ticketData.Status)}`}
                >
                  {ticketData.Status}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                <div
                  className={`bg-gray-50 rounded-lg p-2 font-semibold ${getPriorityColor(ticketData.Priority)}`}
                >
                  {ticketData.Priority}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <div className="bg-gray-50 rounded-lg p-2 text-gray-800 text-justify relative">
                  <p
                    className="overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {ticketData.Description}
                  </p>
                  <button
                    className="text-blue-600 cursor-pointer text-xs mt-1"
                    onClick={() => setShowDescModal(true)}
                  >
                    Read more
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
                <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                  {new Date(ticketData.DateTime).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Supervisor Dropdown */}
            <div ref={dropdownRef} className="relative">
              <label className="block font-medium mb-2">Supervisor Name(s)</label>
              <div
                onClick={() => setOpenDropdown(!openDropdown)}
                className="w-full px-4 py-2 border border-gray-300 rounded cursor-pointer bg-white"
              >
                {selectedSupervisors.length > 0
                  ? supervisors.filter((u) => selectedSupervisors.includes(String(u.UserID))).map((u) => u.FullName).join(", ")
                  : "Select supervisors"}
              </div>

              {openDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-y-auto">
                  {supervisors.map((user) => {
                    const userIdStr = String(user.UserID);
                    return (
                      <label key={user.UserID} className="flex items-center px-4 py-2 hover:bg-gray-100">
                        <input
                          type="checkbox"
                          value={userIdStr}
                          checked={selectedSupervisors.includes(userIdStr)}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (e.target.checked) {
                              setSelectedSupervisors((prev) => [...new Set([...prev, value])]);
                            } else {
                              if (selectedSupervisors.length === 1) {
                                if (!toast.isActive("last-supervisor-warning")) {
                                  toast.warning("At least one supervisor must be assigned.", {
                                    toastId: "last-supervisor-warning"
                                  });
                                }
                                return;
                              }
                              setSelectedSupervisors((prev) => prev.filter((id) => id !== value));
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-blue-600 mr-2"
                        />
                        {user.FullName}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Full Description Modal */}
          {showDescModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
              onClick={() => setShowDescModal(false)}
            >
              <div
                className="bg-white rounded-lg p-6 max-w-[80vh] max-h-[70vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-2 right-2 text-gray-600 hover:text-black"
                  onClick={() => setShowDescModal(false)}
                >
                  <IoClose size={24} />
                </button>
                <p className="whitespace-pre-wrap text-gray-800">{ticketData.Description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditSupervisors;
