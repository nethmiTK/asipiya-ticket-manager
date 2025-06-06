import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";

export default function AddSupervisor() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleAddClick = () => {
    navigate("/add-member");
  };

  useEffect(() => {
    fetch("http://localhost:5000/supervisor")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  // Role-based color map
  const roleColors = {
    Supervisor: "bg-purple-100 text-purple-800",
    Developer: "bg-blue-100 text-blue-800",
    Manager: "bg-green-100 text-green-800",
    Admin: "bg-yellow-100 text-green-800",
  };

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div
        className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                👥 Members
              </h1>
              <button
                onClick={handleAddClick}
                className="mt-2 sm:mt-0 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
              >
                ➕ Add Member
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow text-sm sm:text-base">
                <thead className="bg-blue-100 text-gray-700 font-semibold">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Role</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr
                        key={user.UserID}
                        className="border-b hover:bg-blue-50 transition"
                      >
                        <td className="p-3 text-gray-800 font-medium">
                          {user.FullName}
                        </td>
                        <td className="p-3 text-gray-700">{user.Email}</td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              roleColors[user.Role] ||
                              "bg-gray-300 text-gray-900"
                            }`}
                          >
                            {user.Role}
                          </span>
                        </td>
                        <td className="p-3 flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/edit-supervisor/${user.UserID}`)
                            }
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow-md font-medium transition duration-150"
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={async () => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete ${user.FullName}?`
                                )
                              ) {
                                try {
                                  const res = await fetch(
                                    `http://localhost:5000/supervisor/${user.UserID}`,
                                    {
                                      method: "DELETE",
                                    }
                                  );
                                  if (res.ok) {
                                    // ✅ Correctly filter by UserID
                                    setUsers(
                                      users.filter(
                                        (u) => u.UserID !== user.UserID
                                      )
                                    );
                                  } else {
                                    alert("Failed to delete");
                                  }
                                } catch (err) {
                                  console.error("Error deleting user:", err);
                                  alert("Server error. Try again.");
                                }
                              }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-md font-medium transition duration-150"
                          >
                            🗑️ Delete
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
      </div>
    </div>
  );
}
