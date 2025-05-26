import { FaCircleArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
// import axios from "axios";

export default function AddMember() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "developer",
  });

  const handleBackClick = () => {
    navigate("/supervisor");
  };

  // Uncomment to use real API
  /*
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/users", formData);
      alert("User added successfully!");
      navigate("/supervisors");
    } catch (err) {
      console.error(err);
      alert("Error adding user.");
    }
  };
  */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 sm:p-10">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-2 text-sm sm:text-base"
        >
          <FaCircleArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Add New Member
        </h1>

        {/* Form */}
        <form className="space-y-6">
          {/* Name */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              // onChange={handleChange}
              placeholder="Enter name"
              required
              className="w-full px-4 py-2 border-2 border-blue-300 text-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              // onChange={handleChange}
              placeholder="Enter email"
              required
              className="w-full px-4 py-2 border-2 border-green-300 text-gray-700 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              // onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-purple-300 text-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="developer">Developer</option>
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 text-white text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl hover:from-blue-600 hover:to-blue-800 shadow-lg transition duration-200"
          >
            Add Member
          </button>
        </form>
      </div>
    </div>
  );
}
