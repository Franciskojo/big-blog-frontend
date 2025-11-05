import React, { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import { ROLES } from "../utils/constants";
import { formatDate, capitalizeFirst } from "../utils/helpers";
import "../styles/pages.css";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { makeRequest, loading, error } = useApi();
  const { user } = useAuth();
  const { currentUser } = useAuth();

  // Fetch stats for overview tab
  const fetchStats = async () => {
    try {
      const data = await makeRequest("get", "/users/stats");
      setStats(data.stats);
      setAnalytics(data.analytics);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Fetch users with pagination and filters
  const fetchUsers = async (page = 1, search = "", role = "") => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (role) params.role = role;

      const data = await makeRequest("get", "/users", params);
      setUsers(data.users);
      setTotalPages(data.pagination.total);
      setTotalUsers(data.pagination.totalUsers);
      setCurrentPage(data.pagination.current);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending comments
  const fetchPendingComments = async () => {
    try {
      const data = await makeRequest("get", "/comments/admin/pending");
      setPendingComments(data.comments);
    } catch (err) {
      console.error("Failed to fetch pending comments:", err);
    }
  };

  // Handle role update
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await makeRequest("patch", `/users/${userId}/role`, { role: newRole });
      fetchUsers(currentPage, searchQuery, roleFilter); // Refresh users list
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to update user role:", err);
    }
  };

  // Handle user deletion
  // In the AdminPanel.jsx, update the handleDeleteUser function:

const handleDeleteUser = async (userId, userName, userEmail) => {
  if (!window.confirm(`Are you sure you want to delete user "${userName}" (${userEmail})? This action cannot be undone and will delete all their posts and comments.`)) {
    return;
  }

  try {
    const result = await makeRequest('delete', `/users/${userId}`);
    
    // Show success message
    alert(result.message || 'User deleted successfully');
    
    // Refresh users list
    fetchUsers(currentPage, searchQuery, roleFilter);
  } catch (err) {
    console.error('Failed to delete user:', err);
    alert(`Failed to delete user: ${err.message}`);
  }
};

// And update the delete button in the users table:
<button
  onClick={() => handleDeleteUser(user.id, user.name, user.email)}
  className="btn btn-danger btn-xs"
  title="Delete user"
  disabled={user.id === currentUser?.id} 
>
  Delete
</button>

  // Handle comment actions
  const handleCommentAction = async (commentId, action) => {
    try {
      if (action === "approve") {
        await makeRequest("put", `/comments/${commentId}`, { approved: true });
      } else if (action === "delete") {
        await makeRequest("delete", `/comments/${commentId}`);
      }
      fetchPendingComments(); 
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchQuery, roleFilter);
  };

  // Handle role filter change
  const handleRoleFilterChange = (e) => {
    const newRole = e.target.value;
    setRoleFilter(newRole);
    setCurrentPage(1);
    fetchUsers(1, searchQuery, newRole);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setCurrentPage(1);
    fetchUsers(1);
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "overview") {
      fetchStats();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "comments") {
      fetchPendingComments();
    }
  }, [activeTab]);

  // Refresh users when page changes
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers(currentPage, searchQuery, roleFilter);
    }
  }, [currentPage]);

  if (loading && activeTab === "overview" && !stats.totalUsers) {
    return <LoadingSpinner text="Loading admin panel..." />;
  }

  return (
    <div className="admin-panel">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1>Admin Panel</h1>
              <p>Welcome, {user?.name}. Manage your blog platform.</p>
            </div>
            <div className="admin-actions">
              <button
                onClick={fetchStats}
                className="btn btn-outline btn-sm"
                title="Refresh data"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <i className="tab-icon">📊</i>
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <i className="tab-icon">👥</i>
            Users
            {stats.totalUsers && (
              <span className="tab-badge">{stats.totalUsers}</span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            <i className="tab-icon">💬</i>
            Pending Comments
            {pendingComments.length > 0 && (
              <span className="tab-badge alert">{pendingComments.length}</span>
            )}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="overview-tab">
            {/* Quick Stats */}
            <div className="stats-grid">
              <div className="stat-card large">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers || 0}</p>
                  <div className="stat-breakdown">
                    {stats.roleDistribution && (
                      <>
                        <span>Admin: {stats.roleDistribution.ADMIN || 0}</span>
                        <span>
                          Author: {stats.roleDistribution.AUTHOR || 0}
                        </span>
                        <span>
                          Reader: {stats.roleDistribution.READER || 0}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="stat-card large">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <h3>Total Posts</h3>
                  <p className="stat-number">{stats.totalPosts || 0}</p>
                  {analytics.postsPerUser && (
                    <p className="stat-subtitle">
                      {analytics.postsPerUser} posts per user
                    </p>
                  )}
                </div>
              </div>

              <div className="stat-card large">
                <div className="stat-icon">💬</div>
                <div className="stat-content">
                  <h3>Total Comments</h3>
                  <p className="stat-number">{stats.totalComments || 0}</p>
                  {analytics.commentsPerPost && (
                    <p className="stat-subtitle">
                      {analytics.commentsPerPost} comments per post
                    </p>
                  )}
                </div>
              </div>

              <div className="stat-card large">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>Recent Growth</h3>
                  <p className="stat-number">
                    +{stats.recentRegistrations || 0}
                  </p>
                  <p className="stat-subtitle">new users (30 days)</p>
                </div>
              </div>
            </div>

            {/* Recent Users & Analytics */}
            <div className="overview-sections">
              <div className="overview-section">
                <h3>Recent Users</h3>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentUsers && stats.recentUsers.length > 0 ? (
                        stats.recentUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="user-cell">
                                <div className="user-avatar">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                {user.name}
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span
                                className={`role-badge role-${user.role.toLowerCase()}`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td>{formatDate(user.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="no-data">
                            No recent users
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overview-section">
                <h3>Platform Analytics</h3>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h4>Engagement Metrics</h4>
                    <div className="metric">
                      <span className="metric-label">Posts per User:</span>
                      <span className="metric-value">
                        {analytics.postsPerUser || "0"}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Comments per User:</span>
                      <span className="metric-value">
                        {analytics.commentsPerUser || "0"}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Comments per Post:</span>
                      <span className="metric-value">
                        {analytics.commentsPerPost || "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="users-tab">
            {/* Users Filters */}
            <div className="filters-section">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <select
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="AUTHOR">Author</option>
                  <option value="READER">Reader</option>
                </select>
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
                {(searchQuery || roleFilter) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn btn-outline"
                  >
                    Clear
                  </button>
                )}
              </form>
              <div className="results-info">
                Showing {users.length} of {totalUsers} users
              </div>
            </div>

            {isLoading ? (
              <LoadingSpinner text="Loading users..." />
            ) : (
              <>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Posts</th>
                        <th>Comments</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div className="user-details">
                                <strong>{user.name}</strong>
                                <small>ID: {user.id.substring(0, 8)}...</small>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span
                              className={`role-badge role-${user.role.toLowerCase()}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td>{user._count?.posts || 0}</td>
                          <td>{user._count?.comments || 0}</td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsModalOpen(true);
                                }}
                                className="btn btn-outline btn-xs"
                                title="Change role"
                              >
                                Role
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteUser(
                                    user.id,
                                    user.name,
                                    user.email
                                  )
                                }
                                className="btn btn-danger btn-xs"
                                title="Delete user"
                                disabled={user.id === user.id} 
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && (
                  <div className="empty-state">
                    <h3>No users found</h3>
                    <p>
                      {searchQuery || roleFilter
                        ? "Try adjusting your search criteria"
                        : "No users registered yet"}
                    </p>
                  </div>
                )}

                {totalPages > 1 && (
                  <Pagination
                    current={currentPage}
                    total={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Pending Comments Tab */}
        {activeTab === "comments" && (
          <div className="comments-tab">
            {pendingComments.length === 0 ? (
              <div className="empty-state">
                <h3>No pending comments</h3>
                <p>All comments have been moderated.</p>
              </div>
            ) : (
              <div className="pending-comments">
                {pendingComments.map((comment) => (
                  <div key={comment.id} className="pending-comment">
                    <div className="comment-header">
                      <div className="comment-author">
                        <strong>{comment.author.name}</strong>
                        <span className="author-email">
                          ({comment.author.email})
                        </span>
                      </div>
                      <div className="comment-meta">
                        <span className="post-title">
                          on "{comment.post.title}"
                        </span>
                        <span className="date">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="comment-content">
                      <p>{comment.content}</p>
                    </div>
                    <div className="comment-actions">
                      <button
                        onClick={() =>
                          handleCommentAction(comment.id, "approve")
                        }
                        className="btn btn-success btn-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleCommentAction(comment.id, "delete")
                        }
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Change Role Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          title="Change User Role"
        >
          {selectedUser && (
            <div className="role-change-modal">
              <div className="user-info">
                <div className="user-avatar large">
                  {selectedUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="user-details">
                  <h4>{selectedUser.name}</h4>
                  <p>{selectedUser.email}</p>
                  <p>
                    Current role: <strong>{selectedUser.role}</strong>
                  </p>
                </div>
              </div>

              <div className="role-options">
                <p>Select new role:</p>
                <div className="role-buttons">
                  {Object.values(ROLES).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleUpdate(selectedUser.id, role)}
                      className={`role-option-btn ${
                        selectedUser.role === role ? "current" : ""
                      } role-${role.toLowerCase()}`}
                      disabled={selectedUser.role === role}
                    >
                      {capitalizeFirst(role.toLowerCase())}
                      {selectedUser.role === role && " (Current)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminPanel;
