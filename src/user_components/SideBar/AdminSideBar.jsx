import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { LuTicketCheck } from "react-icons/lu";
import { IoIosArrowBack } from "react-icons/io";
import { VscNotebook } from "react-icons/vsc";
import { CiLogout } from "react-icons/ci";
import { GrSystem } from "react-icons/gr";
import { FaHome, FaUserCog } from "react-icons/fa";
import { useAuth } from '../../App.jsx';
import { toast } from "react-toastify";

const Menus = [
  { title: "Profile", icon: <FaUserCog />, path: "/admin-profile" },
  { title: "Dashboard", icon: <FaHome />, path: "/admin-dashboard" },
  { 
    title: "Tickets", 
    icon: <LuTicketCheck />, 
    path: "/tickets",
    subMenu: true,
    subItems: [
      { title: "All Tickets", path: "/tickets" },
      { title: "Open Tickets", path: "/tickets?type=open" },
      { title: "Today's Tickets", path: "/tickets?type=today" },
      { title: "High Priority", path: "/tickets?type=high-priority" },
      { title: "Closed Tickets", path: "/tickets?type=closed" }
    ]
  },
  { title: "Ticket Manage", icon: <LuTicketCheck />, path: "/ticket-manage" },
  { title: "Supervisor Manage", icon: <VscNotebook />, path: "/supervisor-manage" },
  {
    title: "Asipiya Systems",
    icon: <GrSystem />,
    subMenu: true,
    subItems: [
      { title: "System Registration", path: "/system_registration" },
      { title: "Ticket Category", path: "/ticket_category" }
    ],
  },
];

const AdminSideBar = ({ open: propOpen, setOpen: propSetOpen }) => {
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  const authContext = useAuth();
  if (!authContext) return null;

  const { handleLogout } = authContext;

  // Automatically expand menus based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    let menuToExpand = null;

    // Find which menu should be expanded based on current path
    Menus.forEach((menu, index) => {
      if (menu.subMenu) {
        const hasMatchingPath = menu.subItems.some(item => 
          currentPath.includes(item.path) || 
          (item.path === '/tickets' && currentPath === '/tickets')
        );
        if (hasMatchingPath) {
          menuToExpand = index;
        }
      }
    });

    setExpandedMenu(menuToExpand);
  }, [location.pathname]);

  const toggleSubMenu = (index) => {
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  const isActivePath = (path) => {
    // For tickets, only highlight when the exact path matches
    if (path.startsWith('/tickets')) {
      return path === location.pathname + location.search;
    }
    // For other paths, check if the current path includes the menu path
    return location.pathname.includes(path);
  };

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    propSetOpen(!propOpen);
  };

  // Open logout modal
  const handleConfirmLogout = () => {
    setShowLogoutModal(true);
  };

  // Confirm logout
  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
    toast.success("Logged out successfully!");
  };

  // Cancel logout modal
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className="flex">
        <div 
          className={`bg-gray-900 h-screen duration-300 p-5 pt-30 fixed top-0 left-0 z-50 overflow-y-auto
          ${propOpen ? "w-72" : "w-20"}`}
        >
          <BsChevronLeft
            className={`absolute -right-3 mr-10 top-16 cursor-pointer text-white text-base transition-transform duration-300
            ${!propOpen ? "rotate-180" : ""}`}
            onClick={handleSidebarToggle}
            aria-label="Toggle sidebar"
          />

          <div className="flex flex-col h-full justify-between">
            <ul className="pt-8">
              {Menus.map((menu, index) => (
                <div key={index}>
                  {!menu.subMenu ? (
                    <Link to={menu.path}>
                      <li className={`text-white text-sm flex items-center justify-between gap-x-4 mt-5 cursor-pointer p-2 hover:bg-gray-700 rounded-md ${
                        isActivePath(menu.path) ? 'bg-gray-700' : ''
                      }`}>
                        <div className="flex items-center gap-x-4">
                          <span className="text-2xl">{menu.icon}</span>
                          <span className={`font-medium overflow-hidden whitespace-nowrap duration-300 ${
                            propOpen ? "opacity-100" : "opacity-0 w-0"
                          }`}>
                            {menu.title}
                          </span>
                        </div>
                        {propOpen && <IoIosArrowBack className="rotate-180" />}
                      </li>
                    </Link>
                  ) : (
                    <>
                      <li
                        onClick={() => toggleSubMenu(index)}
                        className={`text-white text-sm flex items-center justify-between gap-x-4 mt-5 cursor-pointer p-2 hover:bg-gray-700 rounded-md ${
                          expandedMenu === index ? 'bg-gray-700' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-x-4">
                            <span className="text-2xl">{menu.icon}</span>
                            <span className={`font-medium flex-1 overflow-hidden whitespace-nowrap duration-300 ${
                              propOpen ? "opacity-100" : "opacity-0 w-0"
                            }`}>
                              {menu.title}
                            </span>
                          </div>
                          {propOpen && (
                            <IoIosArrowBack className={`transition-transform duration-300 ${
                              expandedMenu === index ? "rotate-270" : "rotate-180"
                            }`} />
                          )}
                        </div>
                      </li>

                      {propOpen && expandedMenu === index && menu.subItems && (
                        <ul className="pl-8 mt-2">
                          {menu.subItems.map((subItem, subIndex) => (
                            <Link key={subIndex} to={subItem.path}>
                              <li className={`text-gray-300 text-sm p-2 hover:bg-gray-700 rounded-md cursor-pointer ${
                                isActivePath(subItem.path) ? 'bg-gray-700 text-white' : ''
                              }`}>
                                {subItem.title}
                              </li>
                            </Link>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              ))}
            </ul>

            <div className="mt-auto">
              <li
                className="text-white text-sm flex items-center justify-between gap-x-4 cursor-pointer p-2 hover:bg-gray-700 rounded-md"
                onClick={handleConfirmLogout} 
              >
                <div className="flex items-center gap-x-4 w-full justify-between">
                  <div className="flex items-center gap-x-4">
                    <span className="text-2xl">
                      <CiLogout />
                    </span>
                    <span
                      className={`font-medium flex-1 overflow-hidden whitespace-nowrap duration-300 ${
                        open ? "opacity-100" : "opacity-0 w-0"
                      }`}
                    >
                      Log Out
                    </span>
                  </div>
                  {propOpen && (
                    <span className="font-medium flex items-center">
                      <IoIosArrowBack className="rotate-180" />
                    </span>
                  )}
                </div>
              </li>
            </div>
          </div>
        </div>

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
    </>
  );
};

export default AdminSideBar;
