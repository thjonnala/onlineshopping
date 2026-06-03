import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try { await addToCart(product.id, 1); }
    catch { alert('Failed to add to cart'); }
    finally { setAdding(false); }
  };

  return (
    <Link to={`/product/${product.id}`} style={styles.card}>
      <div style={styles.imageWrap}>
        <img src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} alt={product.name} style={styles.image} />
        {discount > 0 && <span style={styles.discountBadge}>{discount}% off</span>}
      </div>
      <div style={styles.body}>
        <p style={styles.name}>{product.name}</p>
        <div style={styles.ratingRow}>
          <span style={styles.stars}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
          <span style={styles.reviewCount}>({product.reviewCount.toLocaleString()})</span>
        </div>
        <div style={styles.priceRow}>
          {product.discountPrice ? (
            <>
              <span style={styles.discountPrice}>₹{product.discountPrice.toLocaleString('en-IN')}</span>
              <span style={styles.originalPrice}>₹{product.price.toLocaleString('en-IN')}</span>
            </>
          ) : (
            <span style={styles.discountPrice}>₹{product.price.toLocaleString('en-IN')}</span>
          )}
        </div>
        <p style={styles.category}>{product.category?.name}</p>
        <button onClick={handleAddToCart} disabled={adding || product.stock === 0} style={product.stock === 0 ? styles.outOfStock : styles.addBtn}>
          {product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}

const styles = {
  card: { display: 'block', textDecoration: 'none', color: 'inherit', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.12)', overflow: 'hidden', transition: 'box-shadow 0.2s', cursor: 'pointer' },
  imageWrap: { position: 'relative', height: 200, overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  discountBadge: { position: 'absolute', top: 8, left: 8, background: '#e53e3e', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 },
  body: { padding: 12 },
  name: { margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 },
  stars: { color: '#f5a623', fontSize: 12 },
  reviewCount: { fontSize: 11, color: '#666' },
  priceRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  discountPrice: { fontSize: 16, fontWeight: 700, color: '#1a1a2e' },
  originalPrice: { fontSize: 12, color: '#999', textDecoration: 'line-through' },
  category: { fontSize: 11, color: '#888', margin: '0 0 10px' },
  addBtn: { width: '100%', padding: '8px', background: '#f5a623', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'background 0.2s' },
  outOfStock: { width: '100%', padding: '8px', background: '#e2e8f0', border: 'none', borderRadius: 4, cursor: 'not-allowed', fontWeight: 600, fontSize: 13, color: '#999' },
};
