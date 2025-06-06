import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCircleArrowLeft } from "react-icons/fa6";
import { toast } from "react-toastify";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";

export default function EditMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Developer",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/supervisor/${id}`)
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
        console.error("Failed to fetch user:", err);
        alert("Error loading member data.");
        navigate("/supervisor");
      });
  }, [id, navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/supervisor/${id}`, {
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
        navigate("/supervisor");
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
      <div className="min-h-screen flex justify-center items-center bg-gray-50 text-xl text-gray-600">
        Loading member data...
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div
        className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-yellow-50 to-white px-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-6 sm:p-10">
            <button
              onClick={() => navigate("/supervisor")}
              className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-2 text-sm sm:text-base"
            >
              <FaCircleArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Edit Member
            </h1>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block font-semibold mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 rounded-lg px-4 py-2"
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
                  className="w-full border-2 border-green-300 rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border-2 border-purple-300 rounded-lg px-4 py-2"
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
                Update Member
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
