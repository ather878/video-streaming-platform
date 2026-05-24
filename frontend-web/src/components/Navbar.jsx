import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, LogOut, Upload, Home as HomeIcon, Bell, Search } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: scrolled ? '#141414' : 'rgba(20,20,20,0.95)',
      borderBottom: '1px solid #222',
      padding: '0 1.5rem',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'background 0.3s',
    }}>
      {/* Left — Logo + Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ color: '#E50914', fontSize: 20, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <Play size={22} fill="#E50914" />
          StreamBox
        </Link>

        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/" style={navLinkStyle}>
              <HomeIcon size={15} /> Home
            </Link>
            <Link to="/upload" style={navLinkStyle}>
              <Upload size={15} /> Upload
            </Link>
          </div>
        )}
      </div>

      {/* Right — Search + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated ? (
          <>
            <Bell size={18} color="#aaa" style={{ cursor: 'pointer' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 4,
                background: '#E50914', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 500, color: 'white'
              }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: 13, color: '#ccc' }}>{user?.username}</span>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'transparent', border: '1px solid #333',
                  color: '#aaa', padding: '5px 12px', borderRadius: 4,
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#E50914'; e.target.style.color = '#fff'; }}
                onMouseLeave={e => { e.target.style.borderColor = '#333'; e.target.style.color = '#aaa'; }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" style={{ fontSize: 13, color: '#aaa', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{
              background: '#E50914', color: 'white',
              padding: '6px 16px', borderRadius: 4,
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
            }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

const navLinkStyle = {
  display: 'flex', alignItems: 'center', gap: 5,
  fontSize: 13, color: '#aaa', textDecoration: 'none',
  transition: 'color 0.15s',
};
