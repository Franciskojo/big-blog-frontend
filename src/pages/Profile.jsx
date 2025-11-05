// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/helpers';
import { ROLES } from '../utils/constants';
import '../styles/pages.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalComments: 0,
    pendingComments: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { makeRequest } = useApi();
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user's posts
        const postsData = await makeRequest('get', '/posts/user/my-posts', {
          page: 1,
          limit: 5
        });

        // Fetch user's comments
        const commentsData = await makeRequest('get', '/comments/user/my-comments', {
          page: 1,
          limit: 5
        });

        // Calculate stats
        const publishedPosts = postsData.posts.filter(post => post.published).length;
        const draftPosts = postsData.posts.filter(post => !post.published).length;
        const pendingComments = commentsData.comments.filter(comment => !comment.approved).length;

        setUserStats({
          totalPosts: postsData.posts.length,
          publishedPosts,
          draftPosts,
          totalComments: commentsData.comments.length,
          pendingComments
        });

        setRecentPosts(postsData.posts.slice(0, 3));
        setRecentComments(commentsData.comments.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [makeRequest]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'role-admin';
      case ROLES.AUTHOR:
        return 'role-author';
      case ROLES.READER:
        return 'role-reader';
      default:
        return 'role-reader';
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <LoadingSpinner text="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1>My Profile</h1>
        </div>

        <div className="profile-content">
          {/* User Info Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">
                <div className="avatar-placeholder">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              </div>
              <div className="profile-info">
                <h2>{user.name}</h2>
                <p className="user-email">{user.email}</p>
                <span className={`role-badge ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
                <p className="member-since">
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            {(user.role === ROLES.AUTHOR || user.role === ROLES.ADMIN) && (
              <button
                className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                My Posts
              </button>
            )}
            <button
              className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              My Comments
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Posts</h3>
                  <p className="stat-number">{userStats.totalPosts}</p>
                  <p className="stat-subtitle">
                    {userStats.publishedPosts} published, {userStats.draftPosts} drafts
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Total Comments</h3>
                  <p className="stat-number">{userStats.totalComments}</p>
                  <p className="stat-subtitle">
                    {userStats.pendingComments} pending approval
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Account Type</h3>
                  <p className="stat-number">{user.role}</p>
                  <p className="stat-subtitle">
                    {user.role === ROLES.ADMIN && 'Full platform access'}
                    {user.role === ROLES.AUTHOR && 'Can create and manage posts'}
                    {user.role === ROLES.READER && 'Can read and comment on posts'}
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <div className="activity-section">
                  <h3>Recent Posts</h3>
                  {recentPosts.length === 0 ? (
                    <div className="empty-state">
                      <p>No posts yet</p>
                      {(user.role === ROLES.AUTHOR || user.role === ROLES.ADMIN) && (
                        <a href="/create-post" className="btn btn-primary btn-sm">
                          Create Your First Post
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="activity-list">
                      {recentPosts.map(post => (
                        <div key={post.id} className="activity-item">
                          <div className="activity-content">
                            <h4>{post.title}</h4>
                            <p className="activity-meta">
                              {formatDate(post.createdAt)} • 
                              <span className={`status ${post.published ? 'published' : 'draft'}`}>
                                {post.published ? 'Published' : 'Draft'}
                              </span>
                            </p>
                          </div>
                          <a href={`/edit-post/${post.id}`} className="btn btn-outline btn-sm">
                            Edit
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="activity-section">
                  <h3>Recent Comments</h3>
                  {recentComments.length === 0 ? (
                    <div className="empty-state">
                      <p>No comments yet</p>
                    </div>
                  ) : (
                    <div className="activity-list">
                      {recentComments.map(comment => (
                        <div key={comment.id} className="activity-item">
                          <div className="activity-content">
                            <p className="comment-preview">
                              {comment.content.length > 100 
                                ? `${comment.content.substring(0, 100)}...` 
                                : comment.content
                              }
                            </p>
                            <p className="activity-meta">
                              On "{comment.post.title}" • {formatDate(comment.createdAt)} •
                              <span className={`status ${comment.approved ? 'approved' : 'pending'}`}>
                                {comment.approved ? 'Approved' : 'Pending'}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="posts-tab">
              <div className="tab-header">
                <h3>My Posts</h3>
                <a href="/create-post" className="btn btn-primary">
                  Create New Post
                </a>
              </div>
              
              {recentPosts.length === 0 ? (
                <div className="empty-state large">
                  <h3>No posts yet</h3>
                  <p>Start sharing your thoughts with the community</p>
                  <a href="/create-post" className="btn btn-primary">
                    Create Your First Post
                  </a>
                </div>
              ) : (
                <div className="posts-list">
                  {recentPosts.map(post => (
                    <div key={post.id} className="post-item">
                      <div className="post-info">
                        <h4>{post.title}</h4>
                        <p className="post-meta">
                          {formatDate(post.createdAt)} • 
                          <span className={`status ${post.published ? 'published' : 'draft'}`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span> • 
                          {post.comments?.length || 0} comments
                        </p>
                        {post.excerpt && (
                          <p className="post-excerpt">{post.excerpt}</p>
                        )}
                      </div>
                      <div className="post-actions">
                        <a 
                          href={`/post/${post.id}`} 
                          className="btn btn-outline btn-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                        <a 
                          href={`/edit-post/${post.id}`} 
                          className="btn btn-outline btn-sm"
                        >
                          Edit
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="comments-tab">
              <div className="tab-header">
                <h3>My Comments</h3>
              </div>

              {recentComments.length === 0 ? (
                <div className="empty-state large">
                  <h3>No comments yet</h3>
                  <p>Start engaging with the community by commenting on posts</p>
                </div>
              ) : (
                <div className="comments-list">
                  {recentComments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-content">
                        <p>{comment.content}</p>
                        <div className="comment-meta">
                          <span>On: </span>
                          <a 
                            href={`/post/${comment.postId}`}
                            className="post-link"
                          >
                            {comment.post.title}
                          </a>
                          <span> • {formatDate(comment.createdAt)}</span>
                          <span className={`status ${comment.approved ? 'approved' : 'pending'}`}>
                            {comment.approved ? 'Approved' : 'Pending Approval'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;