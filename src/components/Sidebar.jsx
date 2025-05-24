import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="h-screen w-64 bg-[#2c3e50] text-white flex flex-col justify-between fixed">
      {/* Top Section */}
      <div>
        <div className="flex items-center gap-2 px-6 py-6">
          <FaUserCircle size={32} />
          <span className="text-xl font-semibold">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="mt-4">
          <Link
            to="/"
            className={`block px-6 py-3 hover:bg-[#34495e] ${
              location.pathname === "/" ? "bg-[#34495e]" : ""
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/supervisors"
            className={`block px-6 py-3 hover:bg-[#34495e] ${
              location.pathname === "/supervisors" ? "bg-[#34495e]" : ""
            }`}
          >
            Members
          </Link>
          <Link
            to="/tickets"
            className={`block px-6 py-3 hover:bg-[#34495e] ${
              location.pathname === "/tickets" ? "bg-[#34495e]" : ""
            }`}
          >
            Tickets Asign
          </Link>
          <Link
            to="/tickets-manage"
            className={`block px-6 py-3 hover:bg-[#34495e] ${
              location.pathname === "/tickets-manage" ? "bg-[#34495e]" : ""
            }`}
          >
            Tickets Manage
          </Link>
        </nav>
      </div>

      {/* Logout */}
      <div className="px-6 py-4 border-t border-gray-700">
        <button className="flex items-center gap-2 hover:text-red-400">
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

