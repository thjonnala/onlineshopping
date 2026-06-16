import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const STATUS_COLOR = { Pending: '#f9a825', Confirmed: '#1a73e8', Processing: '#805ad5', Shipped: '#dd6b20', Delivered: '#2e7d32', Cancelled: '#e53935' };

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: 72 }}>📦</div>
        <h2 style={styles.emptyTitle}>No orders yet</h2>
        <p style={{ color: '#666' }}>You haven't placed any orders. Start shopping!</p>
        <Link to="/products" style={styles.shopBtn}>Shop Now</Link>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>My Orders</h1>
        <div style={styles.ordersList}>
          {orders.map(order => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <p style={styles.orderId}>Order #{order.id}</p>
                  <p style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div style={styles.orderRight}>
                  <span style={{ ...styles.statusBadge, background: STATUS_COLOR[order.status] || '#888' }}>{order.status}</span>
                  <p style={styles.orderTotal}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div style={styles.orderItems}>
                {order.items.map(item => (
                  <div key={item.productId} style={styles.orderItem}>
                    <img src={item.productImage || 'https://via.placeholder.com/60'} alt={item.productName} style={styles.itemImg} />
                    <div>
                      <p style={styles.itemName}>{item.productName}</p>
                      <p style={styles.itemMeta}>Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.orderFooter}>
                <span style={styles.payMethod}>💳 {order.paymentMethod}</span>
                <span style={styles.address}>📍 {order.shippingAddress}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  loading: { textAlign: 'center', padding: 80, color: '#666' },
  empty: { textAlign: 'center', padding: '80px 16px' },
  emptyTitle: { fontSize: 24, color: '#212121', margin: '16px 0 8px' },
  shopBtn: { display: 'inline-block', marginTop: 16, background: '#1a73e8', color: '#fff', padding: '12px 28px', borderRadius: 4, textDecoration: 'none', fontWeight: 700 },
  page: { background: '#f7f7f7', minHeight: '100vh', padding: '24px 16px' },
  container: { maxWidth: 860, margin: '0 auto' },
  title: { fontSize: 26, fontWeight: 700, color: '#212121', marginBottom: 24 },
  ordersList: { display: 'flex', flexDirection: 'column', gap: 16 },
  orderCard: { background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderId: { fontSize: 16, fontWeight: 700, color: '#212121', margin: 0 },
  orderDate: { fontSize: 13, color: '#888', margin: '4px 0 0' },
  orderRight: { textAlign: 'right' },
  statusBadge: { display: 'inline-block', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  orderTotal: { fontSize: 18, fontWeight: 700, color: '#212121', margin: '6px 0 0' },
  orderItems: { display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 16, marginBottom: 16 },
  orderItem: { display: 'flex', gap: 12, alignItems: 'center' },
  itemImg: { width: 56, height: 56, objectFit: 'cover', borderRadius: 6 },
  itemName: { fontSize: 14, fontWeight: 600, color: '#212121', margin: 0 },
  itemMeta: { fontSize: 12, color: '#888', margin: '4px 0 0' },
  orderFooter: { display: 'flex', gap: 20, borderTop: '1px solid #e2e8f0', paddingTop: 12, fontSize: 13, color: '#666', flexWrap: 'wrap' },
  payMethod: { fontWeight: 500 },
  address: { fontWeight: 500 },
};
