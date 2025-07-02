import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

export default function EditMemberModal({ memberId, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Developer",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/supervisor/${memberId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch member");
        return res.json();
      })
      .then((data) => {
        setFormData({
          name: data.FullName || "",
          email: data.Email || "",
          role: data.Role || "Developer",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading member:", err);
        toast.error("Error loading member data.");
        onClose(); // Close modal if error
      });
  }, [memberId, onClose]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/supervisor/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FullName: formData.name,
          Email: formData.email,
          Role: formData.role,
        }),
      });

      if (res.ok) {
        toast.success("Member updated successfully!");
        onUpdate(); // Refresh data in parent
        onClose(); // Close modal
      } else {
        toast.error("Failed to update member");
      }
    } catch (err) {
      toast.error("Server error. Please try again.");
      console.error("Update error:", err);
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
