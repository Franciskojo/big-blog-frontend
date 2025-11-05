// frontend/src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';
import '../styles/components.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={handleNavClick}>
            <h1>FavoriteBlog</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav desktop-nav">
            <Link 
              to="/" 
              className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                {(user.role === ROLES.AUTHOR || user.role === ROLES.ADMIN) && (
                  <Link 
                    to="/dashboard" 
                    className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === ROLES.ADMIN && (
                  <Link 
                    to="/admin" 
                    className={`nav-link ${isActiveRoute('/admin') ? 'active' : ''}`}
                  >
                    Admin
                  </Link>
                )}
                <div className="user-menu">
                  <div className="user-info">
                    <span className="user-greeting">Hello, {user.name}</span>
                    <span className={`user-role role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="user-actions">
                    <Link 
                      to="/profile" 
                      className={`nav-link ${isActiveRoute('/profile') ? 'active' : ''}`}
                    >
                      Profile
                    </Link>
                    <button onClick={handleLogout} className="btn btn-outline btn-sm">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-links">
                <Link 
                  to="/login" 
                  className={`btn btn-outline ${isActiveRoute('/login') ? 'active' : ''}`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`btn btn-primary ${isActiveRoute('/register') ? 'active' : ''}`}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Mobile Navigation */}
          <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="mobile-nav-content">
              <Link 
                to="/" 
                className={`mobile-nav-link ${isActiveRoute('/') ? 'active' : ''}`}
                onClick={toggleMobileMenu}
              >
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  {(user.role === ROLES.AUTHOR || user.role === ROLES.ADMIN) && (
                    <Link 
                      to="/dashboard" 
                      className={`mobile-nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                      onClick={toggleMobileMenu}
                    >
                      Dashboard
                    </Link>
                  )}
                  {user.role === ROLES.ADMIN && (
                    <Link 
                      to="/admin" 
                      className={`mobile-nav-link ${isActiveRoute('/admin') ? 'active' : ''}`}
                      onClick={toggleMobileMenu}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link 
                    to="/profile" 
                    className={`mobile-nav-link ${isActiveRoute('/profile') ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                  >
                    Profile
                  </Link>
                  
                  <div className="mobile-user-info">
                    <div className="user-details">
                      <strong>{user.name}</strong>
                      <span className={`user-role role-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </div>
                    <button 
                      onClick={handleLogout} 
                      className="btn btn-outline btn-full"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="mobile-auth-links">
                  <Link 
                    to="/login" 
                    className={`btn btn-outline btn-full ${isActiveRoute('/login') ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className={`btn btn-primary btn-full ${isActiveRoute('/register') ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="mobile-nav-overlay"
              onClick={toggleMobileMenu}
            ></div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;