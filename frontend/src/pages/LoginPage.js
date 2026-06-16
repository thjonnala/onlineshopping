import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login(form.email, form.password); navigate(from, { replace: true }); }
    catch (err) { setError(err.response?.data?.message || 'Login failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logoIcon}>🕌</span>
          <h1 style={styles.title}>Sign In</h1>
          <p style={styles.subtitle}>Welcome back to Hyderabad Online Shopping</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email address</label>
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={styles.input} placeholder="you@example.com" />

          <label style={styles.label}>Password</label>
          <input type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={styles.input} placeholder="••••••••" />

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          New here? <Link to="/register" style={styles.link}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:     { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: 16 },
  card:     { background: '#fff', padding: '36px 32px', borderRadius: 8, border: '1px solid #e0e0e0', width: '100%', maxWidth: 420, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  header:   { textAlign: 'center', marginBottom: 28 },
  logoIcon: { fontSize: 44 },
  title:    { fontSize: 24, fontWeight: 700, color: '#212121', margin: '8px 0 4px' },
  subtitle: { fontSize: 14, color: '#757575', margin: 0 },
  error:    { background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: 4, marginBottom: 16, fontSize: 14, border: '1px solid #ef9a9a' },
  form:     { display: 'flex', flexDirection: 'column', gap: 6 },
  label:    { fontSize: 13, fontWeight: 600, color: '#424242' },
  input:    { padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 14, outline: 'none', marginBottom: 10 },
  btn:      { marginTop: 6, padding: '12px', background: '#1a73e8', border: 'none', borderRadius: 4, fontWeight: 700, fontSize: 15, cursor: 'pointer', color: '#fff' },
  footer:   { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#757575' },
  link:     { color: '#1a73e8', textDecoration: 'none', fontWeight: 600 },
};
