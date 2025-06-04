import { FaCircleArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";

export default function AddMember() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    role: "Developer",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        navigate("/supervisor");
      } else {
        toast.error(data.message || "Failed to send invite");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Server error, try again");
    }
  };

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div
        className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center px-4 sm:px-6">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 sm:p-10">
            <button
              onClick={() => navigate("/supervisor")}
              className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-2 text-sm sm:text-base"
            >
              <FaCircleArrowLeft size={20} />
              <span>Back</span>
            </button>

            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Invite New Member
            </h1>

            <form className="space-y-6" onSubmit={handleSubmit}>
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
                  className="w-full px-4 py-2 border-2 border-green-300 text-gray-700 rounded-lg focus:outline-none focus:border-green-500"
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
                  className="w-full px-4 py-2 border-2 border-purple-300 text-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
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
      </div>
    </div>
  );
}
