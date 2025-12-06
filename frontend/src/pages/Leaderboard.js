import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const avatars = {
    wizard: '🧙', knight: '🤺', ninja: '🥷', robot: '🤖',
    alien: '👽', dragon: '🐉', phoenix: '🔥', unicorn: '🦄', crown: '👑'
  };

  useEffect(() => {
    api.get('/auth/leaderboard').then(res => {
      setUsers(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container fade-in">
      <div className="card glow" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '10px' }}>🏆 Global Leaderboard</h2>
        <p style={{ opacity: 0.7 }}>Top players ranked by XP</p>
      </div>

      {/* Top 3 */}
      <div className="flex flex-center gap-20" style={{ marginBottom: '40px' }}>
        {users.slice(0, 3).map((user, idx) => {
          const positions = [
            { order: 1, size: '160px', medal: '🥇', glow: 'glow-gold' },
            { order: 0, size: '140px', medal: '🥈', glow: '' },
            { order: 2, size: '140px', medal: '🥉', glow: '' }
          ];
          const pos = positions[idx];
          
          return (
            <div 
              key={user._id} 
              className={`card ${pos.glow}`}
              style={{ 
                textAlign: 'center', 
                padding: '30px', 
                order: pos.order,
                transform: idx === 0 ? 'scale(1.1)' : 'none'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>{pos.medal}</div>
              <div style={{ fontSize: '64px' }}>{avatars[user.avatar] || '🧙'}</div>
              <div className="level-badge" style={{ margin: '15px auto' }}>{user.level}</div>
              <h3>{user.name}</h3>
              <p style={{ opacity: 0.7, marginTop: '5px' }}>{user.title}</p>
              <div style={{ 
                marginTop: '15px', 
                fontSize: '24px', 
                fontWeight: '700',
                color: '#22d3ee'
              }}>
                ⭐ {user.xp.toLocaleString()} XP
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of leaderboard */}
      <div className="card">
        {users.slice(3).map((user, idx) => (
          <div key={user._id} className={`leaderboard-item ${idx < 7 ? 'top-10' : ''}`}>
            <div className="rank" style={{ 
              background: 'var(--glass)',
              color: idx < 7 ? '#fbbf24' : 'inherit'
            }}>
              {idx + 4}
            </div>
            <div style={{ fontSize: '36px' }}>{avatars[user.avatar] || '🧙'}</div>
            <div style={{ flex: 1 }}>
              <h4>{user.name}</h4>
              <small style={{ opacity: 0.7 }}>Level {user.level} • {user.title}</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', color: '#22d3ee' }}>
                ⭐ {user.xp.toLocaleString()} XP
              </div>
              <small style={{ opacity: 0.7 }}>
                {user.stats?.totalQuizzes || 0} quizzes
              </small>
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
            No players yet. Be the first!
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
