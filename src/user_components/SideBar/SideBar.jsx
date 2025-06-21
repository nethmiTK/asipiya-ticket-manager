import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { LuTicketCheck, LuTicketPlus, LuLayoutDashboard } from "react-icons/lu";
import { IoIosArrowBack } from "react-icons/io";
import { AiOutlineUser } from "react-icons/ai";
import { CiLogout } from "react-icons/ci";
import { useAuth } from "../../App.jsx";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const Menus = [
  { title: "Dashboard", icon: <LuLayoutDashboard />, path: "/all-tickets" },
  { title: "Create Tickets", icon: <LuTicketPlus />, path: "/open-tickets" },
  { title: "View My Tickets", icon: <LuTicketCheck />, path: "/ticket-view" },
  { title: "My Profile", icon: <AiOutlineUser />, path: "/user-profile" },
];

const SideBar = ({ open, setOpen }) => {
  const { handleLogout } = useAuth();
  // const [open, setOpen] = useState(true);
  const location = useLocation();

  // Auto-collapse on route change
  // useEffect(() => {
  //   setOpen(false);
  // }, [location.pathname]);

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
      {/* <div
        className={`bg-gray-900 h-screen duration-300 p-5 pt-30 fixed top-0 left-0 z-50 transition-all
        ${open ? "w-72" : "w-20"}`}
      > */}
      <div
        className={`bg-gray-900 h-screen duration-300 p-5 pt-30 fixed top-0 left-0 z-50 transition-all transform
          ${open ? "w-72 translate-x-0" : "w-72 -translate-x-full"} /* Mobile: full width when open, slides off-screen when closed */
          lg:translate-x-0 lg:block ${open ? "lg:w-72" : "lg:w-20"} /* Desktop: always visible, width toggles */
        `}
      >
        <BsChevronLeft
          className={`absolute -right-3 mr-10 top-16 cursor-pointer text-white text-base transition-transform duration-300 z-50
          ${open ? "rotate-0" : "rotate-180"}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle sidebar"
        />
         {/* Close button for mobile sidebar - visible when open on small screens */}
        {/* {open && (
          <button
            className="absolute top-4 right-4 text-white text-2xl lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
            title="Close Sidebar"
          >
            <X />
          </button>
        )} */}

        <div className="flex flex-col h-full justify-between">
          <ul className="pt-8">
            {Menus.map((menu, index) => (
              <li
                key={index}
                className={`text-white text-sm flex items-center gap-x-4 mt-5 cursor-pointer p-2 rounded-md
                  ${location.pathname === menu.path ? "bg-gray-700" : "hover:bg-gray-700"}
                  ${open ? "justify-between" : "justify-center"}
                   lg:justify-between `}
              >
                <Link
                  to={menu.path}
                  className="flex items-center gap-x-4 w-full relative group"
                >
                  <span className="text-2xl">{menu.icon}</span>
                  <span
                    className={`font-medium overflow-hidden whitespace-nowrap duration-300
      ${open ? "opacity-100" : "opacity-0 w-0"}`}
                  >
                    {menu.title}
                  </span>

                  {/* Tooltip when collapsed */}
                  {!open && (
                    <span className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg scale-0 group-hover:scale-100 origin-left transition-transform whitespace-nowrap z-50">
                      {menu.title}
                    </span>
                  )}
                </Link>

                {open && (
                  <span className="font-medium flex items-center">
                    <IoIosArrowBack className="rotate-180" />
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            {/* Logout Button */}
            <li
              className={`text-white text-sm flex items-center gap-x-4 cursor-pointer p-2 rounded-md
                hover:bg-gray-700 ${open ? "justify-between" : "justify-center"} lg:justify-between`}
              onClick={handleConfirmLogout} // Show confirmation modal instead of immediate logout
            >
              <div className="flex items-center gap-x-4 w-full relative group">
                <span className="text-2xl"><CiLogout /></span>
                <span
                  className={`font-medium overflow-hidden whitespace-nowrap duration-300
      ${open ? "opacity-100" : "opacity-0 w-0"}
      lg:opacity-100 ${open ? "lg:w-auto" : "lg:w-0 lg:overflow-hidden"} 
      `}
                >
                  Log Out
                </span>

                {/* Tooltip when collapsed */}
                {!open && (
                  <span className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg scale-0 group-hover:scale-100 origin-left transition-transform whitespace-nowrap z-50">
                    Log Out
                  </span>
                )}
              </div>

              {open && (
                <span className="font-medium flex items-center">
                  <IoIosArrowBack className="rotate-180" />
                </span>
              )}
            </li>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-sm">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to log out?
            </h2>
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
