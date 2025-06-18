import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { GrUserAdd } from "react-icons/gr";
import AddMemberModal from "./AddMember";
import EditMemberModal from "./EditMember";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function AddSupervisor() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const handleAddClick = () => setShowAddModal(true);

  useEffect(() => {
    fetch("http://localhost:5000/supervisor")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const roleColors = {
    Supervisor: "bg-purple-100 text-purple-800",
    Developer: "bg-blue-100 text-blue-800",
    Manager: "bg-green-100 text-green-800",
    Admin: "bg-yellow-100 text-green-800",
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(
        `http://localhost:5000/supervisor/${selectedUser.UserID}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setUsers(users.filter((u) => u.UserID !== selectedUser.UserID));
      } else {
        alert("Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Server error. Try again.");
    } finally {
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div
        className={`flex-1 min-h-screen bg-gray-50 p-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h1 className="text-1xl sm:text-3xl font-bold text-gray-800">
              👥 Members
            </h1>
            <button
              data-tooltip-id="tooltip"
              data-tooltip-content="Add Member"
              onClick={handleAddClick}
              className="mt-2 sm:mt-0 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
            >
              <GrUserAdd />
            </button>
          </div>

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
                {users.length > 0 ? (
                  users.map((user) => (
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
                          className="text-blue-600 hover:text-blue-800 mr-4"
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
                          className="text-red-600 hover:text-red-800 "
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
                      No users available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <Tooltip id="tooltip" place="top" />

      {showEditModal && (
        <EditMemberModal
          memberId={editUserId}
          onClose={() => {
            setShowEditModal(false);
            setEditUserId(null);
          }}
          onUpdate={() => {
            setShowEditModal(false);
            setEditUserId(null);
            // Refresh members
            fetch("http://localhost:5000/supervisor")
              .then((res) => res.json())
              .then((data) => setUsers(data));
          }}
        />
      )}

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            // Refresh users after successful addition
            fetch("http://localhost:5000/supervisor")
              .then((res) => res.json())
              .then((data) => setUsers(data));
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{selectedUser?.FullName}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
