import { useState } from "react";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";

export default function AddMemberModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    role: "Developer",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Invitation sent successfully!");
        onSuccess(); // Call parent to refresh list
      } else {
        toast.error(data.message || "Failed to send invite");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Server error, try again");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-700 text-xl"
        >
          <FaTimes size={20} />
        </button>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Invite New Member
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
              className="w-full px-4 py-2 border-2 border-gray-400 text-gray-700 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-400 text-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="Developer">Developer</option>
              <option value="Manager">Manager</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl hover:from-blue-600 hover:to-blue-800 shadow-lg transition duration-200"
          >
            Invite Member
          </button>
        </form>
      </div>
    </div>
  );
}
