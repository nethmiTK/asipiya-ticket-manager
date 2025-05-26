import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddSupervisor() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleAddClick = () => {
    navigate("/add-member");
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Members</h1>
          <button
            onClick={handleAddClick}
            className="mt-2 sm:mt-0 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
          >
            + Add Member
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow text-sm sm:text-base">
            <thead className="bg-blue-100 text-gray-700">
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
                    <td className="p-3">
                      <input
                        type="text"
                        value={user.name}
                        readOnly
                        className="bg-transparent w-full outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={user.email}
                        readOnly
                        className="bg-transparent w-full outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={user.role}
                        readOnly
                        className="bg-transparent w-full outline-none"
                      />
                    </td>
                    <td className="p-3 flex gap-2">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow">
                        Edit
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow">
                        Delete
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
