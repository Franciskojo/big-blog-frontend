import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { POSTS_PER_PAGE } from '../utils/constants';
import '../styles/pages.css';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  const { makeRequest, loading, error } = useApi();
  const { user } = useAuth();

  const fetchMyPosts = async (page = 1) => {
    try {
      const data = await makeRequest('get', '/posts/user/my-posts', {
        page,
        limit: POSTS_PER_PAGE
      });
      
      setPosts(data.posts);
      setTotalPages(data.pagination.total);
      setCurrentPage(data.pagination.current);
      
      // Calculate stats
      const published = data.posts.filter(post => post.published).length;
      const drafts = data.posts.filter(post => !post.published).length;
      setStats({
        total: data.pagination.total,
        published,
        drafts
      });
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await makeRequest('delete', `/posts/${postId}`);
      fetchMyPosts(currentPage); // Refresh the list
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  useEffect(() => {
    fetchMyPosts(currentPage);
  }, [currentPage]);

  if (loading && posts.length === 0) {
    return <LoadingSpinner text="Loading your posts..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="page-header">
          <h1>Author Dashboard</h1>
          <Link to="/create-post" className="btn btn-primary">
            Create New Post
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Posts</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Published</h3>
            <p className="stat-number">{stats.published}</p>
          </div>
          <div className="stat-card">
            <h3>Drafts</h3>
            <p className="stat-number">{stats.drafts}</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="posts-section">
          <h2>My Posts</h2>
          {posts.length === 0 ? (
            <div className="empty-state">
              <h3>No posts yet</h3>
              <p>Start by creating your first blog post!</p>
              <Link to="/create-post" className="btn btn-primary">
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  showActions={true}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            current={currentPage}
            total={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;