import React, { useState, useEffect, useRef } from "react";
import SideBar from "../../user_components/SideBar/SideBar";
import { useAuth } from '../../App';
import axios from 'axios';
import { LuTicketCheck, LuTicketX, LuTicket, LuStar } from "react-icons/lu";
import { FaHistory } from "react-icons/fa";
import { toast } from 'react-toastify';
import { IoNotificationsOutline } from "react-icons/io5";
import NotificationPanel from "../components/NotificationPanel";
import { useNavigate } from "react-router-dom";

const UsersDashboard = () => {
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

    useEffect(() => {
        if (loggedInUser?.UserID) {
            fetchUserTicketCounts();
            fetchUserRecentTickets();
            fetchUnreadNotifications();
        }
    }, [loggedInUser]);

    const fetchUnreadNotifications = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/notifications/count/${loggedInUser.UserID}`);
            setUnreadNotifications(response.data.count);
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
        }
    };

    useEffect(() => {
        if (loggedInUser?.UserID) {
            fetchUnreadNotifications();
            const interval = setInterval(fetchUnreadNotifications, 30000); // Check every 30 seconds
            return () => clearInterval(interval);
        }
    }, [loggedInUser]);

    const fetchUserTicketCounts = async () => {
        if (!loggedInUser || !loggedInUser.UserID) {
            setLoadingCounts(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/user/tickets/counts/${loggedInUser.UserID}`);
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
            const response = await axios.get(`http://localhost:5000/api/user/tickets/recent/${loggedInUser.UserID}`);
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
                return 'bg-yellow-100 text-yellow-800';
            case 'open':
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

    return (
        <div className="flex">
            <title>User Dashboard</title>
            <SideBar />

            <div className="flex-1 ml-72 flex flex-col h-screen overflow-y-auto">
                <div className="fixed top-0 right-0 left-72 bg-white z-10 shadow-sm">
                    <div className="flex justify-between items-center px-6 py-4">
                        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

                        <div className="flex items-center gap-4">
                            <div
                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                onClick={handleProfileClick}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                    {loggedInUser?.ProfileImagePath ? (
                                        <img
                                            src={`http://localhost:5000/uploads/${loggedInUser.ProfileImagePath}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white">
                                            {loggedInUser?.FullName?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-800">{loggedInUser?.FullName}</p>
                                    <p className="text-sm text-gray-500">{loggedInUser?.Role}</p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowNotifications(!showNotifications);
                                    }}
                                    className="relative p-2 hover:bg-gray-100 rounded-full transition-colors ml-2"
                                >
                                    <IoNotificationsOutline className="text-2xl text-gray-600" />
                                    {unreadNotifications > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {unreadNotifications}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 mt-[80px] flex-1">
                    {/* Notification Panel */}
                    {showNotifications && (
                        <div ref={notificationRef} className="absolute right-4 top-32 z-50">
                            <NotificationPanel
                                userId={loggedInUser?.UserID}
                                role={loggedInUser?.Role}
                                onClose={() => setShowNotifications(false)}
                            />
                        </div>
                    )}

                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome to Your Dashboard!</h1>

                    {error && <div className="text-red-600 mb-4">{error}</div>}

                    {/* Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {loadingCounts ? (
                            <div className="col-span-3 text-center text-gray-600">Loading counts...</div>
                        ) : (
                            <>
                                {/* Total Tickets Card */}
                                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Total Tickets</h3>
                                        <p className="text-4xl font-bold text-blue-600">{ticketCounts.total}</p>
                                    </div>
                                    <LuTicketCheck className="text-5xl text-blue-400" />
                                </div>

                                {/* Pending Tickets Card */}
                                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Pending Tickets</h3>
                                        <p className="text-4xl font-bold text-yellow-600">{ticketCounts.pending}</p>
                                    </div>
                                    <LuTicketX className="text-5xl text-yellow-400" />
                                </div>

                                {/* Resolved Tickets Card */}
                                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Resolved Tickets</h3>
                                        <p className="text-4xl font-bold text-green-600">{ticketCounts.resolved}</p>
                                    </div>
                                    <LuTicket className="text-5xl text-green-400" />
                                </div>
                                {/* Ongoing Tickets Card */}
                                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Ongoing Tickets</h3>
                                        <p className="text-4xl font-bold text-purple-600">{ticketCounts.ongoing}</p>
                                    </div>
                                    <LuStar className="text-5xl text-purple-400" /> 
                                </div>
                            </>
                        )}
                    </div>

                    {/* Recent tickets Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <FaHistory className="mr-2 text-blue-500" /> Recent Tickets
                        </h2>

                        {loadingRecent ? (
                            <p className="text-center text-gray-600">Loading recent tickets...</p>
                        ) : recentTickets.length === 0 ? (
                            <p className="text-gray-600">No recent tickets found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left border-collapse">
                                    <thead className="bg-gray-100 text-gray-700 uppercase">
                                        <tr>
                                            <th className="px-4 py-3 border-b border-gray-200 rounded-tl-lg">ID</th>
                                            <th className="px-4 py-3 border-b border-gray-200">Description</th>
                                            <th className="px-4 py-3 border-b border-gray-200">System</th>
                                            <th className="px-4 py-3 border-b border-gray-200">Category</th>
                                            <th className="px-4 py-3 border-b border-gray-200">Status</th>
                                            <th className="px-4 py-3 border-b border-gray-200 rounded-tr-lg">Date & Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {recentTickets.map((ticket) => (
                                            <tr key={ticket.TicketID} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium text-gray-900">{ticket.TicketID}</td>
                                                <td className="px-4 py-2 text-gray-700">{ticket.Description}</td>
                                                <td className="px-4 py-2 text-gray-700">{ticket.SystemName}</td>
                                                <td className="px-4 py-2 text-gray-700">{ticket.CategoryName}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.Status)}`}>
                                                        {ticket.Status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-gray-500">{formatDateTime(ticket.DateTime)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersDashboard;
