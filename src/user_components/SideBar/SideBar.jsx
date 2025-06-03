import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { LuTicketCheck, LuTicketPlus } from "react-icons/lu";
import { IoIosArrowBack } from "react-icons/io";
import { AiOutlineUser } from "react-icons/ai";
import { CiLogout } from "react-icons/ci";
import { useAuth } from '../../App.jsx';
import { toast } from 'react-toastify';

const Menus = [
  { title: "Dashboard", icon: <LuTicketCheck />, path: "/all-tickets" },
  { title: "Create Tickets", icon: <LuTicketPlus />, path: "/open-tickets" },
   { title: "My Profile", icon: <AiOutlineUser />, path: "/user-profile" }, 
];

const SideBar = () => {
  const [open, setOpen] = useState(true);
  const { handleLogout } = useAuth();

  // Modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Open the logout confirmation modal
  const handleConfirmLogout = () => {
    setShowLogoutModal(true);
  };

  // Confirm logout and close modal
  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
    toast.success("Logged out successfully!");
  };

  // Cancel logout and close modal
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="flex">
      <div
        className={`bg-gray-900 h-screen duration-300 p-5 pt-30 fixed top-0 left-0 z-50 transition-all
    ${open ? "w-72" : "w-20"}`}
      >
        <BsChevronLeft
          className={`absolute -right-3 top-16 cursor-pointer text-white text-base transition-transform duration-300
      ${open ? "rotate-0" : "rotate-180"}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle sidebar"
        />

        <div className="flex flex-col h-full justify-between">
          <ul className="pt-8">
            {Menus.map((menu, index) => (
              <li
                key={index}
                className="text-white text-sm flex items-center justify-between gap-x-4 mt-5 cursor-pointer p-2 hover:bg-gray-700 rounded-md"
              >
                <Link
                  to={menu.path}
                  className="flex items-center gap-x-4 w-full justify-between"
                >
                  <div className="flex items-center gap-x-4">
                    <span className="text-2xl">{menu.icon}</span>
                    <span
                      className={`font-medium flex-1 overflow-hidden whitespace-nowrap duration-300
                  ${open ? "opacity-100" : "opacity-0 w-0"}`}
                    >
                      {menu.title}
                    </span>
                  </div>
                  {open && (
                    <span className="font-medium flex items-center">
                      <IoIosArrowBack className="rotate-180" />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            {/* Logout Button */}
            <li
              className="text-white text-sm flex items-center justify-between gap-x-4 cursor-pointer p-2 hover:bg-gray-700 rounded-md"
              onClick={handleConfirmLogout} // Show confirmation modal instead of immediate logout
            >
              <div className="flex items-center gap-x-4 w-full justify-between">
                <div className="flex items-center gap-x-4">
                  <span className="text-2xl">
                    <CiLogout />
                  </span>
                  <span
                    className={`font-medium flex-1 overflow-hidden whitespace-nowrap duration-300
                ${open ? "opacity-100" : "opacity-0 w-0"}`}
                  >
                    Log Out
                  </span>
                </div>
                {open && (
                  <span className="font-medium flex items-center">
                    <IoIosArrowBack className="rotate-180" />
                  </span>
                )}
              </div>
            </li>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Are you sure you want to log out?</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, Log Out
              </button>
              <button
                onClick={cancelLogout}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;
