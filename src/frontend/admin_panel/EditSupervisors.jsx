import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import { toast } from "react-toastify";
import { IoArrowBack, IoClose } from "react-icons/io5";
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import AdminNavBar from "../../user_components/NavBar/AdminNavBar";
import NotificationPanel from "../components/NotificationPanel";
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
  const [showDescModal, setShowDescModal] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch ticket and supervisors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketRes = await axiosClient.get(`/api/ticket_view/${id}`);
        setTicketData(ticketRes.data);
        setSelectedSupervisors((ticketRes.data.supervisor_id || []).map(id => String(id)));

        const supervisorRes = await axiosClient.get(`/api/supervisors`);
        setSupervisors(supervisorRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load ticket or supervisor data");
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Fetch unread notification count
  const fetchUnreadNotifications = useCallback(async () => {
    if (!user?.UserID) return;
    try {
      const res = await axiosClient.get(`/api/notifications/count/${user.UserID}`);
      setUnreadNotifications(res.data.count);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [user?.UserID]);

  useEffect(() => {
    if (user?.UserID) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadNotifications]);

  // Handle outside click for dropdown and notification
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (selectedSupervisors.length === 0) {
      toast.error("At least one supervisor must be assigned.");
      return;
    }
    try {
      await axiosClient.put(`/update-supervisors/${id}`, {
        supervisorIds: selectedSupervisors.map(id => parseInt(id)),
        currentUserId: user?.UserID,
      });
      toast.success("Supervisors updated successfully");
      navigate(-1);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to update supervisors");
    }
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      {/* Top Navbar */}
      <AdminNavBar
        pageTitle="Edit Supervisors"
        user={user}
        sidebarOpen={isSidebarOpen}
        onProfileClick={() => navigate("/admin-profile")}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        unreadNotifications={unreadNotifications}
        showNotifications={showNotifications}
        notificationRef={notificationRef}
      />

      {/* Main Content */}
      <main className={`flex-1 min-h-screen bg-gray-100 pt-16 px-6 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}>
        {/* Notification Panel */}
        {showNotifications && (
          <div ref={notificationRef} className="absolute right-6 top-16 z-50">
            <NotificationPanel
              userId={user?.UserID}
              role={user?.Role}
              onClose={() => setShowNotifications(false)}
              onNotificationUpdate={fetchUnreadNotifications}
            />
          </div>
        )}

        {/* Ticket Info */}
        <div className="bg-white p-6 rounded-xl shadow space-y-6 max-w-4xl mx-auto mt-16">
          {/* Back Button */}
            <button
              onClick={() => (popupMode ? onClose() : navigate(-1))}
              className="flex items-center text-gray-600 hover:text-black font-medium mb-4"
            >
              <IoArrowBack className="mr-2" /> Back
            </button>

            {/* Page Title */}
            <h2 className="text-2xl font-bold mb-6 text-center">Edit Supervisors</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Ticket ID</label>
              <div className="bg-gray-50 p-2 rounded">{ticketData.TicketID}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">User Name</label>
              <div className="bg-gray-50 p-2 rounded">{ticketData.UserName}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="bg-gray-50 p-2 rounded">{ticketData.Status}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Priority</label>
              <div className="bg-gray-50 p-2 rounded">{ticketData.Priority}</div>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600">Description</label>
              <div className="bg-gray-50 p-2 rounded relative">
                <p
                  className="overflow-hidden text-justify"
                  style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
                >
                  {ticketData.Description}
                </p>
                <button onClick={() => setShowDescModal(true)} className="text-blue-500 text-xs mt-1">Read more</button>
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600">Created At</label>
              <div className="bg-gray-50 p-2 rounded">
                {new Date(ticketData.DateTime).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Supervisor Dropdown */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium mb-2">Supervisor Name(s)</label>
            <div
              onClick={() => setOpenDropdown(!openDropdown)}
              className="w-full px-4 py-2 border border-gray-300 rounded bg-white cursor-pointer"
            >
              {selectedSupervisors.length > 0
                ? supervisors
                    .filter(u => selectedSupervisors.includes(String(u.UserID)))
                    .map(u => u.FullName)
                    .join(", ")
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
                                toast.warning("At least one supervisor must be assigned.", { toastId: "last-supervisor-warning" });
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

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Description Modal */}
        {showDescModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDescModal(false)}>
            <div className="bg-white rounded-lg p-6 max-w-[80vh] max-h-[70vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-2 right-2 text-gray-600 hover:text-black" onClick={() => setShowDescModal(false)}>
                <IoClose size={24} />
              </button>
              <p className="whitespace-pre-wrap text-gray-800">{ticketData.Description}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EditSupervisors;
