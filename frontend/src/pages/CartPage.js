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
        <div style={{ fontSize: 72 }}>🛒</div>
        <h2 style={styles.emptyTitle}>Your cart is empty</h2>
        <p style={{ color: '#666' }}>Add some amazing Hyderabadi products!</p>
        <Link to="/products" style={styles.shopBtn}>Start Shopping</Link>
      </div>
    );
  }

  const savings = cartItems.reduce((sum, item) => {
    return sum + (item.discountPrice ? (item.price - item.discountPrice) * item.quantity : 0);
  }, 0);
  const delivery = cartTotal >= 999 ? 0 : 99;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Shopping Cart ({cartItems.length} items)</h1>

        <div className="cart-layout">
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
                  {item.stock <= 5 && <p style={styles.stockWarn}>Only {item.stock} left!</p>}
                  <div style={styles.itemActions}>
                    <div style={styles.qtyControl}>
                      <button onClick={() => item.quantity > 1 ? updateCartItem(item.id, item.quantity - 1) : removeFromCart(item.id)} style={styles.qtyBtn}>−</button>
                      <span style={styles.qtyNum}>{item.quantity}</span>
                      <button onClick={() => updateCartItem(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} style={styles.qtyBtn}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={styles.removeBtn}>🗑 Remove</button>
                  </div>
                </div>
                <div style={styles.itemTotal}>₹{((item.discountPrice ?? item.price) * item.quantity).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={styles.summary}>
            <h3 style={styles.summaryTitle}>Order Summary</h3>
            <div style={styles.summaryRow}><span>Subtotal</span><span>₹{(cartTotal + savings).toLocaleString('en-IN')}</span></div>
            {savings > 0 && <div style={{ ...styles.summaryRow, color: '#38a169' }}><span>You save</span><span>-₹{savings.toLocaleString('en-IN')}</span></div>}
            <div style={styles.summaryRow}><span>Delivery</span><span style={{ color: '#38a169' }}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
            <div style={styles.divider} />
            <div style={styles.totalRow}><span>Total</span><span>₹{(cartTotal + delivery).toLocaleString('en-IN')}</span></div>
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
  emptyTitle: { fontSize: 22, color: '#1a1a2e', margin: '16px 0 8px' },
  shopBtn: { background: '#f5a623', color: '#1a1a2e', padding: '12px 28px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, display: 'inline-block', marginTop: 16 },
  page: { background: '#f7f7f7', minHeight: '100vh', padding: '16px' },
  container: { maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 },
  itemsSection: { display: 'flex', flexDirection: 'column', gap: 12 },
  item: { background: '#fff', borderRadius: 8, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  itemImage: { width: 80, height: 80, objectFit: 'cover', borderRadius: 6, flexShrink: 0 },
  itemDetails: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 14, fontWeight: 600, color: '#1a1a2e', textDecoration: 'none', display: 'block', marginBottom: 4 },
  itemPrice: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2, flexWrap: 'wrap' },
  price: { fontSize: 15, fontWeight: 700 },
  originalPrice: { fontSize: 12, color: '#999', textDecoration: 'line-through' },
  stockWarn: { color: '#e53e3e', fontSize: 12, margin: '2px 0' },
  itemActions: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #cbd5e0', borderRadius: 4, padding: '2px 6px' },
  qtyBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '0 2px', fontWeight: 700, color: '#f5a623' },
  qtyNum: { fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' },
  removeBtn: { background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: 12 },
  itemTotal: { fontSize: 15, fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap', flexShrink: 0 },
  summary: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', height: 'fit-content' },
  summaryTitle: { fontSize: 17, fontWeight: 700, color: '#1a1a2e', margin: '0 0 14px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: '#4a5568' },
  divider: { borderTop: '1px solid #e2e8f0', margin: '12px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 },
  savingsBadge: { background: '#f0fff4', color: '#38a169', padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, margin: '8px 0' },
  checkoutBtn: { width: '100%', padding: '13px', background: '#f5a623', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer', color: '#1a1a2e', marginBottom: 10 },
  continueShopping: { display: 'block', textAlign: 'center', color: '#666', textDecoration: 'none', fontSize: 13 },
};
