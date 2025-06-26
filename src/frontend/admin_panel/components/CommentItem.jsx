import React from 'react';

function CommentItem({
  comment,
  allComments,
  currentUser,
  onReplyClick,
  onLikeToggle,
  userLikedComments,
  mentionableUsers,
  toggleExpandedReplies,
  expandedReplies
}) {
  const nestedReplies = allComments
    .filter((c) => c.ReplyToCommentID === comment.CommentID)
    .sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));

  // Helper for relative time
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

  const isImageAttachment = (fileType) => fileType && fileType.startsWith('image/');
  const isVideoAttachment = (fileType) => fileType && fileType.startsWith('video/');
  const isAudioAttachment = (fileType) => fileType && fileType.startsWith('audio/');
  const isPDFAttachment = (fileType) => fileType && fileType === 'application/pdf';

  const renderCommentTextWithMentions = (text) => {
    const parts = [];
    // Sort mentionable users by length of FullName in descending order
    const sortedMentionableUsers = [...mentionableUsers].sort((a, b) => b.FullName.length - a.FullName.length);

    let segments = [{ type: 'text', value: text }];

    for (const user of sortedMentionableUsers) {
      const escapedFullName = user.FullName.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&'); // Correct escaping for regex
      const mentionRegex = new RegExp(`@${escapedFullName}`, 'gi');
      const newSegments = [];

      for (const segment of segments) {
        if (segment.type === 'mention') {
          newSegments.push(segment); // Already a mention, keep it
          continue;
        }

        let lastSplitIndex = 0;
        let match;
        while ((match = mentionRegex.exec(segment.value)) !== null) {
          const preMatchText = segment.value.substring(lastSplitIndex, match.index);
          if (preMatchText) {
            newSegments.push({ type: 'text', value: preMatchText });
          }
          newSegments.push({ type: 'mention', value: match[0], user: user });
          lastSplitIndex = match.index + match[0].length;
        }
        const remainingText = segment.value.substring(lastSplitIndex);
        if (remainingText) {
          newSegments.push({ type: 'text', value: remainingText });
        }
      }
      segments = newSegments;
    }

    // Convert segments into JSX elements
    return segments.map((segment, index) => {
      if (segment.type === 'mention') {
        return (
          <span key={index} className="text-blue-600 font-semibold bg-blue-50 px-1 rounded">
            {segment.value}
          </span>
        );
      } else {
        return segment.value;
      }
    });
  };

  return (
    <li className="border border-gray-200 rounded-lg bg-white p-6 flex flex-col shadow-sm hover:shadow-md transition-all duration-200 ease-in-out">
      <div className="flex items-start flex-1">
        {/* Profile Picture */}
        <div className="relative">
          <img
            src={
              comment.ProfileImagePath
                ? `http://localhost:5000/uploads/${comment.ProfileImagePath}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.FullName)}&background=random&color=fff`
            }
            alt={comment.FullName}
            className="w-12 h-12 rounded-full mr-4 object-cover ring-2 ring-gray-100"
          />
          {/* Online status indicator could be added here */}
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="flex items-center mb-1">
            <span className="font-semibold text-gray-900 mr-2">{comment.FullName}</span>
            <span className="text-gray-500 text-sm">• {formatRelativeTime(comment.CreatedAt)}</span>
          </div>
          
          {/* Reply-to information */}
          {comment.ReplyToCommentID && comment.RepliedToUserName && (
            <div className="text-sm text-blue-600 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Replying to <span className="font-medium">@{comment.RepliedToUserName}</span>
            </div>
          )}

          {/* Comment text */}
          <div className={`text-gray-800 leading-relaxed mb-3 ${comment.ReplyToCommentID ? 'bg-gray-50 p-3 rounded-lg border-l-4 border-blue-200' : ''}`}>
            <div className="whitespace-pre-wrap">
              {renderCommentTextWithMentions(comment.CommentText)}
            </div>
          </div>

          {/* Display Attachment if exists */}
          {comment.AttachmentFullUrl && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2 font-medium">📎 Attachment:</p>
              {
                isImageAttachment(comment.AttachmentFileType) ? (
                  <a href={comment.AttachmentFullUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={comment.AttachmentFullUrl} alt={comment.AttachmentFileName} className="max-w-sm h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow" />
                  </a>
                ) : isVideoAttachment(comment.AttachmentFileType) ? (
                  <video controls src={comment.AttachmentFullUrl} className="max-w-sm h-auto rounded-lg shadow-sm"></video>
                ) : isAudioAttachment(comment.AttachmentFileType) ? (
                  <audio controls src={comment.AttachmentFullUrl} className="w-full max-w-sm"></audio>
                ) : isPDFAttachment(comment.AttachmentFileType) ? (
                  <a href={comment.AttachmentFullUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    {comment.AttachmentFileName}
                  </a>
                ) : (
                  <a href={comment.AttachmentFullUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                    </svg>
                    {comment.AttachmentFileName}
                  </a>
                )
              }
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLikeToggle(comment.CommentID)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  userLikedComments[comment.CommentID] 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className={`w-4 h-4 ${userLikedComments[comment.CommentID] ? 'fill-current text-red-600' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {comment.LikesCount || 0}
              </button>
            </div>
            
            <button
              onClick={() => onReplyClick(comment.CommentID, comment.FullName)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply
            </button>
          </div>
        </div>
      </div>
      
      {/* Nested replies */}
      {nestedReplies.length > 0 && (
        <div className="mt-4 pl-16">
          <div className="border-l-2 border-gray-200 pl-6">
            {nestedReplies.length > 2 && (
              <button 
                onClick={() => toggleExpandedReplies(comment.CommentID)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedReplies[comment.CommentID] ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
                {expandedReplies[comment.CommentID] ? 'Hide replies' : `View ${nestedReplies.length} replies`}
              </button>
            )}
            <ul className="space-y-4">
              {(expandedReplies[comment.CommentID] ? nestedReplies : nestedReplies.slice(0, 2)).map((reply) => (
                <CommentItem
                  key={reply.CommentID}
                  comment={reply}
                  allComments={allComments}
                  currentUser={currentUser}
                  onReplyClick={onReplyClick}
                  onLikeToggle={onLikeToggle}
                  userLikedComments={userLikedComments}
                  mentionableUsers={mentionableUsers}
                  toggleExpandedReplies={toggleExpandedReplies}
                  expandedReplies={expandedReplies}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

export default CommentItem;
