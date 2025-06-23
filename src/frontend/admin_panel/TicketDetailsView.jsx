import React, { useState, useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react"; // Keep if you still want the icon elsewhere
import { toast } from "react-toastify";
import TicketLogView from "./TicketLogView";
import ChatSection from "./ChatSection"; // Import ChatSection
import axios from "axios";

// NOTE: USER and SUPPORT constants should ideally come from a global context or App.js if used broadly.
export const USER = {
  id: "user1",
  name: "You",
  avatar: "https://i.pravatar.cc/40?u=user1",
};

export const SUPPORT = {
  id: "support",
  name: "Support",
  avatar: "https://i.pravatar.cc/40?u=support",
};

export default function TicketDetailsView({
  selectedTicket,
  onBack,
  loggedInUser,
  handleUpdateTicket,
  handleStatusChange,
  handleDueDateChange,
  evidenceList,
  fetchEvidence, // Still passed, but now mainly for reference or future use if internal to evidence section
}) {
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState([]);
  // const [chatMode, setChatMode] = useState(false); // REMOVE: No longer a separate modal toggle
  const [showProblemModal, setShowProblemModal] = useState(false);
  // Add 'chat' as a possible activeTab value
  const [activeTab, setActiveTab] = useState('details');
  const [commentsList, setCommentsList] = useState([]);
  const [mentionableUsers, setMentionableUsers] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionDropdownPos, setMentionDropdownPos] = useState({ top: 0, left: 0 });
  const [filteredMentions, setFilteredMentions] = useState([]);
  const textareaRef = useRef(null);

  // Local state for the ticket details that can be modified before saving
  const [localTicket, setLocalTicket] = useState(selectedTicket);

  // Update localTicket if selectedTicket prop changes
  useEffect(() => {
    setLocalTicket(selectedTicket);
    // When selectedTicket changes, reset the active tab to 'details' for the new ticket
    setActiveTab('details');
  }, [selectedTicket]);

  // Fetch comments for the selected ticket
  useEffect(() => {
    if (!localTicket?.id) return; // Use localTicket.id
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/tickets/${localTicket.id}/comments`);
        const data = await res.json();
        setCommentsList(data);
      } catch (err) {
        console.error('Failed to load comments', err);
      }
    };
    fetchComments();
  }, [localTicket?.id]); // Re-fetch comments if localTicket changes

  // Fetch mentionable users (can remain here)
  useEffect(() => {
    if (localTicket) {
      fetch('http://localhost:5000/api/mentionable-users')
        .then(res => res.json())
        .then(setMentionableUsers)
        .catch(console.error);
    }
  }, [localTicket]);

  const handleAddComment = async () => {
    if (!localTicket || !comment.trim()) return; // Use localTicket

    const mentionMatches = comment.match(/@([\w\s]+)/g) || [];
    const mentionedNames = mentionMatches.map(m => m.slice(1).trim());
    const mentionedUserIds = mentionableUsers
      .filter(u => mentionedNames.includes(u.FullName))
      .map(u => u.UserID);

    try {
      await axios.post(`http://localhost:5000/api/tickets/${localTicket.id}/comments`, { // Use localTicket
        comment: comment.trim(),
        userId: loggedInUser.UserID,
        mentions: mentionMatches.join(','),
        mentionedUserIds,
      });
      setComment('');
      toast.success('Comment added successfully');
      // Refresh comments after adding a new one
      const res = await fetch(`http://localhost:5000/api/tickets/${localTicket.id}/comments`);
      setCommentsList(await res.json());
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Helper functions for mentions (remain here)
  function handleCommentChange(e) {
    setComment(e.target.value);

    const caret = e.target.selectionStart;
    const text = e.target.value.slice(0, caret);
    const match = text.match(/@([\w\s]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setShowMentionDropdown(true);
      const { top, left } = getCaretCoordinates(e.target, caret);
      setMentionDropdownPos({ top: top + 20, left: left });
      setFilteredMentions(
        mentionableUsers.filter(u =>
          u.FullName.toLowerCase().includes(match[1].toLowerCase())
        )
      );
    } else {
      setShowMentionDropdown(false);
      setMentionQuery('');
    }
  }

  function handleMentionKeyUp(e) { /* ... */ }
  function handleMentionSelect(mentionUser) { /* ... */ }
  const getCaretCoordinates = (element, position) => { /* ... */ };

  const handleLocalStatusChange = (e) => {
    const newStatus = e.target.value;
    const previousStatus = localTicket.status; // Get previous status from local state
    setLocalTicket(prev => ({ ...prev, status: newStatus }));
    handleStatusChange(localTicket.id, newStatus, previousStatus); // Call parent's handler
  };

  const handleLocalDueDateChange = (e) => {
    const newDate = e.target.value;
    const previousDate = localTicket.dueDate; // Get previous date from local state
    setLocalTicket(prev => ({ ...prev, dueDate: newDate }));
    handleDueDateChange(localTicket.id, newDate, previousDate); // Call parent's handler
  };

  const handleLocalResolutionChange = (e) => {
    setLocalTicket(prev => ({ ...prev, resolution: e.target.value }));
  };

  if (!localTicket) { // Check localTicket
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        Loading ticket details...
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 ">
      {/* Navigation and Back Button */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center rounded-lg mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
          Ticket #{localTicket.id} Details
        </h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
        >
          &larr; Back to Tickets
        </button>
      </nav>

      {/* Tabs for Details, Activity Log, Comments, and NOW Chat */}
      <div className="bg-white rounded-xl p-4 shadow-lg">
        <div className="border-b mb-4">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 text-base font-medium ${activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-2 text-base font-medium ${activeTab === 'activity'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Activity Log
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-2 text-base font-medium ${activeTab === 'comments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Comments
            </button>
            {/* NEW CHAT TAB */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`pb-2 text-base font-medium ${activeTab === 'chat'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Chat
            </button>
          </nav>
        </div>

        {/* Content based on activeTab */}
        <div className="h-[580px] overflow-y-auto">
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT: Ticket Info */}
              <div className="space-y-3">
                <p>
                  <strong>Status:</strong> {localTicket.status}
                </p>
                <p>
                  <strong>Date:</strong> {localTicket.date}
                </p>
                <p>
                  <strong>Priority:</strong> {localTicket.priority}
                </p>
                <p className="text-sm">
                  <strong>Problem:</strong>{" "}
                  {localTicket.problem.length > 100 ? (
                    <>
                      {localTicket.problem.slice(0, 100)}...
                      <button
                        onClick={() => setShowProblemModal(true)}
                        className="text-blue-600 hover:underline ml-1"
                      >
                        See More
                      </button>
                    </>
                  ) : (
                    localTicket.problem
                  )}
                </p>
                {showProblemModal && (
                  <div className="fixed inset-0 z-50 bg-black/40 bg-opacity-40 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full max-h-[80vh]">
                      <h2 className="text-lg font-semibold mb-4">
                        Full Problem Description
                      </h2>
                      <div className="text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-60 pr-2">
                        {localTicket.problem}
                      </div>
                      <div className="text-right mt-4">
                        <button
                          onClick={() => setShowProblemModal(false)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <p>
                  <strong>System Name:</strong> {localTicket.systemName}
                </p>
                <p>
                  <strong>User Name:</strong> {localTicket.userName}
                </p>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Change Status
                  </label>
                  <select
                    value={localTicket.status}
                    onChange={handleLocalStatusChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={localTicket.dueDate || ""}
                    onChange={handleLocalDueDateChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Resolution Summary
                  </label>
                  <textarea
                    rows={3}
                    value={localTicket.resolution || ""}
                    onChange={handleLocalResolutionChange}
                    placeholder="Add summary..."
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              {/* RIGHT: Evidence Files */}
              <div className="space-y-4">
                <h4 className="font-semibold mb-2">Evidence Files</h4>
                {evidenceList.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No evidence files available.
                  </p>
                ) : (
                  <div className=" overflow-y-auto grid grid-cols-2 gap-4 p-2 border rounded bg-gray-50 h-[300px]">
                    {evidenceList.map((evi, index) => {
                      const fileUrl = `http://localhost:5000/${evi.FilePath}`;
                      const fileName = evi.FilePath.split("/").pop();

                      const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
                      const isPDF = /\.pdf$/i.test(fileName);
                      const isVideo = /\.(mp4|webm|ogg)$/i.test(fileName);
                      const isAudio = /\.(mp3|wav|ogg)$/i.test(fileName);
                      const isDoc = /\.(docx?|xlsx?)$/i.test(fileName);

                      return (
                        <div
                          key={index}
                          className="border rounded p-2 bg-white shadow-sm flex flex-col items-center text-center"
                        >
                          {isImage ? (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                              <img
                                src={fileUrl}
                                alt={fileName}
                                className="w-24 h-24 object-cover rounded hover:opacity-90 transition"
                              />
                            </a>
                          ) : isPDF ? (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
                              📄 {fileName}
                            </a>
                          ) : isVideo ? (
                            <video controls className="w-24 h-24 rounded" title={fileName}>
                              <source src={fileUrl} type={`video/${fileName.split(".").pop()}`} />
                              Your browser does not support the video tag.
                            </video>
                          ) : isAudio ? (
                            <audio controls className="w-full" title={fileName}>
                              <source src={fileUrl} type={`audio/${fileName.split(".").pop()}`} />
                              Your browser does not support the audio element.
                            </audio>
                          ) : isDoc ? (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                              📄 {fileName}
                            </a>
                          ) : (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              📎 {fileName}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-start pt-2"> {/* Removed chat button here */}
                  <button
                    onClick={() => handleUpdateTicket(localTicket)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'activity' ? (
            <div className="space-y-4">
              {localTicket && <TicketLogView ticketId={localTicket.id} />}
            </div>
          ) : activeTab === 'comments' ? (
            <div className="mt-8">
              <h4 className="font-semibold text-xl text-gray-800 mb-4">Comments</h4>
              <div className="mb-4 relative">
                <textarea
                  ref={textareaRef}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  placeholder="Add a comment... Type @ to mention someone"
                  value={comment}
                  onChange={handleCommentChange}
                  onKeyUp={handleMentionKeyUp}
                ></textarea>
                {showMentionDropdown && filteredMentions.length > 0 && (
                  <ul
                    style={{ top: mentionDropdownPos.top, left: mentionDropdownPos.left }}
                    className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto w-48"
                  >
                    {filteredMentions.map(mentionUser => (
                      <li
                        key={mentionUser.UserID}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleMentionSelect(mentionUser)}
                      >
                        {mentionUser.FullName}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={handleAddComment}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Add Comment
                </button>
              </div>
              <div className="mt-8">
                {commentsList.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 border rounded-lg bg-white shadow-sm">No comments yet. Be the first to add one!</p>
                ) : (
                  <ul className="space-y-4">
                    {commentsList.slice().reverse().map((c) => (
                      <li key={c.CommentID} className="border border-gray-200 rounded-lg bg-white p-4 flex flex-col sm:flex-row sm:items-start justify-between shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-900 mb-1">{c.FullName}</div>
                          {c.Mentions && c.Mentions.trim() && (
                            <div className="text-sm text-blue-600 font-medium mb-2 flex flex-wrap items-center gap-x-2">
                              {c.Mentions.split(',').map((m, idx) =>
                                m.trim() ? (
                                  <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">{m.trim()}</span>
                                ) : null
                              )}
                            </div>
                          )}
                          <div className="mt-2 text-gray-800 leading-relaxed whitespace-pre-wrap text-base">{c.CommentText}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-3 sm:mt-0 sm:ml-4 text-right flex-shrink-0 min-w-[140px]">
                          {new Date(c.CreatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : activeTab === 'chat' ? ( // NEW: Chat Section content
            <div className="h-[580px] p-4 bg-gray-100 rounded-lg flex flex-col">
              <ChatSection
                user={localTicket.user} // Assuming localTicket.user is the user ID/info
                supportUser={localTicket.assignedBy} // Assuming localTicket.assignedBy is the supervisor ID/info
                initialMessages={[]} // You might want to fetch initial messages for the chat
                ticket={localTicket}
                ticketId={localTicket.id}
                role={"Supervisor"} // Adjust role based on actual loggedInUser.Role
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Remove the chatMode modal entirely as it's now a tab */}
      {/* {chatMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative max-w-lg h-[600px] p-4 bg-gray-200 rounded-lg shadow-lg flex flex-col">
            <button
              onClick={() => setChatMode(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
              aria-label="Close Chat"
            >
              🗙
            </button>
            <ChatSection
              user={localTicket.user}
              supportUser={localTicket.assignedBy}
              initialMessages={[]}
              ticket={localTicket}
              ticketId={localTicket.id}
              role={"Supervisor"}
            />
          </div>
        </div>
      )} */}
    </div>
  );
}