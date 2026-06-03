import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cartItems, cartLoading, cartTotal, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (cartLoading) return <div style={styles.loading}>Loading cart...</div>;

  if (cartItems.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🛒</div>
        <h2 style={styles.emptyTitle}>Your cart is empty</h2>
        <p style={styles.emptyText}>Add some amazing Hyderabadi products!</p>
        <Link to="/products" style={styles.shopBtn}>Start Shopping</Link>
      </div>
    );
  }

  const savings = cartItems.reduce((sum, item) => {
    return sum + (item.discountPrice ? (item.price - item.discountPrice) * item.quantity : 0);
  }, 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Shopping Cart ({cartItems.length} items)</h1>

        <div style={styles.layout}>
          {/* Items */}
          <div style={styles.itemsSection}>
            {cartItems.map(item => (
              <div key={item.id} style={styles.item}>
                <img src={item.productImage || 'https://via.placeholder.com/100'} alt={item.productName} style={styles.itemImage} />
                <div style={styles.itemDetails}>
                  <Link to={`/product/${item.productId}`} style={styles.itemName}>{item.productName}</Link>
                  <div style={styles.itemPrice}>
                    <span style={styles.price}>₹{(item.discountPrice ?? item.price).toLocaleString('en-IN')}</span>
                    {item.discountPrice && <span style={styles.originalPrice}>₹{item.price.toLocaleString('en-IN')}</span>}
                  </div>
                  {item.stock <= 5 && <p style={styles.stockWarn}>Only {item.stock} left in stock!</p>}
                  <div style={styles.itemActions}>
                    <div style={styles.qtyControl}>
                      <button onClick={() => item.quantity > 1 ? updateCartItem(item.id, item.quantity - 1) : removeFromCart(item.id)} style={styles.qtyBtn}>−</button>
                      <span style={styles.qtyNum}>{item.quantity}</span>
                      <button onClick={() => updateCartItem(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} style={styles.qtyBtn}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={styles.removeBtn}>🗑 Remove</button>
                  </div>
                </div>
                <div style={styles.itemTotal}>
                  ₹{((item.discountPrice ?? item.price) * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={styles.summary}>
            <h3 style={styles.summaryTitle}>Order Summary</h3>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{(cartTotal + savings).toLocaleString('en-IN')}</span>
            </div>
            {savings > 0 && (
              <div style={{ ...styles.summaryRow, color: '#38a169' }}>
                <span>You save</span>
                <span>-₹{savings.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={styles.summaryRow}>
              <span>Delivery</span>
              <span style={{ color: '#38a169' }}>{cartTotal >= 999 ? 'FREE' : '₹99'}</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.totalRow}>
              <span>Total</span>
              <span>₹{(cartTotal + (cartTotal >= 999 ? 0 : 99)).toLocaleString('en-IN')}</span>
            </div>
            {savings > 0 && <p style={styles.savingsBadge}>🎉 You're saving ₹{savings.toLocaleString('en-IN')}!</p>}
            <button onClick={() => navigate('/checkout')} style={styles.checkoutBtn}>Proceed to Checkout →</button>
            <Link to="/products" style={styles.continueShopping}>← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loading: { textAlign: 'center', padding: 80, color: '#666' },
  empty: { textAlign: 'center', padding: '80px 16px' },
  emptyIcon: { fontSize: 80 },
  emptyTitle: { fontSize: 24, color: '#1a1a2e', margin: '16px 0 8px' },
  emptyText: { color: '#666', marginBottom: 24 },
  shopBtn: { background: '#f5a623', color: '#1a1a2e', padding: '12px 28px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, display: 'inline-block' },
  page: { background: '#f7f7f7', minHeight: '100vh', padding: '24px 16px' },
  container: { maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 24 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 },
  itemsSection: { display: 'flex', flexDirection: 'column', gap: 16 },
  item: { background: '#fff', borderRadius: 8, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  itemImage: { width: 100, height: 100, objectFit: 'cover', borderRadius: 6, flexShrink: 0 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: 600, color: '#1a1a2e', textDecoration: 'none', display: 'block', marginBottom: 6 },
  itemPrice: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 },
  price: { fontSize: 16, fontWeight: 700 },
  originalPrice: { fontSize: 13, color: '#999', textDecoration: 'line-through' },
  stockWarn: { color: '#e53e3e', fontSize: 12, margin: '4px 0' },
  itemActions: { display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 },
  qtyControl: { display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #cbd5e0', borderRadius: 4, padding: '2px 8px' },
  qtyBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '0 4px', fontWeight: 700, color: '#f5a623' },
  qtyNum: { fontSize: 15, fontWeight: 600, minWidth: 20, textAlign: 'center' },
  removeBtn: { background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: 13 },
  itemTotal: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap' },
  summary: { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', height: 'fit-content', position: 'sticky', top: 80 },
  summaryTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10, color: '#4a5568' },
  divider: { borderTop: '1px solid #e2e8f0', margin: '12px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 },
  savingsBadge: { background: '#f0fff4', color: '#38a169', padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, margin: '8px 0' },
  checkoutBtn: { width: '100%', padding: '14px', background: '#f5a623', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 16, cursor: 'pointer', color: '#1a1a2e', marginBottom: 12 },
  continueShopping: { display: 'block', textAlign: 'center', color: '#666', textDecoration: 'none', fontSize: 13 },
};
