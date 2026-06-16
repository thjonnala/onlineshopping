import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Field({ label, name, value, onChange, type = 'text', placeholder, required = false, autoComplete }) {
  return (
    <div>
      <label style={styles.label}>{label}{required && ' *'}</label>
      <input name={name} type={type} required={required} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete || 'off'} style={styles.input} />
    </div>
  );
}

const initialForm = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', address: '', city: 'Hyderabad', state: 'Telangana', pincode: '' };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try { await register(form); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logoIcon}>🕌</span>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join Hyderabad Online Shopping</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-row">
            <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Rahul"  required autoComplete="given-name" />
            <Field label="Last Name"  name="lastName"  value={form.lastName}  onChange={handleChange} placeholder="Sharma" required autoComplete="family-name" />
          </div>
          <Field label="Email"            name="email"           value={form.email}           onChange={handleChange} type="email"    placeholder="you@example.com"  required autoComplete="email" />
          <Field label="Password"         name="password"        value={form.password}        onChange={handleChange} type="password" placeholder="Min 6 characters" required autoComplete="new-password" />
          <Field label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} type="password" placeholder="Repeat password"   required autoComplete="new-password" />
          <Field label="Phone"   name="phone"   value={form.phone}   onChange={handleChange} placeholder="+91 9876543210"       autoComplete="tel" />
          <Field label="Address" name="address" value={form.address} onChange={handleChange} placeholder="Flat 12, Banjara Hills" autoComplete="street-address" />
          <div className="form-row">
            <Field label="City"  name="city"  value={form.city}  onChange={handleChange} placeholder="Hyderabad" autoComplete="address-level2" />
            <Field label="State" name="state" value={form.state} onChange={handleChange} placeholder="Telangana" autoComplete="address-level1" />
          </div>
          <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="500001" autoComplete="postal-code" />

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
  page:     { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: 16 },
  card:     { background: '#fff', padding: '32px 24px', borderRadius: 8, border: '1px solid #e0e0e0', width: '100%', maxWidth: 520, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  header:   { textAlign: 'center', marginBottom: 24 },
  logoIcon: { fontSize: 42 },
  title:    { fontSize: 22, fontWeight: 700, color: '#212121', margin: '8px 0 4px' },
  subtitle: { fontSize: 14, color: '#757575', margin: 0 },
  error:    { background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: 4, marginBottom: 14, fontSize: 14, border: '1px solid #ef9a9a' },
  form:     { display: 'flex', flexDirection: 'column', gap: 10 },
  label:    { display: 'block', fontSize: 13, fontWeight: 600, color: '#424242', marginBottom: 4 },
  input:    { width: '100%', padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  btn:      { marginTop: 8, padding: '12px', background: '#1a73e8', border: 'none', borderRadius: 4, fontWeight: 700, fontSize: 15, cursor: 'pointer', color: '#fff' },
  footer:   { textAlign: 'center', marginTop: 18, fontSize: 14, color: '#757575' },
  link:     { color: '#1a73e8', textDecoration: 'none', fontWeight: 600 },
};
