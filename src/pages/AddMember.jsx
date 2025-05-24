import { FaCircleArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function AddMember() {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/supervisors");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-2 text-sm sm:text-base"
        >
          <FaCircleArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-700 mb-8">
          Add New Member
        </h1>

        {/* Form */}
        <form className="space-y-5">
          {/* Name */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter name"
              className="w-full px-4 py-2 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full px-4 py-2 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">
              Role
            </label>
            <select className="w-full px-4 py-2 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="user">Developer</option>
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 mt-4 text-sm sm:text-lg text-white font-semibold bg-blue-600 rounded-xl shadow-md hover:bg-blue-800 transition duration-200"
          >
            Add Member
          </button>
        </form>
      </div>
    </div>
  );
}
