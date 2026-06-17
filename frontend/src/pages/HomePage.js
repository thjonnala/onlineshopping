import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/products?sort=rating&pageSize=10'),
      api.get('/products?sort=price_asc&pageSize=5'),
    ]).then(([cats, feat, dealRes]) => {
      setCategories(cats.data);
      setFeatured(feat.data.products);
      setDeals(dealRes.data.products);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Loading Hyderabad's finest...</div>;

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-badge">✨ Authentic Hyderabadi Marketplace</span>
            <h1 className="hero-title">
              Shop the soul of<br /><span>Hyderabad</span>
            </h1>
            <p className="hero-subtitle">
              From Charminar pearls to biryani spices — handpicked treasures, delivered to your door.
            </p>
            <div className="hero-buttons">
              <Link to="/products" style={styles.heroBtn}>Shop Now →</Link>
              <Link to="/category/1" style={styles.heroBtnOutline}>Explore Spices</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-medallion">
              <span className="hero-emoji">🕌</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Categories */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Shop by Category</h2>
            <Link to="/products" style={styles.seeAll}>View all →</Link>
          </div>
          <div style={styles.categoryGrid}>
            {categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.id}`} style={styles.categoryCard}>
                <img src={cat.imageUrl} alt={cat.name} style={styles.categoryImage} />
                <div style={styles.categoryOverlay}>
                  <p style={styles.categoryName}>{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Deals */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={{ ...styles.sectionTitle, color: '#e53935' }}>🔥 Deals of the Day</h2>
            <Link to="/products?sort=price_asc" style={styles.seeAll}>See all deals →</Link>
          </div>
          <div style={styles.productGrid}>
            {deals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Top Rated */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>⭐ Top Rated Products</h2>
            <Link to="/products?sort=rating" style={styles.seeAll}>See all →</Link>
          </div>
          <div style={styles.productGrid}>
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Trust Strip */}
        <div className="strip-banner">
          <div className="strip-item"><span>🚚</span><strong>Free Delivery</strong>on orders above ₹999</div>
          <div className="strip-item"><span>🔒</span><strong>Secure Payments</strong>100% safe checkout</div>
          <div className="strip-item"><span>↩️</span><strong>Easy Returns</strong>7-day return policy</div>
          <div className="strip-item"><span>✅</span><strong>Authentic Products</strong>Verified Hyderabadi</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loading: { textAlign: 'center', padding: 80, fontSize: 18, color: '#757575' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 16px' },
  section: { padding: '36px 0' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 700, color: '#212121' },
  seeAll: { color: '#1a73e8', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  heroBtn: { background: 'linear-gradient(135deg, #ffc107, #ff9800)', color: '#3a0a5e', padding: '14px 32px', borderRadius: 8, textDecoration: 'none', fontWeight: 800, fontSize: 15, boxShadow: '0 8px 20px rgba(255,152,0,0.40)' },
  heroBtnOutline: { background: 'rgba(255,255,255,0.10)', color: '#fff', padding: '14px 32px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15, border: '2px solid rgba(255,255,255,0.65)' },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 },
  categoryCard: { position: 'relative', borderRadius: 8, overflow: 'hidden', height: 130, display: 'block', textDecoration: 'none', border: '1px solid #e0e0e0' },
  categoryImage: { width: '100%', height: '100%', objectFit: 'cover' },
  categoryOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.65))', padding: '18px 10px 8px' },
  categoryName: { color: '#fff', fontWeight: 700, fontSize: 13, margin: 0 },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 16 },
};
