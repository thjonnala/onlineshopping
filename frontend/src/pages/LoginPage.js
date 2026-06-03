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
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logoIcon}>🕌</span>
          <h1 style={styles.title}>Sign In to HyderabadBazaar</h1>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={styles.input}
            placeholder="you@example.com"
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={styles.input}
            placeholder="••••••••"
          />

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          New to HyderabadBazaar? <Link to="/register" style={styles.link}>Create account</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7', padding: 16 },
  card: { background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: 420 },
  header: { textAlign: 'center', marginBottom: 28 },
  logoIcon: { fontSize: 48 },
  title: { fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '8px 0 0' },
  error: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 14, border: '1px solid #fed7d7' },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#4a5568' },
  input: { padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 15, outline: 'none', marginBottom: 8 },
  btn: { marginTop: 8, padding: '12px', background: '#f5a623', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 16, cursor: 'pointer', color: '#1a1a2e' },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666' },
  link: { color: '#f5a623', textDecoration: 'none', fontWeight: 600 },
};
