// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import { POSTS_PER_PAGE } from '../utils/constants';
import { formatDate, truncateText } from '../utils/helpers';
import '../styles/pages.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { makeRequest, loading, error } = useApi();
  const { user, isAuthenticated } = useAuth();

  // Mock data for sidebar (until API endpoints exist)
  const categories = [
    { name: 'Technology', count: 12, slug: 'technology' },
    { name: 'Web Development', count: 8, slug: 'web-development' },
    { name: 'Lifestyle', count: 5, slug: 'lifestyle' },
    { name: 'Tutorials', count: 15, slug: 'tutorials' },
    { name: 'Productivity', count: 7, slug: 'productivity' },
  ];

  const popularPosts = [
    { id: 1, title: 'Getting Started with React Hooks', comments: 23 },
    { id: 2, title: 'The Future of Web Development', comments: 18 },
    { id: 3, title: '10 Productivity Tips for Developers', comments: 15 },
  ];

  // 🧠 Fetch all posts with pagination and search
  const fetchPosts = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const data = await makeRequest('get', '/posts', {
        page,
        limit: POSTS_PER_PAGE,
        search,
      });

      setPosts(data.posts);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.currentPage);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 Fetch featured posts separately
  const fetchFeaturedPosts = async () => {
    try {
      const data = await makeRequest('get', '/posts/featured/posts');
      setFeaturedPosts(data.posts);
    } catch (err) {
      console.error('Failed to fetch featured posts:', err);
      // fallback: use first 3 regular posts if available
      if (posts.length >= 3) {
        setFeaturedPosts(posts.slice(0, 3));
      }
    }
  };

  // ⚡ Combined effect: fetch posts + featured posts on first page
  useEffect(() => {
    const fetchData = async () => {
      await fetchPosts(currentPage, searchTerm);
      if (currentPage === 1) {
        await fetchFeaturedPosts();
      }
    };
    fetchData();
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts(1, searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchPosts(1);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to <span className="brand">FavoriteBlog</span>
            </h1>
            <p className="hero-subtitle">
              Discover amazing articles, insights, and stories from our community of writers and developers.
            </p>

            {isAuthenticated ? (
              <div className="hero-actions">
                {(user.role === 'AUTHOR' || user.role === 'ADMIN') && (
                  <Link to="/create-post" className="btn btn-primary btn-large">
                    ✍️ Write a Post
                  </Link>
                )}
                <Link to="/dashboard" className="btn btn-outline btn-large">
                  📊 My Dashboard
                </Link>
              </div>
            ) : (
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-large">
                  Join Our Community
                </Link>
                <Link to="/login" className="btn btn-outline btn-large">
                  🔑 Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2>Featured Articles</h2>
              <p>Handpicked content from our best writers</p>
            </div>
            <div className="featured-grid">
              {featuredPosts.map((post) => (
                <FeaturedPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="container">
        <div className="home-content">
          {/* Left: Posts Section */}
          <main className="posts-section">
            <div className="section-header">
              <h2>Latest Blog Posts</h2>

              {/* Search and Controls */}
              <div className="posts-controls">
                <form onSubmit={handleSearch} className="search-form">
                  <div className="search-group">
                    <input
                      type="text"
                      placeholder="Search posts by title or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <button type="submit" className="search-btn">
                      🔍
                    </button>
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="clear-search"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Posts List */}
            {isLoading ? (
              <LoadingSpinner text="Loading posts..." />
            ) : (
              <>
                <div className="posts-list">
                  {posts.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📝</div>
                      <h3>No posts found</h3>
                      <p>
                        {searchTerm
                          ? 'Try adjusting your search terms or check back later for new content.'
                          : 'No posts have been published yet. Check back soon!'}
                      </p>
                      {isAuthenticated &&
                        (user.role === 'AUTHOR' || user.role === 'ADMIN') && (
                          <Link to="/create-post" className="btn btn-primary">
                            Write the First Post
                          </Link>
                        )}
                    </div>
                  ) : (
                    posts.map((post) => <PostCard key={post.id} post={post} />)
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && posts.length > 0 && (
                  <Pagination
                    current={currentPage}
                    total={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </main>

          {/* Right: Sidebar */}
          <aside className="sidebar">
            <div className="widget search-widget">
              <h3>Search Posts</h3>
              <form onSubmit={handleSearch} className="sidebar-search">
                <input
                  type="text"
                  placeholder="Type and press enter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="sidebar-search-input"
                />
              </form>
            </div>

            <div className="widget categories-widget">
              <h3>Categories</h3>
              <ul className="categories-list">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <a href={`/category/${category.slug}`} className="category-link">
                      <span className="category-name">{category.name}</span>
                      <span className="category-count">({category.count})</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="widget popular-posts-widget">
              <h3>Popular Posts</h3>
              <div className="popular-posts-list">
                {popularPosts.map((post) => (
                  <div key={post.id} className="popular-post-item">
                    <div className="popular-post-content">
                      <h4>
                        <a href={`/post/${post.id}`} className="popular-post-title">
                          {post.title}
                        </a>
                      </h4>
                      <div className="popular-post-meta">
                        <span className="comment-count">{post.comments} comments</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="widget about-widget">
              <h3>About FavoriteBlog</h3>
              <p>
                Welcome to our community blog where authors share their knowledge,
                experiences, and insights about technology, development, and more.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Twitter">🐦</a>
                <a href="#" className="social-link" aria-label="GitHub">🐙</a>
                <a href="#" className="social-link" aria-label="LinkedIn">💼</a>
              </div>
            </div>

            <div className="widget newsletter-widget">
              <h3>Stay Updated</h3>
              <p>Get the latest posts delivered to your inbox.</p>
              <form className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                />
                <button type="submit" className="btn btn-primary btn-full">
                  Subscribe
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Featured Post Card Component
const FeaturedPostCard = ({ post }) => (
  <article className="featured-post-card">
    <div className="featured-post-image">
      <div className="post-image-placeholder">
        {post.title.split(' ').map((word) => word[0]).join('').substring(0, 2)}
      </div>
    </div>

    <div className="featured-post-content">
      <div className="post-categories">
        {post.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="category-tag">
            {tag}
          </span>
        ))}
      </div>

      <h3 className="featured-post-title">
        <Link to={`/post/${post.id}`}>{post.title}</Link>
      </h3>

      <p className="featured-post-excerpt">
        {post.excerpt || truncateText(post.content, 120)}
      </p>

      <div className="featured-post-meta">
        <div className="author-info">
          <div className="author-avatar">
            {post.author.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <span className="author-name">{post.author.name}</span>
        </div>
        <div className="post-stats">
          <span className="post-date">{formatDate(post.createdAt)}</span>
        </div>
      </div>
    </div>
  </article>
);

export default Home;
