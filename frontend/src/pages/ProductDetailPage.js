import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch { alert('Failed to add to cart.'); }
    finally { setAdding(false); }
  };

  const handleBuyNow = async () => {
    if (!user) { navigate('/login'); return; }
    await handleAddToCart();
    navigate('/cart');
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!product) return null;

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Image */}
          <div style={styles.imageSection}>
            <img src={product.imageUrl || 'https://via.placeholder.com/500x400'} alt={product.name} style={styles.image} />
          </div>

          {/* Details */}
          <div style={styles.details}>
            <p style={styles.categoryTag}>{product.category?.name}</p>
            <h1 style={styles.name}>{product.name}</h1>

            <div style={styles.ratingRow}>
              <span style={styles.stars}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
              <span style={styles.ratingNum}>{product.rating.toFixed(1)}</span>
              <span style={styles.reviewCount}>({product.reviewCount.toLocaleString()} reviews)</span>
            </div>

            <div style={styles.priceSection}>
              {product.discountPrice ? (
                <>
                  <span style={styles.price}>₹{product.discountPrice.toLocaleString('en-IN')}</span>
                  <span style={styles.originalPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                  <span style={styles.discountBadge}>{discount}% off</span>
                </>
              ) : (
                <span style={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
              )}
            </div>

            <p style={product.stock > 0 ? styles.inStock : styles.outOfStock}>
              {product.stock > 10 ? '✅ In Stock' : product.stock > 0 ? `⚠️ Only ${product.stock} left` : '❌ Out of Stock'}
            </p>

            <div style={styles.qtyRow}>
              <label style={styles.qtyLabel}>Quantity:</label>
              <select value={qty} onChange={e => setQty(Number(e.target.value))} style={styles.qtySelect} disabled={product.stock === 0}>
                {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div style={styles.btnRow}>
              <button onClick={handleAddToCart} disabled={adding || product.stock === 0} style={styles.addBtn}>
                {added ? '✅ Added!' : adding ? 'Adding...' : '🛒 Add to Cart'}
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0} style={styles.buyBtn}>
                ⚡ Buy Now
              </button>
            </div>

            <div style={styles.descSection}>
              <h3 style={styles.descTitle}>About this product</h3>
              <p style={styles.desc}>{product.description}</p>
            </div>

            <div style={styles.features}>
              <div style={styles.featureItem}>🚚 Free delivery on orders ₹999+</div>
              <div style={styles.featureItem}>↩️ 7-day easy returns</div>
              <div style={styles.featureItem}>✅ 100% authentic Hyderabadi product</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loading: { textAlign: 'center', padding: 80, color: '#666' },
  page: { background: '#f7f7f7', minHeight: '100vh', padding: '24px 16px' },
  container: { maxWidth: 1200, margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  imageSection: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 8 },
  details: { display: 'flex', flexDirection: 'column', gap: 12 },
  categoryTag: { color: '#f5a623', fontWeight: 600, fontSize: 13, margin: 0, textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 8 },
  stars: { color: '#f5a623', fontSize: 18 },
  ratingNum: { fontWeight: 700, fontSize: 16 },
  reviewCount: { color: '#666', fontSize: 14 },
  priceSection: { display: 'flex', alignItems: 'center', gap: 12 },
  price: { fontSize: 32, fontWeight: 800, color: '#1a1a2e' },
  originalPrice: { fontSize: 18, color: '#999', textDecoration: 'line-through' },
  discountBadge: { background: '#e53e3e', color: '#fff', padding: '3px 10px', borderRadius: 4, fontSize: 14, fontWeight: 700 },
  inStock: { color: '#38a169', fontWeight: 600, fontSize: 14, margin: 0 },
  outOfStock: { color: '#e53e3e', fontWeight: 600, fontSize: 14, margin: 0 },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 12 },
  qtyLabel: { fontWeight: 600, fontSize: 14 },
  qtySelect: { padding: '6px 12px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 14 },
  btnRow: { display: 'flex', gap: 12 },
  addBtn: { flex: 1, padding: '12px', background: '#f5a623', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer', color: '#1a1a2e' },
  buyBtn: { flex: 1, padding: '12px', background: '#1a1a2e', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer', color: '#f5a623' },
  descSection: { borderTop: '1px solid #e2e8f0', paddingTop: 16 },
  descTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' },
  desc: { color: '#4a5568', lineHeight: 1.7, fontSize: 14, margin: 0 },
  features: { display: 'flex', flexDirection: 'column', gap: 6, background: '#f7f7f7', padding: 16, borderRadius: 8 },
  featureItem: { fontSize: 13, color: '#4a5568', fontWeight: 500 },
};
