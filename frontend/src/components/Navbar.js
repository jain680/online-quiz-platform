import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatars = {
    wizard: '🧙', knight: '🤺', ninja: '🥷', robot: '🤖',
    alien: '👽', dragon: '🐉', phoenix: '🔥', unicorn: '🦄', crown: '👑'
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span style={{ fontSize: '32px' }}>🎮</span>
        QuizMaster
      </Link>
      
      <div className="navbar-links">
        <Link to="/quizzes">Quizzes</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        
        {user ? (
          <>
            <Link to="/battles">⚔️ Battles</Link>
            <Link to="/shop">🛒 Shop</Link>
            <Link to="/dashboard">Dashboard</Link>
            
            <div className="user-stats">
              <div className="stat-badge coins">
                <span>🪙</span>
                <span>{user.coins}</span>
              </div>
              <div className="stat-badge gems">
                <span>💎</span>
                <span>{user.gems}</span>
              </div>
              <div className="stat-badge streak" title="Daily Streak">
                <span>🔥</span>
                <span>{user.streak?.current || 0}</span>
              </div>
            </div>
            
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="level-badge">{user.level}</div>
              <span style={{ fontSize: '24px' }}>{avatars[user.avatar] || '🧙'}</span>
            </Link>
            
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">
              <button className="btn btn-primary">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
