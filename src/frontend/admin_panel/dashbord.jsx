import React, { useState } from "react";
import { FaTicketAlt, FaExclamationCircle, FaCalendarDay, FaTasks, FaHome } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { LuTicketCheck } from "react-icons/lu";
import { IoIosArrowBack } from "react-icons/io";
import { VscNotebook } from "react-icons/vsc";
import { CiLogout } from "react-icons/ci";
import { GrSystem } from "react-icons/gr";

const Menus = [
  { title: "Dashboard", icon: <FaHome />, path: "/admin-dashboard" },
  { title: "Tickets", icon: <LuTicketCheck />, path: "/tickets" },
  { title: "Ticket Manage", icon: <LuTicketCheck />, path: "/ticket-manage" },
  { title: "Supervisor Manage", icon: <VscNotebook />, path: "/supervisor-manage" },
  {
    title: "Asipiya Systems",
    icon: <GrSystem />,
    subMenu: true,
    subItems: [
      { title: "System Registration", path: "/system_registration" },
      { title: "Ticket Category", path: "/ticket-category" },
    ],
  },
];

const Sidebar = ({ open, setOpen }) => {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleSubMenu = (index) => {
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  return (
    <div
      className={`bg-gray-900 h-screen p-5 pt-30 fixed top-0 left-0 z-50 duration-300 ${
        open ? "w-72" : "w-20"
      }`}
    >
      <BsChevronLeft
        className={`absolute -right-3 mr-10 top-16 cursor-pointer text-white text-base ${
          !open && "rotate-180"
        }`}
        onClick={() => setOpen(!open)}
      />

      <div className="flex flex-col h-full justify-between">
        <ul className="pt-8">
          {Menus.map((menu, index) => (
            <div key={index}>
              {!menu.subMenu ? (
                <Link to={menu.path}>
                  <li className="text-white text-sm flex items-center justify-between gap-x-4 mt-5 cursor-pointer p-2 hover:bg-gray-700 rounded-md">
                    <div className="flex items-center gap-x-4">
                      <span className="text-2xl">{menu.icon}</span>
                      <span
                        className={`font-medium overflow-hidden whitespace-nowrap duration-300 ${
                          open ? "opacity-100" : "opacity-0 w-0"
                        }`}
                      >
                        {menu.title}
                      </span>
                    </div>
                    {open && <IoIosArrowBack className="rotate-180" />}
                  </li>
                </Link>
              ) : (
                <>
                  <li
                    onClick={() => toggleSubMenu(index)}
                    className="text-white text-sm flex items-center justify-between gap-x-4 mt-5 cursor-pointer p-2 hover:bg-gray-700 rounded-md"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-x-4">
                        <span className="text-2xl">{menu.icon}</span>
                        <span
                          className={`font-medium flex-1 overflow-hidden whitespace-nowrap duration-300 ${
                            open ? "opacity-100" : "opacity-0 w-0"
                          }`}
                        >
                          {menu.title}
                        </span>
                      </div>
                      {open && (
                        <IoIosArrowBack
                          className={`transition-transform duration-300 ${
                            expandedMenu === index ? "rotate-270" : "rotate-180"
                          }`}
                        />
                      )}
                    </div>
                  </li>

                  {open && expandedMenu === index && menu.subItems && (
                    <ul className="pl-12 mt-1">
                      {menu.subItems.map((subItem, subIndex) => (
                        <li
                          key={subIndex}
                          className="text-gray-300 text-sm p-2 hover:bg-gray-700 rounded-md cursor-pointer"
                        >
                          <Link to={subItem.path}>{subItem.title}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          ))}
        </ul>

        <div className="mt-auto">
          <li className="text-white text-sm flex items-center justify-between gap-x-4 cursor-pointer p-2 hover:bg-gray-700 rounded-md">
            <Link
              to="/logout"
              className="flex items-center gap-x-4 w-full justify-between"
            >
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
              {open && <IoIosArrowBack className="rotate-180" />}
            </Link>
          </li>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Dashboard</h1>
        <input
          type="text"
          placeholder="Search..."
          className="border rounded px-4 py-2 w-full md:w-auto"
        />
        <div className="text-2xl mt-4 md:mt-0">🔔</div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500 text-white p-4 rounded shadow text-center">
          <FaTicketAlt className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">1248</h2>
          <p>Total Tickets</p>
        </div>
        <div className="bg-gray-800 text-white p-4 rounded shadow text-center">
          <FaTasks className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">78</h2>
          <p>Open Tickets</p>
        </div>
        <div className="bg-gray-500 text-white p-4 rounded shadow text-center">
          <FaCalendarDay className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">125</h2>
          <p>Tickets Today</p>
        </div>
        <div className="bg-red-500 text-white p-4 rounded shadow text-center">
          <FaExclamationCircle className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">76</h2>
          <p>High Priority</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Recently Activity</h2>
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr>
                <th className="border border-gray-200 px-2 py-1">Tickets</th>
                <th className="border border-gray-200 px-2 py-1">Clients</th>
                <th className="border border-gray-200 px-2 py-1">Category</th>
                <th className="border border-gray-200 px-2 py-1">Status</th>
                <th className="border border-gray-200 px-2 py-1">Priority</th>
                <th className="border border-gray-200 px-2 py-1">Assigned</th>
              </tr>
            </thead>
            <tbody>{/* Add dynamic rows here */}</tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Ticket by Status</h2>
          <div className="text-center text-gray-500">[Pie Chart Placeholder]</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Tickets by System</h2>
          <div className="text-center text-gray-500">[Chart]</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Active Clients</h2>
          <div className="text-center text-gray-500">[Clients]</div>
        </div>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen bg-gray-100 p-6 duration-300 ${
          open ? "ml-72" : "ml-20"
        }`}
      >
        <Dashboard />
      </main>
    </div>
  );
};

export default Dashboard;
