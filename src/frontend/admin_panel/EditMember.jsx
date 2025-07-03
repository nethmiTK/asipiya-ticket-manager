import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosClient from "../axiosClient"; // <--- Added this import. Adjust path if necessary.

export default function EditMemberModal({ memberId, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Developer",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replaced fetch with axiosClient.get
    axiosClient.get(`/supervisor/${memberId}`) // Removed full URL
      .then((res) => {
        // Axios automatically throws for non-2xx status, so no need for `if (!res.ok)`
        const data = res.data; // Axios response puts data directly on `res.data`
        setFormData({
          name: data.FullName || "",
          email: data.Email || "",
          role: data.Role || "Developer",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading member:", err);
        // More specific error message based on Axios error structure
        if (err.response) {
          toast.error(err.response.data.message || "Error loading member data from server.");
        } else if (err.request) {
          toast.error("No response from server. Check your network.");
        } else {
          toast.error("An unexpected error occurred while loading member data.");
        }
        onClose(); // Close modal if error
      });
  }, [memberId, onClose]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replaced fetch with axiosClient.put
      const res = await axiosClient.put(`/supervisor/${memberId}`, { // Removed full URL, Axios auto-JSON.stringify
        FullName: formData.name,
        Email: formData.email,
        Role: formData.role,
      });

      if (res.status === 200) { // Axios uses status
        toast.success("Member updated successfully!");
        onUpdate(); // Refresh data in parent
        onClose(); // Close modal
      } else {
        // This else block might be less common with Axios unless server returns specific non-2xx codes with messages
        toast.error(res.data.message || "Failed to update member.");
      }
    } catch (err) {
      console.error("Update error:", err);
      // More specific error message based on Axios error structure
      if (err.response) {
        toast.error(err.response.data.message || "Failed to update member (server error).");
      } else if (err.request) {
        toast.error("No response from server during update. Check your network.");
      } else {
        toast.error("An unexpected error occurred during update. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/55 flex justify-center items-center">
        <div className="bg-white p-6 rounded-xl shadow-lg text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex justify-center items-center">
      <div className="bg-white w-full max-w-xl rounded-2xl p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-600"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Edit Member</h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border-2 border-gray-400 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border-2 border-gray-400 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border-2 border-gray-400 rounded-lg px-4 py-2"
            >
              <option value="Developer">Developer</option>
              <option value="Manager">Manager</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl hover:from-blue-600 hover:to-blue-800 shadow-lg"
          >
            Update Member
          </button>
        </form>
      </div>
    </div>
  );
}