import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try { await addToCart(product.id, 1); setAdded(true); setTimeout(() => setAdded(false), 2000); }
    catch { alert('Failed to add to cart'); }
    finally { setAdding(false); }
  };

  return (
    <Link to={`/product/${product.id}`} style={styles.card}>
      <div style={styles.imageWrap}>
        <img src={product.imageUrl || 'https://via.placeholder.com/300x200'} alt={product.name} style={styles.image} />
        {discount > 0 && <span style={styles.badge}>-{discount}%</span>}
      </div>
      <div style={styles.body}>
        <p style={styles.category}>{product.category?.name}</p>
        <p style={styles.name}>{product.name}</p>
        <div style={styles.ratingRow}>
          <span style={styles.stars}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
          <span style={styles.reviewCount}>({product.reviewCount.toLocaleString()})</span>
        </div>
        <div style={styles.priceRow}>
          {product.discountPrice ? (
            <>
              <span style={styles.price}>₹{product.discountPrice.toLocaleString('en-IN')}</span>
              <span style={styles.originalPrice}>₹{product.price.toLocaleString('en-IN')}</span>
            </>
          ) : (
            <span style={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
          )}
        </div>
        <button onClick={handleAddToCart} disabled={adding || product.stock === 0}
          style={product.stock === 0 ? styles.outOfStock : added ? styles.addedBtn : styles.addBtn}>
          {product.stock === 0 ? 'Out of Stock' : added ? '✓ Added' : adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}

const styles = {
  card: { display: 'block', textDecoration: 'none', color: 'inherit', background: '#fff', borderRadius: 6, border: '1px solid #e0e0e0', overflow: 'hidden', transition: 'box-shadow 0.2s, border-color 0.2s' },
  imageWrap: { position: 'relative', height: 190, overflow: 'hidden', background: '#f9f9f9' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  badge: { position: 'absolute', top: 8, left: 8, background: '#e53935', color: '#fff', padding: '3px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700 },
  body: { padding: '10px 12px 12px' },
  category: { fontSize: 11, color: '#1a73e8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' },
  name: { margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: '#212121', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 36 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 },
  stars: { color: '#f9a825', fontSize: 12 },
  reviewCount: { fontSize: 11, color: '#757575' },
  priceRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  price: { fontSize: 16, fontWeight: 700, color: '#1a73e8' },
  originalPrice: { fontSize: 12, color: '#9e9e9e', textDecoration: 'line-through' },
  addBtn: { width: '100%', padding: '8px', background: '#1a73e8', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#fff' },
  addedBtn: { width: '100%', padding: '8px', background: '#2e7d32', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#fff' },
  outOfStock: { width: '100%', padding: '8px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 4, cursor: 'not-allowed', fontWeight: 600, fontSize: 13, color: '#9e9e9e' },
};
