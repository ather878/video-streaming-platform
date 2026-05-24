import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, AlertCircle } from 'lucide-react';

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(usernameOrEmail, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{
        background: 'rgba(0,0,0,0.75)',
        border: '1px solid #2a2a2a',
        borderRadius: 8,
        padding: '2.5rem',
        width: '100%',
        maxWidth: 400,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2rem' }}>
          <Play size={24} fill="#E50914" color="#E50914" />
          <span style={{ color: '#E50914', fontSize: 20, fontWeight: 500 }}>StreamBox</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 500, color: '#fff', marginBottom: '1.5rem' }}>Sign in</h1>

        {error && (
          <div style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)', color: '#f09595', padding: '10px 14px', borderRadius: 4, marginBottom: '1rem', display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Username or Email</label>
            <input
              type="text"
              value={usernameOrEmail}
              onChange={e => setUsernameOrEmail(e.target.value)}
              required
              placeholder="john_doe or john@example.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px',
              background: loading ? '#555' : '#E50914',
              color: 'white', border: 'none', borderRadius: 4,
              fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem', fontFamily: 'inherit', transition: 'background 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ color: '#777', fontSize: 13, textAlign: 'center', marginTop: '1.5rem' }}>
          New to StreamBox?{' '}
          <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 12, color: '#888',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
};

const inputStyle = {
  width: '100%', background: '#2a2a2a', border: '1px solid #333',
  borderRadius: 4, padding: '10px 14px', fontSize: 14,
  color: '#fff', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box',
};
