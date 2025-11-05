import React from "react";
import { Link } from "react-router-dom";
import { formatDate, truncateText } from "../utils/helpers";
import "../styles/components.css";

const PostCard = ({ post, showActions = false, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      onDelete(post.id);
    }
  };

  // ✅ Handle Cloudinary or local image
  const getImageUrl = (url) => {
    if (!url) return null;
    // If hosted image (Cloudinary, etc.)
    if (url.startsWith("http")) return url;
    // If local backend URL
    return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${url}`;
  };

  return (
    <article className="post-card">
      {/* Post Image */}
      {post.image && (
        <div className="post-image">
          <img
            src={getImageUrl(post.image)}
            alt={post.title}
            className="post-image-img"
            loading="lazy"
          />
        </div>
      )}

      <div className="post-content">
        {/* Header */}
        <div className="post-header">
          <h2 className="post-title">
            <Link to={`/post/${post.id}`}>{post.title}</Link>
          </h2>

          <div className="post-meta">
            <span className="author">By {post.author?.name || "Unknown"}</span>
            <span className="date">{formatDate(post.createdAt)}</span>

            {post.category && (
              <span className="category">
                in{" "}
                <Link to={`/category/${post.category.slug}`}>
                  {post.category.name}
                </Link>
              </span>
            )}

            <span className="comment-count">
              {post.commentCount || post.comments?.length || 0} comments
            </span>
          </div>
        </div>

        {/* Excerpt */}
        {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}

        {/* Content Preview */}
        <div className="post-content-preview">
          <p>{truncateText(post.content, 200)}</p>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="post-actions">
            <Link
              to={`/edit-post/${post.id}`}
              className="btn btn-outline btn-sm"
            >
              Edit
            </Link>
            <button onClick={handleDelete} className="btn btn-danger btn-sm">
              Delete
            </button>
            {!post.published && <span className="draft-badge">Draft</span>}
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;
