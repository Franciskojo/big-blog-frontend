import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/helpers';
import '../styles/components.css';

const Comment = ({ comment, onEdit, onDelete, showActions = false }) => {
  const { user } = useAuth();

  const canModify = user && (user.id === comment.authorId || user.role === 'ADMIN');

  return (
    <div className={`comment ${!comment.approved ? 'comment-pending' : ''}`}>
      <div className="comment-header">
        <div className="comment-author">
          <strong>{comment.author.name}</strong>
          {!comment.approved && <span className="pending-badge">Pending</span>}
        </div>
        <div className="comment-meta">
          <span>{formatDate(comment.createdAt)}</span>
        </div>
      </div>
      
      <div className="comment-content">
        <p>{comment.content}</p>
      </div>

      {showActions && canModify && (
        <div className="comment-actions">
          <button 
            onClick={() => onEdit(comment)}
            className="btn btn-outline btn-xs"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(comment.id)}
            className="btn btn-danger btn-xs"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default Comment;