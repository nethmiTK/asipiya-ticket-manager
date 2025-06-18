import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FaHistory, FaExclamationTriangle, FaCheckCircle, FaComments, FaPaperclip } from 'react-icons/fa';

const TicketLogView = ({ ticketId }) => {
    const [ticketLogs, setTicketLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTicketLogs = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/ticket-logs/${ticketId}`);
                setTicketLogs(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching ticket logs:', err);
                setError('Failed to load ticket logs');
                setLoading(false);
            }
        };

        if (ticketId) {
            fetchTicketLogs();
        }
    }, [ticketId]);

    const getLogIcon = (type) => {
        switch (type) {
            case 'STATUS_CHANGE':
                return <FaHistory className="text-blue-500" />;
            case 'PRIORITY_CHANGE':
                return <FaExclamationTriangle className="text-yellow-500" />;
            case 'RESOLUTION':
                return <FaCheckCircle className="text-green-500" />;
            case 'COMMENT':
                return <FaComments className="text-purple-500" />;
            case 'ATTACHMENT':
                return <FaPaperclip className="text-gray-500" />;
            default:
                return <FaHistory className="text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return 'text-blue-600';
            case 'in process':
                return 'text-yellow-600';
            case 'resolved':
                return 'text-green-600';
            case 'rejected':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-yellow-600';
            case 'low':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                <p>{error}</p>
            </div>
        );
    }

    if (!ticketLogs.length) {
        return (
            <div className="text-center text-gray-600 p-4">
                <p>No activity logs found for this ticket.</p>
            </div>
        );
    }

    // Get the first log entry which contains the ticket details
    const ticketDetails = ticketLogs[0];

    return (
        <div className="space-y-6">
            {/* Ticket Overview Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Ticket Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Ticket ID</p>
                        <p className="font-medium">#{ticketDetails.TicketID}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Created By</p>
                        <p className="font-medium">{ticketDetails.CreatedByName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Created Date</p>
                        <p className="font-medium">
                            {format(new Date(ticketDetails.TicketCreatedAt), 'PPpp')}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Current Status</p>
                        <p className={`font-medium ${getStatusColor(ticketDetails.CurrentStatus)}`}>
                            {ticketDetails.CurrentStatus}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Priority</p>
                        <p className={`font-medium ${getPriorityColor(ticketDetails.CurrentPriority)}`}>
                            {ticketDetails.CurrentPriority}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Assigned To</p>
                        <p className="font-medium">{ticketDetails.SupervisorName || 'Not Assigned'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">System</p>
                        <p className="font-medium">{ticketDetails.SystemName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">{ticketDetails.CategoryName}</p>
                    </div>
                    {ticketDetails.DueDate && (
                        <div>
                            <p className="text-sm text-gray-600">Due Date</p>
                            <p className="font-medium">
                                {format(new Date(ticketDetails.DueDate), 'PPp')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Timeline</h2>
                <div className="space-y-6">
                    {ticketLogs.map((log) => (
                        <div key={log.TicketLogID} className="relative flex items-start group">
                            {/* Timeline line */}
                            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200 group-last:h-6"></div>
                            
                            {/* Icon */}
                            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-blue-500 z-10">
                                {getLogIcon(log.Type)}
                            </div>

                            {/* Content */}
                            <div className="ml-6 flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <span className="font-medium text-gray-900">{log.UserName}</span>
                                        <span className="ml-2 text-sm text-gray-500">
                                            {format(new Date(log.DateTime), 'PPpp')}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-blue-600">{log.Type.replace(/_/g, ' ')}</span>
                                </div>

                                <p className="text-gray-800">{log.Description}</p>
                                
                                {log.OldValue && log.NewValue && (
                                    <div className="mt-2 text-sm">
                                        <span className="text-gray-600">Changed from </span>
                                        <span className="font-medium text-red-600">{log.OldValue}</span>
                                        <span className="text-gray-600"> to </span>
                                        <span className="font-medium text-green-600">{log.NewValue}</span>
                                    </div>
                                )}

                                {log.Note && (
                                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                        {log.Note}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TicketLogView; 