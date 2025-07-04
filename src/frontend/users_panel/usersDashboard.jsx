import React, { useState, useEffect, useRef } from "react";
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";
import { useAuth } from '../../App';
import axiosClient from '../axiosClient'; // Changed from axios to axiosClient
import { LuTicketCheck, LuTicketX, LuTicket, LuStar } from "react-icons/lu";
import { FaHistory } from "react-icons/fa";
import { toast } from 'react-toastify';
import { IoNotificationsOutline } from "react-icons/io5";
import NotificationPanel from "../components/NotificationPanel";
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';

const truncateDescription = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    let truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > -1) {
        truncated = truncated.substring(0, lastSpace);
    }
    return truncated + '...';
};

const usersDashboard = () => {
    const navigate = useNavigate();
    const { loggedInUser } = useAuth();
    const [ticketCounts, setTicketCounts] = useState({ total: 0, pending: 0, resolved: 0, ongoing: 0 });
    const [recentTickets, setRecentTickets] = useState([]);
    const [loadingCounts, setLoadingCounts] = useState(true);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [error, setError] = useState(null);

    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const notificationRef = useRef(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    // Effect for fetching unread notifications and initial ticket counts/recent tickets
    useEffect(() => {
        if (loggedInUser?.UserID) {
            fetchUserTicketCounts();
            fetchUserRecentTickets();
            fetchUnreadNotifications();
        }
    }, [loggedInUser]);

    const fetchUnreadNotifications = async () => {
        if (!loggedInUser || !loggedInUser.UserID) return; // Ensure user is logged in
        try {
            // Use axiosClient and remove base URL
            const response = await axiosClient.get(`/api/notifications/count/${loggedInUser.UserID}`);
            setUnreadNotifications(response.data.count);
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
        }
    };

    // New function to handle updates from NotificationPanel
    const handleNotificationPanelUpdate = () => {
        // Optimistically decrease the unread count displayed on the bell icon
        setUnreadNotifications(prevCount => Math.max(0, prevCount - 1));
        // Then, re-fetch the actual count from the backend to ensure consistency
        fetchUnreadNotifications();
    };

    useEffect(() => {
        if (loggedInUser?.UserID) {
            const interval = setInterval(fetchUnreadNotifications, 30000); // Check every 30 seconds
            return () => clearInterval(interval);
        }
    }, [loggedInUser]);

    // Socket listener for real-time notification updates
    useEffect(() => {
        if (loggedInUser?.UserID) {
            const socket = io("http://localhost:5000");
            
            // Listen for new notifications
            socket.on(`notification-${loggedInUser.UserID}`, () => {
                fetchUnreadNotifications();
            });
            
            // Listen for notification updates (like marking as read)
            socket.on(`notification-update-${loggedInUser.UserID}`, () => {
                fetchUnreadNotifications();
            });
            
            return () => {
                socket.off(`notification-${loggedInUser.UserID}`);
                socket.off(`notification-update-${loggedInUser.UserID}`);
                socket.disconnect();
            };
        }
    }, [loggedInUser?.UserID]);

    const fetchUserTicketCounts = async () => {
        if (!loggedInUser || !loggedInUser.UserID) {
            setLoadingCounts(false);
            return;
        }

        try {
            // Use axiosClient and remove base URL
            const response = await axiosClient.get(`/api/user/tickets/counts/${loggedInUser.UserID}`);
            setTicketCounts(response.data);
        } catch (err) {
            console.error("Error fetching user ticket counts:", err);
            toast.error("Failed to load ticket counts.");
            setError("Failed to load ticket counts.");
        } finally {
            setLoadingCounts(false);
        }
    };

    const fetchUserRecentTickets = async () => {
        if (!loggedInUser || !loggedInUser.UserID) {
            setLoadingRecent(false);
            return;
        }

        try {
            // Use axiosClient and remove base URL
            const response = await axiosClient.get(`/api/user/tickets/recent/${loggedInUser.UserID}`);
            setRecentTickets(response.data);
        } catch (err) {
            console.error("Error fetching user recent tickets:", err);
            toast.error("Failed to load recent tickets.");
            setError("Failed to load recent tickets.");
        } finally {
            setLoadingRecent(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        return date.toLocaleString();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-orange-100 text-orange-800';
            case 'open':
                return 'bg-yellow-100 text-yellow-800';
            case 'in progress':
                return 'bg-blue-100 text-blue-800';
            case 'resolved':
            case 'closed':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleProfileClick = () => {
        navigate('/user-profile');
    };

    const [activeTooltip, setActiveTooltip] = useState(null);
    const tooltipRefs = useRef([]);

    // Add this effect to handle clicks outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeTooltip &&
                !tooltipRefs.current.some(ref => ref && ref.contains(event.target))) {
                setActiveTooltip(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeTooltip]);

    return (
        <div className="flex">
            <title>User Dashboard</title>
            <SideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

            <div className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300
                ml-0
                lg:ml-20 ${isSidebarOpen ? 'lg:ml-72' : ''}
            `}>

                <NavBar
                    isSidebarOpen={isSidebarOpen}
                    showNotifications={showNotifications}
                    unreadNotifications={unreadNotifications}
                    setShowNotifications={setShowNotifications}
                    notificationRef={notificationRef}
                    setOpen={setIsSidebarOpen}
                />

                <div className="p-6 mt-[60px] flex-1">
                    {/* Notification Panel */}
                    {showNotifications && (
                        <div ref={notificationRef} className="absolute right-4 top-[70px] z-50">
                            <NotificationPanel
                                userId={loggedInUser?.UserID}
                                role={loggedInUser?.Role}
                                onClose={() => setShowNotifications(false)}
                                onNotificationUpdate={handleNotificationPanelUpdate}
                            />
                        </div>
                    )}

                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome to Your Dashboard!</h1>

                    {error && <div className="text-red-600 mb-4">{error}</div>}

                    {/* Cards Section */}

                    <div className="mb-8">
                        {/* Mobile View - Icon + Number Only */}
                        <div className="flex justify-around items-center md:hidden">
                            {[
                                {
                                    icon: <LuTicketCheck className="text-3xl text-blue-500" />,
                                    count: ticketCounts.total,
                                    label: 'Total Tickets',
                                    id: 'total'
                                },
                                {
                                    icon: <LuTicketX className="text-3xl text-yellow-500" />,
                                    count: ticketCounts.pending,
                                    label: 'Pending Tickets',
                                    id: 'pending'
                                },
                                {
                                    icon: <LuTicket className="text-3xl text-green-500" />,
                                    count: ticketCounts.resolved,
                                    label: 'Resolved Tickets',
                                    id: 'resolved'
                                },
                                {
                                    icon: <LuStar className="text-3xl text-purple-500" />,
                                    count: ticketCounts.ongoing,
                                    label: 'Ongoing Tickets',
                                    id: 'ongoing'
                                }
                            ].map((item, index) => (
                                <div
                                    key={item.id}
                                    ref={el => tooltipRefs.current[index] = el}
                                    className="flex flex-col items-center relative"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTooltip(activeTooltip === item.id ? null : item.id);
                                    }}
                                    onMouseLeave={() => setActiveTooltip(null)}
                                >
                                    {item.icon}
                                    <p className="mt-1 text-sm font-bold text-gray-700">{item.count}</p>
                                    <span className={`
                absolute -bottom-8 left-1/2 transform -translate-x-1/2
                bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap
                transition-opacity duration-200
                ${activeTooltip === item.id ? 'opacity-100' : 'opacity-0'}
            `}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View - Full Cards */}
                        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Total Tickets</h3>
                                    <p className="text-4xl font-bold text-blue-600">{ticketCounts.total}</p>
                                </div>
                                <LuTicketCheck className="text-5xl text-blue-400" />
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Pending Tickets</h3>
                                    <p className="text-4xl font-bold text-yellow-600">{ticketCounts.pending}</p>
                                </div>
                                <LuTicketX className="text-5xl text-yellow-400" />
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Resolved Tickets</h3>
                                    <p className="text-4xl font-bold text-green-600">{ticketCounts.resolved}</p>
                                </div>
                                <LuTicket className="text-5xl text-green-400" />
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Ongoing Tickets</h3>
                                    <p className="text-4xl font-bold text-purple-600">{ticketCounts.ongoing}</p>
                                </div>
                                <LuStar className="text-5xl text-purple-400" />
                            </div>
                        </div>
                    </div>

                    {/* Recent tickets Section - Mobile */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <FaHistory className="mr-2 text-blue-500" /> Recent Tickets
                        </h2>

                        {loadingRecent ? (
                            <p className="text-center text-gray-600">Loading recent tickets...</p>
                        ) : recentTickets.length === 0 ? (
                            <p className="text-gray-600">No recent tickets found.</p>
                        ) : (
                            <>
                                {/* Mobile View - Card Layout */}
                                <div className="block md:hidden space-y-4">
                                    {recentTickets.map((ticket) => (
                                        <div key={ticket.TicketID} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-gray-900">#{ticket.TicketID}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.Status)}`}>
                                                    {ticket.Status}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 mb-2 text-sm">
                                                {truncateDescription(ticket.Description, 100)}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">System:</span> {ticket.SystemName}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Category:</span> {ticket.CategoryName}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                {formatDateTime(ticket.DateTime)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View - Table Layout */}
                                <div className="hidden md:block">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ID
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Description
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        System
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Category
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date & Time
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {recentTickets.map((ticket) => (
                                                    <tr key={ticket.TicketID} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {ticket.TicketID}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">
                                                            <div className="max-w-xs">
                                                                {truncateDescription(ticket.Description, 120)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {ticket.SystemName}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {ticket.CategoryName}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.Status)}`}>
                                                                {ticket.Status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDateTime(ticket.DateTime)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default usersDashboard;