import React, { useEffect, useState } from "react";
import { FaTicketAlt, FaExclamationCircle, FaCalendarDay, FaTasks, FaHome } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { LuTicketCheck } from "react-icons/lu";
import { IoIosArrowBack } from "react-icons/io";
import { VscNotebook } from "react-icons/vsc";
import { CiLogout } from "react-icons/ci";
import { GrSystem } from "react-icons/gr";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import RecentlyActivity from "./RecentlyActivity"; // Import the RecentlyActivity component

ChartJS.register(ArcElement, Tooltip, Legend);

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

const TicketByStatusChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tickets/status-distribution");
        const data = response.data;

        const chartData = {
          labels: ["High", "Medium", "Low"],
          datasets: [
            {
              data: [data.high, data.medium, data.low],
              backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"],
              hoverBackgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"],
            },
          ],
        };

        setChartData(chartData);
      } catch (error) {
        console.error("Error fetching ticket status distribution:", error);
      }
    };

    fetchData();
  }, []);

  if (!chartData) {
    return <p>Loading chart...</p>;
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Ticket by Status</h2>
      <Pie data={chartData} />
      <div className="mt-4">
        {chartData.labels.map((label, index) => (
          <p key={index} className="text-sm">
            <span
              className="inline-block w-3 h-3 mr-2 rounded"
              style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
            ></span>
            {label}: {chartData.datasets[0].data[index]}%
          </p>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    total: 0,
    open: 0,
    today: 0,
    highPriority: 0,
    closed: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tickets/counts");
        setCounts(response.data);
      } catch (error) {
        console.error("Error fetching ticket counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const handleNavigation = (type) => {
    navigate(`/tickets?type=${type}`);
  };

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div
          className="bg-blue-500 text-white p-4 rounded shadow text-center cursor-pointer hover:bg-blue-600"
          onClick={() => handleNavigation("total")}
        >
          <FaTicketAlt className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">{counts.total}</h2>
          <p>Total Tickets</p>
        </div>
        <div
          className="bg-gray-800 text-white p-4 rounded shadow text-center cursor-pointer hover:bg-gray-700"
          onClick={() => handleNavigation("open")}
        >
          <FaTasks className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">{counts.open}</h2>
          <p>Open Tickets</p>
        </div>
        <div
          className="bg-gray-500 text-white p-4 rounded shadow text-center cursor-pointer hover:bg-gray-600"
          onClick={() => handleNavigation("today")}
        >
          <FaCalendarDay className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">{counts.today}</h2>
          <p>Tickets Today</p>
        </div>
        <div
          className="bg-red-500 text-white p-4 rounded shadow text-center cursor-pointer hover:bg-red-600"
          onClick={() => handleNavigation("high-priority")}
        >
          <FaExclamationCircle className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">{counts.highPriority}</h2>
          <p>High Priority</p>
        </div>
        <div
          className="bg-green-600 text-white p-4 rounded shadow text-center cursor-pointer hover:bg-green-700"
          onClick={() => handleNavigation("new")}
        >
          <FaTicketAlt className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">+</h2>
          <p>Issue Ticket</p>
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

        <TicketByStatusChart />
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen bg-gray-100 p-6 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        <Dashboard />
      </main>
    </div>
  );
};

export default DashboardLayout;
