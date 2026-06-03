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
      api.get('/products?sort=rating&pageSize=8'),
      api.get('/products?sort=price_asc&pageSize=4'),
    ]).then(([cats, feat, dealRes]) => {
      setCategories(cats.data);
      setFeatured(feat.data.products);
      setDeals(dealRes.data.products);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Loading Hyderabad's finest...</div>;

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero">
        <div className="hero-inner">
          <div style={styles.heroText}>
            <h1 className="hero-title">Welcome to Hyderabad Online Shopping</h1>
            <p className="hero-subtitle">Discover authentic Hyderabadi products — from Charminar pearls to biryani spices</p>
            <div className="hero-buttons">
              <Link to="/products" style={styles.heroBtn}>Shop Now</Link>
              <Link to="/category/1" style={styles.heroBtnOutline}>Explore Spices</Link>
            </div>
          </div>
          <span className="hero-emoji">🕌</span>
        </div>
      </div>

      <div style={styles.container}>
        {/* Categories */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Shop by Category</h2>
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
          <div style={styles.dealsBanner}>
            <h2 style={styles.dealsTitle}>⚡ Deals of the Day</h2>
            <Link to="/products?sort=price_asc" style={styles.seeAll}>See all deals →</Link>
          </div>
          <div style={styles.productGrid}>
            {deals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Featured Products */}
        <section style={styles.section}>
          <div style={styles.dealsBanner}>
            <h2 style={styles.sectionTitle}>⭐ Top Rated Products</h2>
            <Link to="/products?sort=rating" style={styles.seeAll}>See all →</Link>
          </div>
          <div style={styles.productGrid}>
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Banner strip */}
        <div className="strip-banner">
          <div className="strip-item"><span>🚚</span> Free delivery on orders above ₹999</div>
          <div className="strip-item"><span>🔒</span> Secure payments</div>
          <div className="strip-item"><span>↩️</span> Easy returns within 7 days</div>
          <div className="strip-item"><span>✅</span> 100% authentic products</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loading: { textAlign: 'center', padding: 80, fontSize: 18, color: '#666' },
  heroText: { flex: 1 },
  heroBtn: { background: '#f5a623', color: '#1a1a2e', padding: '12px 28px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, fontSize: 16 },
  heroBtnOutline: { background: 'transparent', color: '#f5a623', padding: '12px 28px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, fontSize: 16, border: '2px solid #f5a623' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 16px' },
  section: { padding: '40px 0' },
  sectionTitle: { fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: '0 0 24px' },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 },
  categoryCard: { position: 'relative', borderRadius: 12, overflow: 'hidden', height: 130, display: 'block', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  categoryImage: { width: '100%', height: '100%', objectFit: 'cover' },
  categoryOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '20px 12px 10px' },
  categoryName: { color: '#fff', fontWeight: 700, fontSize: 13, margin: 0 },
  dealsBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  dealsTitle: { fontSize: 24, fontWeight: 700, color: '#e53e3e', margin: 0 },
  seeAll: { color: '#f5a623', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 },
};
