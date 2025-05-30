import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RecentlyActivity = () => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchRecentActivities = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/tickets/recent-activities');
                setActivities(response.data);
            } catch (error) {
                console.error('Error fetching recent activities:', error);
            }
        };

        fetchRecentActivities();
    }, []);

    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Recently Activity</h2>
            <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead>
                    <tr>
                        <th className="border border-gray-200 px-2 py-1">Ticket ID</th>
                        <th className="border border-gray-200 px-2 py-1">Description</th>
                        <th className="border border-gray-200 px-2 py-1">Status</th>
                        <th className="border border-gray-200 px-2 py-1">Priority</th>
                        <th className="border border-gray-200 px-2 py-1">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map((activity) => (
                        <tr key={activity.TicketID}>
                            <td className="border border-gray-200 px-2 py-1">{activity.TicketID}</td>
                            <td className="border border-gray-200 px-2 py-1">{activity.Description}</td>
                            <td className="border border-gray-200 px-2 py-1">{activity.Status}</td>
                            <td className="border border-gray-200 px-2 py-1">{activity.Priority}</td>
                            <td className="border border-gray-200 px-2 py-1">{activity.DateTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentlyActivity;
