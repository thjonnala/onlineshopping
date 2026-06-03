import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PAYMENT_METHODS = [
  { id: 'COD', label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' },
  { id: 'UPI', label: '📱 UPI', desc: 'GPay, PhonePe, Paytm (mock)' },
  { id: 'Card', label: '💳 Credit / Debit Card', desc: 'Visa, Mastercard (mock)' },
  { id: 'NetBanking', label: '🏦 Net Banking', desc: 'All major banks (mock)' },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCartState } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState(
    [user?.address, user?.city, user?.state, user?.pincode].filter(Boolean).join(', ')
  );
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const delivery = cartTotal >= 999 ? 0 : 99;
  const finalTotal = cartTotal + delivery;

  const handlePlaceOrder = async () => {
    if (!address.trim()) { setError('Please enter a shipping address.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/orders', { shippingAddress: address, paymentMethod });
      clearCartState();
      navigate('/order-confirmation', { state: { orderId: data.orderId } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Checkout</h1>

        <div style={styles.layout}>
          {/* Left */}
          <div style={styles.left}>
            {/* Delivery Address */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>📍 Delivery Address</h2>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
                style={styles.textarea}
                rows={4}
              />
            </div>

            {/* Payment */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>💳 Payment Method</h2>
              <div style={styles.paymentOptions}>
                {PAYMENT_METHODS.map(pm => (
                  <label key={pm.id} style={{ ...styles.paymentOption, ...(paymentMethod === pm.id ? styles.paymentOptionSelected : {}) }}>
                    <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} style={styles.radio} />
                    <div>
                      <p style={styles.paymentLabel}>{pm.label}</p>
                      <p style={styles.paymentDesc}>{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div style={styles.summary}>
            <h2 style={styles.sectionTitle}>Order Summary</h2>
            <div style={styles.orderItems}>
              {cartItems.map(item => (
                <div key={item.id} style={styles.orderItem}>
                  <img src={item.productImage} alt={item.productName} style={styles.orderItemImg} />
                  <div style={styles.orderItemInfo}>
                    <p style={styles.orderItemName}>{item.productName}</p>
                    <p style={styles.orderItemQty}>Qty: {item.quantity}</p>
                  </div>
                  <span style={styles.orderItemPrice}>₹{((item.discountPrice ?? item.price) * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div style={styles.divider} />
            <div style={styles.summaryRow}><span>Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
            <div style={styles.summaryRow}><span>Delivery</span><span style={{ color: delivery === 0 ? '#38a169' : undefined }}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
            <div style={styles.divider} />
            <div style={styles.totalRow}><span>Total</span><span>₹{finalTotal.toLocaleString('en-IN')}</span></div>

            {error && <div style={styles.error}>{error}</div>}

            <button onClick={handlePlaceOrder} disabled={loading || cartItems.length === 0} style={styles.placeOrderBtn}>
              {loading ? 'Placing Order...' : `Place Order — ₹${finalTotal.toLocaleString('en-IN')}`}
            </button>
            <p style={styles.secureNote}>🔒 Secure checkout — your data is safe</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#f7f7f7', minHeight: '100vh', padding: '24px 16px' },
  container: { maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginBottom: 24 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 },
  left: { display: 'flex', flexDirection: 'column', gap: 20 },
  section: { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' },
  textarea: { width: '100%', padding: '12px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  paymentOptions: { display: 'flex', flexDirection: 'column', gap: 10 },
  paymentOption: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer' },
  paymentOptionSelected: { border: '2px solid #f5a623', background: '#fffbf0' },
  radio: { accentColor: '#f5a623' },
  paymentLabel: { fontWeight: 600, fontSize: 14, margin: 0 },
  paymentDesc: { fontSize: 12, color: '#888', margin: '2px 0 0' },
  summary: { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', height: 'fit-content', position: 'sticky', top: 80 },
  orderItems: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 },
  orderItem: { display: 'flex', gap: 10, alignItems: 'center' },
  orderItemImg: { width: 50, height: 50, objectFit: 'cover', borderRadius: 4 },
  orderItemInfo: { flex: 1 },
  orderItemName: { fontSize: 13, fontWeight: 600, margin: 0, color: '#1a1a2e' },
  orderItemQty: { fontSize: 12, color: '#888', margin: '2px 0 0' },
  orderItemPrice: { fontSize: 14, fontWeight: 700 },
  divider: { borderTop: '1px solid #e2e8f0', margin: '12px 0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: '#4a5568' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 },
  error: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: 13, border: '1px solid #fed7d7' },
  placeOrderBtn: { width: '100%', padding: '14px', background: '#f5a623', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 16, cursor: 'pointer', color: '#1a1a2e', marginBottom: 8 },
  secureNote: { textAlign: 'center', fontSize: 12, color: '#999', margin: 0 },
};
