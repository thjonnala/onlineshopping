import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Defined OUTSIDE the page component so React never recreates it on re-render
// (defining inside causes focus loss on every keystroke)
function Field({ label, value, onChange, type = 'text', placeholder, required = false }) {
  return (
    <div>
      <label style={styles.label}>{label}{required && ' *'}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.input}
        autoComplete="off"
      />
    </div>
  );
}

const initialForm = {
  firstName: '', lastName: '', email: '', password: '',
  confirmPassword: '', phone: '', address: '',
  city: 'Hyderabad', state: 'Telangana', pincode: ''
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logoIcon}>🕌</span>
          <h1 style={styles.title}>Create your account</h1>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-row">
            <Field label="First Name" value={form.firstName} onChange={handleChange('firstName')} placeholder="Rahul" required />
            <Field label="Last Name"  value={form.lastName}  onChange={handleChange('lastName')}  placeholder="Sharma" required />
          </div>
          <Field label="Email"    value={form.email}    onChange={handleChange('email')}    type="email"    placeholder="you@example.com" required />
          <Field label="Password" value={form.password} onChange={handleChange('password')} type="password" placeholder="Min 6 characters" required />
          <Field label="Confirm Password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} type="password" placeholder="Repeat password" required />
          <Field label="Phone"   value={form.phone}   onChange={handleChange('phone')}   placeholder="+91 9876543210" />
          <Field label="Address" value={form.address} onChange={handleChange('address')} placeholder="Flat 12, Banjara Hills" />
          <div className="form-row">
            <Field label="City"    value={form.city}    onChange={handleChange('city')}    placeholder="Hyderabad" />
            <Field label="State"   value={form.state}   onChange={handleChange('state')}   placeholder="Telangana" />
          </div>
          <Field label="Pincode" value={form.pincode} onChange={handleChange('pincode')} placeholder="500001" />

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:    { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7', padding: 16 },
  card:    { background: '#fff', padding: '32px 24px', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: 520 },
  header:  { textAlign: 'center', marginBottom: 24 },
  logoIcon:{ fontSize: 42 },
  title:   { fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: '8px 0 0' },
  error:   { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 6, marginBottom: 14, fontSize: 14, border: '1px solid #fed7d7' },
  form:    { display: 'flex', flexDirection: 'column', gap: 10 },
  label:   { display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 4 },
  input:   { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  btn:     { marginTop: 8, padding: '12px', background: '#f5a623', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 16, cursor: 'pointer', color: '#1a1a2e' },
  footer:  { textAlign: 'center', marginTop: 18, fontSize: 14, color: '#666' },
  link:    { color: '#f5a623', textDecoration: 'none', fontWeight: 600 },
};
