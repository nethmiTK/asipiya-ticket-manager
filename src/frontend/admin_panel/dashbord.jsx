import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaTicketAlt, FaExclamationCircle, FaCalendarDay, FaTasks, FaHome, FaEye, FaClock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { LuTicketCheck } from "react-icons/lu";
import { IoIosArrowBack } from "react-icons/io";
import { VscNotebook } from "react-icons/vsc";
import { CiLogout } from "react-icons/ci";
import { GrSystem } from "react-icons/gr";
import { IoNotificationsOutline } from "react-icons/io5";
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import AdminNavBar from "../../user_components/NavBar/AdminNavBar.jsx";
import axiosClient from "../axiosClient"; // Changed from axios to axiosClient
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from "chart.js";
import { format } from 'date-fns';
import { useAuth } from '../../App.jsx';
import Ticket_secret from "./Ticket_secret";
import NotificationPanel from "../components/NotificationPanel";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

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

    </div>
  );
};

const TicketByStatusChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use axiosClient and remove base URL
        const response = await axiosClient.get("/api/tickets/status-distribution");
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
    return (
      <div className="bg-white p-6 rounded-lg shadow h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow h-[400px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Ticket by Status</h2>
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full max-w-[300px] max-h-[300px] mx-auto">
            <Pie data={chartData} options={{
              maintainAspectRatio: true,
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 12,
                    padding: 15
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-2 gap-4">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ background: "#ff6384" }}></span>
          High: {chartData.datasets[0].data[0]}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ background: "#ffcd56" }}></span>
          Medium: {chartData.datasets[0].data[1]}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ background: "#36a2eb" }}></span>
          Low: {chartData.datasets[0].data[2]}
        </span>
      </div>
    </div>
  );
};

const TicketBySystemChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use axiosClient and remove base URL
        const response = await axiosClient.get("/api/tickets/system-distribution");

        if (!response.data || response.data.length === 0) {
          setError("No system data available");
          setLoading(false);
          return;
        }

        const colors = [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ];

        const chartData = {
          labels: response.data.map(item => item.SystemName),
          datasets: [
            {
              label: 'Number of Tickets',
              data: response.data.map(item => item.TicketCount),
              backgroundColor: response.data.map((_, index) => colors[index % colors.length]),
              borderColor: response.data.map((_, index) => colors[index % colors.length].replace('0.8', '1')),
              borderWidth: 1,
            },
          ],
        };

        setChartData(chartData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ticket system distribution:", error);
        setError("Failed to load chart data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Tickets by System',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Tickets',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          precision: 0
        }
      },
      x: {
        title: {
          display: true,
          text: 'System Name',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded shadow h-[400px] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="h-[400px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { loggedInUser: user } = useAuth();
  const [counts, setCounts] = useState({
    total: 0,
    open: 0,
    today: 0,
    highPriority: 0,
    closed: 0,
    pending: 0,
    resolved: 0, // Ensure resolved is initialized
  });
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Use axiosClient and remove base URL
        const response = await axiosClient.get("/api/tickets/counts");
        setCounts(response.data);
      } catch (error) {
        console.error("Error fetching ticket counts:", error);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        // Use axiosClient and remove base URL for both calls
        const [logRes, usersRes] = await Promise.all([
          axiosClient.get("/api/tickets/recent-activities"),
          axiosClient.get("/api/users/recent")
        ]);
        setRecentActivities(logRes.data);
        setRecentUsers(usersRes.data);
      } catch (error) {
        console.error("Error fetching recent data:", error);
      }
    };

    fetchRecentData();
  }, []);

  const handleNavigation = (type) => {
    let path = '/tickets';
    if (type !== 'total') {
      path += `?type=${type}`;
    }
    navigate(path);
  };

  const handleProfileClick = useCallback(() => { // Wrap with useCallback for optimization
    navigate('/admin-profile');
  }, [navigate]);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleUserClick = (userId) => {
    navigate(`/user-details/${userId}`);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        <div
          onClick={() => handleNavigation('total')}
          className="bg-blue-500 text-white p-4 rounded shadow text-center cursor-pointer hover:bg-blue-600 transition-colors"
        >
          <FaTicketAlt className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">{counts.total}</h2>
          <p>Total Tickets</p>
        </div>
        <div
          onClick={() => handleNavigation('open')}
          className="bg-gray-800 text-white p-4 rounded shadow text-center cursor-pointer hover:bg-gray-700 transition-colors"
        >
          <FaTasks className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">{counts.open}</h2>
          <p>Open Tickets</p>
        </div>
        <div
          onClick={() => handleNavigation('today')}
          className="bg-gray-500 text-white p-4 rounded shadow text-center cursor-pointer hover:bg-gray-600 transition-colors"
        >
          <FaCalendarDay className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">{counts.today}</h2>
          <p>Today's Tickets</p>
        </div>
        <div
          onClick={() => handleNavigation('pending')}
          className="bg-yellow-500 text-white p-4 rounded shadow text-center cursor-pointer hover:bg-yellow-600 transition-colors"
        >
          <FaClock className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">{counts.pending}</h2>
          <p>Pending Tickets</p>
        </div>
        <div
          onClick={() => handleNavigation('high-priority')}
          className="bg-red-500 text-white p-4 rounded shadow text-center cursor-pointer hover:bg-red-600 transition-colors"
        >
          <FaExclamationCircle className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">{counts.highPriority}</h2>
          <p>High Priority</p>
        </div>
        <div
          onClick={() => handleNavigation('resolved')}
          className="bg-green-600 text-white p-4 rounded shadow text-center cursor-pointer hover:bg-green-700 transition-colors"
        >
          <FaTicketAlt className="text-3xl mb-2 mx-auto" />
          <h2 className="text-lg font-semibold">{counts.resolved}</h2>
          <p>Resolved Tickets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow h-[400px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6">Recently Activity</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivities.length > 0 ? (
                  recentActivities.map((log, index) => (
                    <tr key={`${log.TicketID}-${log.DateTime}-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">#{log.TicketID}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {log.DateTime ? (
                          typeof log.DateTime === 'string' && log.DateTime.includes('-') ?
                            log.DateTime :
                            format(new Date(log.DateTime), 'yyyy-MM-dd HH:mm:ss')
                        ) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.Type === 'STATUS_CHANGE' ? 'bg-blue-100 text-blue-800' :
                          log.Type === 'PRIORITY_CHANGE' ? 'bg-yellow-100 text-yellow-800' :
                          log.Type === 'SUPERVISOR_CHANGE' ? 'bg-green-100 text-green-800' :
                          log.Type === 'COMMENT' ? 'bg-purple-100 text-purple-800' :
                          log.Type === 'ATTACHMENT' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.Type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={log.Description}>
                        {log.Description || 'No description'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No recent activities found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <TicketBySystemChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TicketByStatusChart />
        <div className="bg-white p-6 rounded-lg shadow h-[400px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6">Recently Users</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {recentUsers.map((user) => (
              <div
                key={user.UserID}
                className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleUserClick(user.UserID)}
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full overflow-hidden relative ${
                    user.hasPendingTicket ? 'ring-2 ring-green-500' : ''
                  }`}>
                    {user.ProfileImagePath ? (
                      <img
                        src={`http://localhost:5000/uploads/${user.ProfileImagePath}`}
                        alt={user.FullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.FullName)}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-xl">
                        {user.FullName.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-gray-700 text-center truncate w-full">
                  {user.FullName}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTicket && (
        <Ticket_secret
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const { loggedInUser: user } = useAuth();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!user?.UserID) return;
    try {
      // Use axiosClient and remove base URL
      const response = await axiosClient.get(`/api/notifications/count/${user.UserID}`);
      setUnreadNotifications(response.data.count);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  }, [user?.UserID]); // Added user.UserID to dependencies

  useEffect(() => {
    if (user?.UserID) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadNotifications]);

  // New function to handle updates from NotificationPanel
  const handleNotificationPanelUpdate = useCallback(() => {
      // Optimistically decrease the unread count displayed on the bell icon
      setUnreadNotifications(prevCount => Math.max(0, prevCount - 1));
      // Then, re-fetch the actual count from the backend to ensure consistency
      fetchUnreadNotifications();
  }, [fetchUnreadNotifications]); // Added fetchUnreadNotifications to dependencies

  const handleProfileClick = useCallback(() => {
    navigate('/admin-profile');
  }, [navigate]);

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <AdminNavBar
        pageTitle="Dashboard"
        user={user}
        sidebarOpen={isSidebarOpen}
        onProfileClick={handleProfileClick}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        unreadNotifications={unreadNotifications}
        showNotifications={showNotifications}
        notificationRef={notificationRef}
      >
      </AdminNavBar>

      <main className={`flex-1 min-h-screen mt-12 bg-gray-100 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-16"}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          {showNotifications && (
            <div ref={notificationRef} className="absolute right-4 top-14 z-50">
              <NotificationPanel
                userId={user?.UserID}
                role={user?.Role}
                onClose={() => setShowNotifications(false)}
                onNotificationUpdate={handleNotificationPanelUpdate}
              />
            </div>
          )}
          <Dashboard />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;