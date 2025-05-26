import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AddSupervisor() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const dummyUsers = [
      { id: 1, name: "John Doe", email: "john@example.com", role: "Supervisor" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Developer" },
      { id: 3, name: "Alice Johnson", email: "alice@example.com", role: "Manager" },
    ];

    setTimeout(() => {
      setUsers(dummyUsers);
    }, 500);
  }, []);

  const handleAddClick = () => {
    navigate("/add-member");
  };

  // Role-based color map
  const roleColors = {
    Supervisor: "bg-purple-100 text-purple-800",
    Developer: "bg-blue-100 text-blue-800",
    Manager: "bg-green-100 text-green-800",
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">👥 Members</h1>
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
                  <tr key={user.id} className="border-b hover:bg-blue-50 transition">
                    <td className="p-3 text-gray-800 font-medium">{user.name}</td>
                    <td className="p-3 text-gray-700">{user.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role] || "bg-gray-100 text-gray-800"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow-md font-medium transition duration-150">
                        ✏️ Edit
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-md font-medium transition duration-150">
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 italic py-4">
                    No users available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
