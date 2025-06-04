import React, { useState, useEffect } from "react"; 
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";
import { useAuth } from '../../App'; 
import axios from 'axios'; 
import { LuTicketCheck, LuTicketX, LuTicket } from "react-icons/lu"; 
import { FaHistory } from "react-icons/fa"; 
import { toast } from 'react-toastify'; 

const usersDashboard = () => {
    const { loggedInUser } = useAuth(); 
    const [ticketCounts, setTicketCounts] = useState({ total: 0, pending: 0, resolved: 0 });
    const [recentTickets, setRecentTickets] = useState([]);
    const [loadingCounts, setLoadingCounts] = useState(true);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [error, setError] = useState(null);

    // Fetch ticket counts for the logged-in user
    useEffect(() => {
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

        fetchUserTicketCounts();
    }, [loggedInUser]); 

    // Fetch recent tickets for the logged-in user
    useEffect(() => {
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

        fetchUserRecentTickets();
    }, [loggedInUser]); 

    // Helper function to format date/time
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        return date.toLocaleString(); 
    };

    // Helper function to get status color
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

    return (
        <div className="flex">
            <title>User Dashboard</title> 
            <SideBar />

            <div className="flex-1 ml-72 flex flex-col h-screen overflow-y-auto">
                <NavBar />

                <div className="p-6 mt-[60px] flex-1">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome to Your Dashboard!</h1>

                    {error && <div className="text-red-600 mb-4">{error}</div>}

                    {/* Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

export default usersDashboard;
