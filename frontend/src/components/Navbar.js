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

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🕌</span>
          <span>Hyderabad Online Shopping</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Search biryani spices, pearls, textiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>🔍</button>
        </form>

        {/* Actions */}
        <div style={styles.actions}>
          {user ? (
            <div style={styles.userMenu}>
              <button style={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                👤 {user.firstName}
              </button>
              {menuOpen && (
                <div style={styles.dropdown}>
                  <Link to="/orders" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>My Orders</Link>
                  <button style={styles.dropdownItem} onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={styles.authLink}>Sign In</Link>
          )}
          <Link to="/cart" style={styles.cartBtn}>
            🛒
            {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: '#1a1a2e', padding: '0 16px', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  container: { maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 64 },
  logo: { color: '#f5a623', textDecoration: 'none', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' },
  logoIcon: { fontSize: 24 },
  searchForm: { flex: 1, display: 'flex', maxWidth: 600 },
  searchInput: { flex: 1, padding: '8px 12px', border: 'none', borderRadius: '4px 0 0 4px', fontSize: 14, outline: 'none' },
  searchBtn: { padding: '8px 14px', background: '#f5a623', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer', fontSize: 16 },
  actions: { display: 'flex', alignItems: 'center', gap: 16 },
  authLink: { color: '#fff', textDecoration: 'none', fontSize: 14, padding: '6px 12px', border: '1px solid #fff', borderRadius: 4 },
  userMenu: { position: 'relative' },
  userBtn: { background: 'none', border: '1px solid #fff', color: '#fff', padding: '6px 12px', cursor: 'pointer', borderRadius: 4, fontSize: 14 },
  dropdown: { position: 'absolute', right: 0, top: '110%', background: '#fff', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: 140, zIndex: 100 },
  dropdownItem: { display: 'block', width: '100%', padding: '10px 16px', textDecoration: 'none', color: '#333', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14 },
  cartBtn: { color: '#fff', textDecoration: 'none', fontSize: 22, position: 'relative', padding: 4 },
  badge: { position: 'absolute', top: -4, right: -6, background: '#f5a623', color: '#000', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
