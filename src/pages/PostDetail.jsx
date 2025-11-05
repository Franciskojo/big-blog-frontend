import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import Comment from "../components/Comment";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate } from "../utils/helpers";
import { COMMENTS_PER_PAGE, ROLES } from "../utils/constants";
import "../styles/pages.css";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { makeRequest, loading, error } = useApi();
  const { user, isAuthenticated } = useAuth();

  const fetchPost = async () => {
    try {
      const data = await makeRequest("get", `/posts/${id}`);
      setPost(data.post);
    } catch (err) {
      console.error("Failed to fetch post:", err);
    }
  };

  const fetchComments = async (page = 1) => {
    try {
      const data = await makeRequest("get", `/comments/post/${id}`, {
        page,
        limit: COMMENTS_PER_PAGE,
      });

      setComments(data.comments);
      setTotalPages(data.pagination.total);
      setCurrentPage(data.pagination.current);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setCommentError("");

    try {
      await makeRequest("post", "/comments", {
        content: newComment,
        postId: id,
      });

      setNewComment("");
      fetchComments(1); // Refresh comments
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await makeRequest("delete", `/comments/${commentId}`);
      fetchComments(currentPage); // Refresh comments
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  if (loading && !post) {
    return <LoadingSpinner text="Loading post..." />;
  }

  if (error && !post) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <div className="alert alert-error">Post not found</div>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <div className="container">
        <article className="post-detail">
          <header className="post-header">
            <nav className="breadcrumb">
              <Link to="/">Home</Link> / <span>{post.title}</span>
            </nav>

            <h1 className="post-title">{post.title}</h1>

            <div className="post-meta">
              <div className="author-info">
                <strong>By {post.author?.name}</strong>
              </div>
              <div className="post-date">{formatDate(post.createdAt)}</div>
              {!post.published && <div className="draft-badge">Draft</div>}
            </div>

            {post.excerpt && (
              <div className="post-excerpt">
                <p>{post.excerpt}</p>
              </div>
            )}

            {/* Add Post Image */}
            {post.image && (
              <div className="post-image-large">
                <img
                  src={
                    post.image.startsWith("http")
                      ? post.image
                      : `http://localhost:5000${post.image}`
                  }
                  alt={post.title}
                  className="post-detail-image"
                />
              </div>
            )}
          </header>

          <div className="post-content">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Comments Section */}
        <section className="comments-section">
          <h2>Comments ({comments.length})</h2>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="comment-form">
              <div className="form-group">
                <label htmlFor="comment">Add a Comment</label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="4"
                  placeholder="Share your thoughts..."
                  className={commentError ? "input-error" : ""}
                />
                {commentError && (
                  <span className="error-message">{commentError}</span>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>
                Please <Link to="/login">login</Link> to leave a comment.
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="empty-state">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onDelete={handleDeleteComment}
                  showActions={isAuthenticated}
                />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <Pagination
              current={currentPage}
              total={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default PostDetail;
