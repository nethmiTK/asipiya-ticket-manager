import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";

const ActivityLog = ({ ticketId }) => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;

    const fetchActivityLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/ticket-logs/${ticketId}`);
        if (!response.ok) throw new Error('Failed to fetch activity logs');
        const data = await response.json();
        setActivityLogs(data);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        toast.error('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, [ticketId]);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const getDefaultIcon = () => (
    <div className="p-2 bg-gray-100 rounded-full">
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );

  const getActivityIcon = (actionType) => {
    // Handle undefined or null actionType
    if (!actionType) return getDefaultIcon();
    
    switch (actionType.toLowerCase()) {
      case 'status_change':
      case 'status_changed':
        return (
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'priority_change':
      case 'due_date_change':
      case 'due_date_changed':
        return (
          <div className="p-2 bg-yellow-100 rounded-full">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'resolution_update':
      case 'resolution_updated':
        return (
          <div className="p-2 bg-green-100 rounded-full">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'comment':
      case 'comment_added':
        return (
          <div className="p-2 bg-purple-100 rounded-full">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'attachment':
      case 'ticket_created':
        return (
          <div className="p-2 bg-indigo-100 rounded-full">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'assignment_changed':
        return (
          <div className="p-2 bg-orange-100 rounded-full">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );

      case 'supervisor_change':
      case 'supervisor_changed':
        return (
          <div className="p-2 bg-purple-100 rounded-full">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );

      case 'supervisor_added':
        return (
          <div className="p-2 bg-green-100 rounded-full">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );

      case 'supervisor_removed':
        return (
          <div className="p-2 bg-red-100 rounded-full">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
            </svg>
          </div>
        );
      default:
        return getDefaultIcon();
    }
  };

  const getActivityDescription = (log) => {
    const action = log.actionType?.toLowerCase();
    const userName = log.actor || log.UserName || 'System';
    const oldValue = log.details?.oldValue || log.OldValue;
    const newValue = log.details?.newValue || log.NewValue;

    switch (action) {
      case 'status_change':
      case 'status_changed':
        return (
          <div>
            <span className="font-medium">{userName}</span> changed status from{' '}
            <span className="px-2 py-1 bg-gray-100 rounded text-sm">{oldValue}</span> to{' '}
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{newValue}</span>
          </div>
        );
      case 'priority_change':
        return (
          <div>
            <span className="font-medium">{userName}</span> changed priority from{' '}
            <span className="px-2 py-1 bg-gray-100 rounded text-sm">{oldValue}</span> to{' '}
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{newValue}</span>
          </div>
        );
      case 'due_date_change':
      case 'due_date_changed':
        return (
          <div>
            <span className="font-medium">{userName}</span> changed due date from{' '}
            <span className="px-2 py-1 bg-gray-100 rounded text-sm">
              {oldValue ? new Date(oldValue).toLocaleDateString() : 'Not set'}
            </span> to{' '}
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
              {newValue ? new Date(newValue).toLocaleDateString() : 'Not set'}
            </span>
          </div>
        );
      case 'resolution_update':
      case 'resolution_updated':
        return (
          <div>
            <span className="font-medium">{userName}</span> updated the resolution
            {newValue && (
              <div className="mt-2 p-3 bg-green-50 border-l-4 border-green-200 rounded text-sm">
                <div className="font-medium text-green-800">New Resolution:</div>
                <div className="text-green-700 mt-1">{newValue}</div>
              </div>
            )}
          </div>
        );
      case 'comment':
      case 'comment_added':
        return (
          <div>
            <span className="font-medium">{userName}</span> added a comment
            {(log.details?.note || log.Note) && (
              <div className="mt-2 p-3 bg-purple-50 border-l-4 border-purple-200 rounded text-sm">
                <div className="text-purple-700">{log.details?.note || log.Note}</div>
              </div>
            )}
          </div>
        );
      case 'attachment':
        return (
          <div>
            <span className="font-medium">{userName}</span> added an attachment
            {newValue && (
              <div className="mt-2 p-3 bg-indigo-50 border-l-4 border-indigo-200 rounded text-sm">
                <div className="text-indigo-700">{newValue}</div>
              </div>
            )}
          </div>
        );
      case 'ticket_created':
        return (
          <div>
            <span className="font-medium">{userName}</span> created this ticket
            {(log.details?.description || log.Description) && (
              <div className="mt-2 p-3 bg-indigo-50 border-l-4 border-indigo-200 rounded text-sm">
                <div className="text-indigo-700">{log.details?.description || log.Description}</div>
              </div>
            )}
          </div>
        );
      case 'assignment_changed':
        return (
          <div>
            <span className="font-medium">{userName}</span> changed assignee from{' '}
            <span className="px-2 py-1 bg-gray-100 rounded text-sm">{oldValue}</span> to{' '}
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">{newValue}</span>
          </div>
        );

      case 'supervisor_change':
      case 'supervisor_changed':
        return (
          <div>
            <span className="font-medium">{userName}</span> updated ticket supervisors
            {(log.details?.description || log.Description) && (
              <div className="mt-1 text-sm text-purple-600 font-medium">{log.details?.description || log.Description}</div>
            )}
            {oldValue && newValue && (
              <div className="mt-1 text-xs text-gray-500">
                <span className="text-red-600">Previous: {oldValue.split(',').join(', ')}</span> → <span className="text-green-600">Current: {newValue.split(',').join(', ')}</span>
              </div>
            )}
          </div>
        );

      case 'supervisor_added':
        return (
          <div>
            <span className="font-medium">{userName}</span> added supervisors:{' '}
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
              {log.description.split(':')[1]?.trim() || 'N/A'}
            </span>
          </div>
        );

      case 'supervisor_removed':
        return (
          <div>
            <span className="font-medium">{userName}</span> removed supervisors:{' '}
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
              {log.description.split(':')[1]?.trim() || 'N/A'}
            </span>
          </div>
        );
      default:
        return (
          <div>
            <span className="font-medium">{userName}</span> performed action: {log.actionType || action || 'Unknown'}
            {(log.details?.description || log.Description) && (
              <div className="mt-1 text-sm text-gray-600">{log.details?.description || log.Description}</div>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading activity logs...</span>
      </div>
    );
  }

  if (activityLogs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-500 text-lg">No activity logs found</p>
        <p className="text-gray-400 text-sm mt-1">Activity will appear here as changes are made to this ticket.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-semibold text-xl text-gray-800">Activity Log ({activityLogs.length})</h4>
      </div>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {activityLogs.map((log, logIdx) => (
            <li key={log.LogID || logIdx}>
              <div className="relative pb-8">
                {logIdx !== activityLogs.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    {getActivityIcon(log.actionType)}
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-800">
                        {getActivityDescription(log)}
                      </div>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      <time dateTime={log.CreatedAt}>
                        {formatRelativeTime(log.CreatedAt)}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActivityLog;
