import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setMobileSearchOpen(false);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🕌</span>
          <span className="navbar-logo-text">Hyderabad Online Shopping</span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="navbar-search-form">
          <input
            type="text"
            placeholder="Search biryani spices, pearls, textiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="navbar-search-input"
          />
          <button type="submit" className="navbar-search-btn">🔍</button>
        </form>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Mobile: search toggle */}
          <button
            className="navbar-hamburger"
            onClick={() => setMobileSearchOpen(o => !o)}
            aria-label="Toggle search"
          >
            🔍
          </button>

          {user ? (
            <div className="navbar-user-menu">
              <button className="navbar-user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                👤 {user.firstName}
              </button>
              {menuOpen && (
                <div className="navbar-dropdown">
                  <Link to="/orders" className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>My Orders</Link>
                  <button className="navbar-dropdown-item" onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-auth-link">Sign In</Link>
          )}

          <Link to="/cart" className="navbar-cart-btn">
            🛒
            {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar (slides in below navbar) */}
      {mobileSearchOpen && (
        <div className="navbar-mobile-search">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <button type="submit">🔍</button>
          </form>
        </div>
      )}
    </nav>
  );
}
