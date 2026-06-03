import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function OrderConfirmationPage() {
  const { state } = useLocation();
  const orderId = state?.orderId;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.checkmark}>✅</div>
        <h1 style={styles.title}>Order Placed Successfully!</h1>
        <p style={styles.subtitle}>
          Shukriya! Your order has been confirmed.<br />
          Your authentic Hyderabadi products are on their way! 🕌
        </p>

        {orderId && (
          <div style={styles.orderIdBox}>
            <p style={styles.orderIdLabel}>Order ID</p>
            <p style={styles.orderId}>#{orderId}</p>
          </div>
        )}

        <div style={styles.stepsSection}>
          <h3 style={styles.stepsTitle}>What happens next?</h3>
          <div style={styles.steps}>
            <div style={styles.step}><span style={styles.stepIcon}>📦</span><p>Order Confirmed</p></div>
            <div style={styles.stepArrow}>→</div>
            <div style={styles.step}><span style={styles.stepIcon}>🏭</span><p>Processing</p></div>
            <div style={styles.stepArrow}>→</div>
            <div style={styles.step}><span style={styles.stepIcon}>🚚</span><p>Shipped</p></div>
            <div style={styles.stepArrow}>→</div>
            <div style={styles.step}><span style={styles.stepIcon}>🏠</span><p>Delivered</p></div>
          </div>
        </div>

        <div style={styles.actions}>
          <Link to="/orders" style={styles.primaryBtn}>View My Orders</Link>
          <Link to="/" style={styles.secondaryBtn}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7', padding: 24 },
  card: { background: '#fff', borderRadius: 16, padding: '48px 40px', maxWidth: 560, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' },
  checkmark: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 12px' },
  subtitle: { color: '#4a5568', lineHeight: 1.7, margin: '0 0 24px', fontSize: 16 },
  orderIdBox: { background: '#f7f7f7', borderRadius: 8, padding: '16px 24px', display: 'inline-block', margin: '0 0 32px' },
  orderIdLabel: { fontSize: 12, color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 },
  orderId: { fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0 },
  stepsSection: { marginBottom: 36 },
  stepsTitle: { fontSize: 16, fontWeight: 700, color: '#4a5568', margin: '0 0 16px' },
  steps: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  stepIcon: { fontSize: 28 },
  stepArrow: { color: '#cbd5e0', fontSize: 20, fontWeight: 700 },
  actions: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: { background: '#f5a623', color: '#1a1a2e', padding: '12px 28px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, fontSize: 15 },
  secondaryBtn: { background: '#1a1a2e', color: '#f5a623', padding: '12px 28px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, fontSize: 15 },
};
