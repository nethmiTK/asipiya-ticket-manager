import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { IoArrowBack, IoClose } from "react-icons/io5";
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import { useAuth } from '../../App.jsx';

const EditSupervisors = ({ ticketId, popupMode = false, onClose }) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const id = popupMode ? ticketId : routeId;
  const { loggedInUser: user } = useAuth(); // Add useAuth hook to get current user

  const [ticketData, setTicketData] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketRes = await axios.get(
          `http://localhost:5000/api/ticket_view/${id}`
        );
        setTicketData(ticketRes.data);
        setSelectedSupervisors(
          (ticketRes.data.supervisor_id || []).map((id) => String(id))
        );

        const supervisorRes = await axios.get(
          `http://localhost:5000/api/supervisors`
        );
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      await axios.put(`http://localhost:5000/update-supervisors/${id}`, {
        supervisorIds: selectedSupervisors.map((id) => parseInt(id)),
        currentUserId: user?.UserID, // Add current user ID to the request
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl w-full relative">
        <button
          onClick={() => (popupMode ? onClose() : navigate(-1))}
          className="flex items-center text-gray-600 hover:text-gray-900 p-2 rounded-sm font-bold"
        >
          <IoArrowBack className="mr-2" /> Back
        </button>
        <h2 className="text-2xl font-semibold text-center mb-8">
                Edit Supervisors
            </h2>

            <div className="space-y-6">
                {[
                ["System Name", ticketData.SystemName],
                ["User Email", ticketData.UserEmail],
                ["Status", ticketData.Status],
                ["Priority", ticketData.Priority],
                ["Description", ticketData.Description],
                ["Date & Time", new Date(ticketData.DateTime).toLocaleString()],
                ].map(([label, value]) => (
                <div key={label} className="flex">
                    <label className="w-1/3 font-medium">{label}</label>
                    <div
                    className={`w-2/3 bg-gray-100 p-2 rounded ${
                        label === "Status"
                        ? getStatusColor(value)
                        : label === "Priority"
                        ? getPriorityColor(value)
                        : ""
                    }`}
                    >
                    {value}
                    </div>
                </div>
                ))}

                {/* Supervisor dropdown */}
                <div ref={dropdownRef} className="relative">
                <label className="block font-medium mb-2">Supervisor Name(s)</label>
                <div
                    onClick={() => setOpenDropdown(!openDropdown)}
                    className="w-full px-4 py-2 border border-gray-300 rounded cursor-pointer bg-white"
                >
                    {selectedSupervisors.length > 0
                    ? supervisors
                        .filter((u) => selectedSupervisors.includes(String(u.UserID)))
                        .map((u) => u.FullName)
                        .join(", ")
                    : "Select supervisors"}
                </div>

                {openDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-y-auto">
                    {supervisors.map((user) => {
                        const userIdStr = String(user.UserID);
                        return (
                        <label
                            key={user.UserID}
                            className="flex items-center px-4 py-2 hover:bg-gray-100"
                        >
                            <input
                            type="checkbox"
                            value={userIdStr}
                            checked={selectedSupervisors.includes(userIdStr)}
                            onChange={(e) => {
                                const value = e.target.value;

                                if (e.target.checked) {
                                setSelectedSupervisors((prev) => [
                                    ...new Set([...prev, value]),
                                ]);
                                } else {
                                if (selectedSupervisors.length === 1) {
                                    if (!toast.isActive("last-supervisor-warning")) {
                                    toast.warning(
                                        "At least one supervisor must be assigned.",
                                        { toastId: "last-supervisor-warning" }
                                    );
                                    }
                                    return; 
                                }
                                setSelectedSupervisors((prev) =>
                                    prev.filter((id) => id !== value)
                                );
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

      
      </div>
    </div>
  );
};

export default EditSupervisors;
