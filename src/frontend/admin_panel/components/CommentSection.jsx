import React, { useState, useRef, useEffect } from 'react';
import { toast } from "react-toastify";
import axios from "axios";
import CommentItem from './CommentItem';

const CommentSection = ({ 
  selectedTicket, 
  user
}) => {
  const [comment, setComment] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [userLikedComments, setUserLikedComments] = useState({});
  const [showAllComments, setShowAllComments] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionDropdownPos, setMentionDropdownPos] = useState({ top: 0, left: 0 });
  const [filteredMentions, setFilteredMentions] = useState([]);
  const [commentsList, setCommentsList] = useState([]);
  const [mentionableUsers, setMentionableUsers] = useState([]);
  const textareaRef = useRef(null);

  // Fetch comments when selectedTicket changes
  useEffect(() => {
    if (!selectedTicket?.id) return;
    
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/tickets/${selectedTicket.id}/comments?userId=${user.UserID}`
        );
        const data = res.data;
        setCommentsList(data);

        // Initialize userLikedComments state directly from fetched data
        const likedStatus = {};
        for (const comment of data) {
          likedStatus[comment.CommentID] = comment.UserHasLiked === 1;
        }
        setUserLikedComments(likedStatus);
      } catch (err) {
        console.error("Failed to load comments", err);
      }
    };
    
    fetchComments();
  }, [selectedTicket?.id, user.UserID]);

  // Fetch mentionable users when selectedTicket changes
  useEffect(() => {
    if (selectedTicket) {
      fetch("http://localhost:5000/api/mentionable-users")
        .then((res) => res.json())
        .then(setMentionableUsers)
        .catch(console.error);
    }
  }, [selectedTicket]);

  const handleAddComment = async () => {
    if (!selectedTicket || (!comment.trim() && !attachmentFile)) {
      toast.warn("Comment text or an attachment is required.");
      return;
    }

    const formData = new FormData();
    formData.append("ticketId", selectedTicket.id);
    formData.append("userId", user.UserID);
    formData.append("comment", comment.trim());
    if (replyingTo) {
      formData.append("replyToCommentId", replyingTo.commentId);
    }
    if (attachmentFile) {
      formData.append("file", attachmentFile);
    }

    // Extract mentions from comment text
    let mentionedUserIds = [];
    const processedComment = comment.trim();
    const lowerCaseComment = processedComment.toLowerCase();
    const sortedMentionableUsers = [...mentionableUsers].sort((a, b) => b.FullName.length - a.FullName.length);

    for (const mentionUser of sortedMentionableUsers) {
      const lowerCaseFullName = mentionUser.FullName.toLowerCase().trim();
      if (lowerCaseComment.includes(`@${lowerCaseFullName}`)) {
        mentionedUserIds.push(mentionUser.UserID);
      }
    }
    
    mentionedUserIds = [...new Set(mentionedUserIds)];

    if (mentionedUserIds.length > 0) {
      formData.append("mentionedUserIds", mentionedUserIds.join(","));
    }

    try {
      await axios.post(
        `http://localhost:5000/api/tickets/${selectedTicket.id}/comments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      // Clear form fields
      setComment("");
      setAttachmentFile(null);
      setReplyingTo(null);
      
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
      
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
      
      toast.success("Comment added successfully");
      
      // Refresh comments
      const res = await axios.get(`http://localhost:5000/api/tickets/${selectedTicket.id}/comments?userId=${user.UserID}`);
      setCommentsList(res.data);
      
      const likedStatus = {};
      for (const commentData of res.data) {
        likedStatus[commentData.CommentID] = commentData.UserHasLiked === 1;
      }
      setUserLikedComments(likedStatus);
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);

    const caret = e.target.selectionStart;
    const text = e.target.value.slice(0, caret);
    const match = text.match(/@([\w\s]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setShowMentionDropdown(true);
      setMentionDropdownPos({
        top: e.target.offsetTop + e.target.offsetHeight,
        left: e.target.offsetLeft,
      });
      setFilteredMentions(
        mentionableUsers.filter((u) =>
          u.FullName.toLowerCase().includes(match[1].toLowerCase())
        )
      );
    } else {
      setShowMentionDropdown(false);
      setMentionQuery("");
    }
  };

  const handleMentionSelect = (user) => {
    const textarea = textareaRef.current;
    const caret = textarea.selectionStart;
    const text = comment;
    const match = text.slice(0, caret).match(/@([\w\s]*)$/);
    if (match) {
      const before = text.slice(0, caret - match[0].length);
      const after = text.slice(caret);
      const mentionText = `@${user.FullName} `;
      const newComment = before + mentionText + after;
      setComment(newComment);
      setShowMentionDropdown(false);
      setMentionQuery("");
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          before.length + mentionText.length,
          before.length + mentionText.length
        );
      }, 0);
    }
  };

  const handleLikeToggle = async (commentId) => {
    const hasLiked = userLikedComments[commentId];
    try {
      if (hasLiked) {
        await axios.delete(
          `http://localhost:5000/api/comments/${commentId}/like`,
          { data: { userId: user.UserID } }
        );
        toast.info("Comment unliked.");
      } else {
        await axios.post(
          `http://localhost:5000/api/comments/${commentId}/like`,
          { userId: user.UserID }
        );
        toast.success("Comment liked!");
      }
      setUserLikedComments((prev) => ({ ...prev, [commentId]: !hasLiked }));
      const res = await axios.get(`http://localhost:5000/api/tickets/${selectedTicket.id}/comments?userId=${user.UserID}`);
      setCommentsList(res.data);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error(`Failed to ${hasLiked ? "unlike" : "like"} comment.`);
    }
  };

  const handleReplyClick = (commentId, userName) => {
    setReplyingTo({ commentId, userName });
    setComment(`@${userName} `);
    textareaRef.current.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setComment("");
  };

  const toggleExpandedReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <div className="relative mb-6 p-6 border border-gray-200 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img
              src={
                user?.ProfileImagePath
                  ? `http://localhost:5000/uploads/profile_images/${user.ProfileImagePath}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.FullName || 'User')}&background=random&color=fff`
              }
              alt={user?.FullName || 'User'}
              className="w-12 h-12 rounded-full object-cover ring-3 ring-blue-100 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <label className="block text-lg font-semibold text-gray-800 mb-1">
              Share your thoughts
            </label>
            <p className="text-sm text-gray-500">
              What would you like to discuss about this ticket?
            </p>
          </div>
        </div>
        
        {replyingTo && (
          <div className="flex items-center gap-3 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-blue-800 font-medium">Replying to</span>
              <span className="font-bold text-blue-900 ml-2">@{replyingTo.userName}</span>
            </div>
            <button
              onClick={handleCancelReply}
              className="p-2 text-blue-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
              title="Cancel reply"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex flex-col gap-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={4}
              value={comment}
              onChange={handleCommentChange}
              className="block w-full rounded-2xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none p-4 text-base transition duration-300 ease-in-out placeholder-gray-400 bg-gray-50 focus:bg-white"
              placeholder="Share your thoughts... Use @ to mention team members"
              style={{ 
                minHeight: 120,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '16px',
                lineHeight: '1.5'
              }}
            />
            {comment.trim() && (
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-white bg-opacity-90 rounded-lg shadow-sm">
                <span className="text-xs text-gray-500 font-medium">
                  {comment.length} characters
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50">
          <input
            type="file"
            onChange={(e) => setAttachmentFile(e.target.files[0])}
            className="hidden"
            id="file-upload"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4"
          >
            <div className="p-3 bg-white rounded-full shadow-sm">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {attachmentFile ? `📎 ${attachmentFile.name}` : 'Click to attach file or drag and drop'}
            </span>
            <span className="text-xs text-gray-500">
              Images, Videos, Documents, PDFs supported (Max 10MB)
            </span>
          </label>
        </div>
        
        {attachmentFile && (
          <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg flex items-center gap-3 shadow-sm">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-green-100 rounded-full">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm text-green-800 font-medium block">
                  File Ready to Upload
                </span>
                <span className="text-xs text-green-600">
                  📎 {attachmentFile.name} ({(attachmentFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setAttachmentFile(null);
                const fileInput = document.getElementById('file-upload');
                if (fileInput) fileInput.value = '';
              }}
              className="p-1 text-green-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
              title="Remove file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {showMentionDropdown && filteredMentions.length > 0 && (
          <div
            className="absolute z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl mt-2 max-h-64 overflow-y-auto backdrop-blur-sm"
            style={{
              top: mentionDropdownPos.top + 10,
              left: mentionDropdownPos.left,
              minWidth: 280,
            }}
          >
            <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
              <h4 className="text-sm font-semibold text-gray-700">Mention Team Members</h4>
            </div>
            {filteredMentions.map((mentionUser, index) => (
              <div
                key={mentionUser.UserID}
                className={`px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-all duration-200 ${
                  index === filteredMentions.length - 1 ? 'rounded-b-2xl' : 'border-b border-gray-50'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleMentionSelect(mentionUser);
                }}
              >
                <div className="relative">
                  <img
                    src={
                      mentionUser.ProfileImagePath
                        ? `http://localhost:5000/uploads/${mentionUser.ProfileImagePath}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(mentionUser.FullName)}&background=random&color=fff`
                    }
                    alt={mentionUser.FullName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-700">
                      @{mentionUser.FullName}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      mentionUser.Role === 'Admin' ? 'bg-red-100 text-red-700' :
                      mentionUser.Role === 'Supervisor' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {mentionUser.Role}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Click to mention
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Use @ to mention teammates</span>
            </div>
            {attachmentFile && (
              <div className="flex items-center gap-1 text-green-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>File attached</span>
              </div>
            )}
          </div>
          <button
            onClick={handleAddComment}
            disabled={!comment.trim() && !attachmentFile}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {replyingTo ? 'Post Reply' : 'Share Comment'}
          </button>
        </div>
      </div>
      
      {/* Comments List */}
      <div className="mt-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-semibold text-xl text-gray-800">Comments ({commentsList.length})</h4>
          {commentsList.length > 5 && (
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
            >
              {showAllComments ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Show Less
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  View All Comments
                </>
              )}
            </button>
          )}
        </div>
        
        {commentsList.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 text-lg">No comments yet</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to start the conversation!</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {commentsList
              .filter(comment => !comment.ReplyToCommentID)
              .slice().reverse()
              .slice(0, showAllComments ? undefined : 5)
              .map((c) => (
              <CommentItem
                key={c.CommentID}
                comment={c}
                allComments={commentsList}
                currentUser={user}
                onReplyClick={handleReplyClick}
                onLikeToggle={handleLikeToggle}
                userLikedComments={userLikedComments}
                mentionableUsers={mentionableUsers}
                toggleExpandedReplies={toggleExpandedReplies}
                expandedReplies={expandedReplies}
              />
            ))}
          </ul>
        )}
        
        {commentsList.filter(comment => !comment.ReplyToCommentID).length > 5 && !showAllComments && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAllComments(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              View {commentsList.filter(comment => !comment.ReplyToCommentID).length - 5} more comments
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
