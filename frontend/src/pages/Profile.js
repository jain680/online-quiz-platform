import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, refreshUser } = useAuth();
  const [titles, setTitles] = useState([]);
  const [avatarList, setAvatarList] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const avatarIcons = {
    wizard: '🧙', knight: '🤺', ninja: '🥷', robot: '🤖',
    alien: '👽', dragon: '🐉', phoenix: '🔥', unicorn: '🦄', crown: '👑'
  };

  useEffect(() => {
    Promise.all([
      api.get('/auth/titles'),
      api.get('/auth/avatars')
    ]).then(([titlesRes, avatarsRes]) => {
      setTitles(titlesRes.data);
      setAvatarList(avatarsRes.data);
    });
  }, []);

  const updateProfile = async (field, value) => {
    try {
      await api.put('/auth/profile', { [field]: value });
      refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const xpForNextLevel = (user.level * 500);
  const currentLevelXp = user.xp - ((user.level - 1) * 500);
  const xpProgress = (currentLevelXp / 500) * 100;

  const allAchievements = [
    { id: 'first_quiz', name: 'First Steps', description: 'Complete your first quiz', icon: '🎯' },
    { id: 'first_perfect', name: 'Perfectionist', description: 'Get 100% on any quiz', icon: '💯' },
    { id: 'five_quizzes', name: 'Getting Started', description: 'Complete 5 quizzes', icon: '📝' },
    { id: 'streak_3', name: 'On Fire', description: '3 day streak', icon: '🔥' },
    { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: '⚡' },
    { id: 'streak_30', name: 'Monthly Master', description: '30 day streak', icon: '👑' },
    { id: 'score_1000', name: 'Point Collector', description: 'Earn 1000 total XP', icon: '⭐' },
    { id: 'score_5000', name: 'XP Hunter', description: 'Earn 5000 total XP', icon: '🌟' },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete quiz under 1 min', icon: '⚡' },
    { id: 'first_battle', name: 'Challenger', description: 'Win your first battle', icon: '⚔️' },
    { id: 'battle_master', name: 'Battle Master', description: 'Win 10 battles', icon: '🏆' },
    { id: 'quiz_creator', name: 'Quiz Creator', description: 'Create your first quiz', icon: '✍️' },
    { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '🌱' },
    { id: 'level_10', name: 'Quiz Pro', description: 'Reach level 10', icon: '🌳' },
    { id: 'level_25', name: 'Quiz Master', description: 'Reach level 25', icon: '🏅' }
  ];

  return (
    <div className="container fade-in">
      {/* Profile Header */}
      <div className="card glow">
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '100px', marginBottom: '15px' }}>
              {avatarIcons[user.avatar]}
            </div>
            <div className="level-badge" style={{ margin: '0 auto', width: '70px', height: '70px', fontSize: '28px' }}>
              {user.level}
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '32px', marginBottom: '5px' }}>{user.name}</h2>
            <p style={{ opacity: 0.7, fontSize: '18px', marginBottom: '20px' }}>{user.title}</p>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Level {user.level} → {user.level + 1}</span>
                <span>{currentLevelXp} / 500 XP</span>
              </div>
              <div className="progress-bar" style={{ height: '12px' }}>
                <div className="progress-fill" style={{ width: `${xpProgress}%` }}></div>
              </div>
            </div>
            
            <div className="flex gap-20">
              <div className="stat-badge xp">
                <span>⭐</span>
                <span>{user.xp.toLocaleString()} Total XP</span>
              </div>
              <div className="stat-badge coins">
                <span>🪙</span>
                <span>{user.coins} Coins</span>
              </div>
              <div className="stat-badge gems">
                <span>💎</span>
                <span>{user.gems} Gems</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2 gap-20">
        {/* Stats */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>📊 Statistics</h3>
          <div className="grid grid-2 gap-10">
            <div style={{ background: 'var(--glass)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#22d3ee' }}>
                {user.stats?.totalQuizzes || 0}
              </div>
              <div style={{ opacity: 0.7 }}>Quizzes Played</div>
            </div>
            <div style={{ background: 'var(--glass)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e' }}>
                {user.stats?.perfectScores || 0}
              </div>
              <div style={{ opacity: 0.7 }}>Perfect Scores</div>
            </div>
            <div style={{ background: 'var(--glass)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#f97316' }}>
                {user.streak?.longest || 0}
              </div>
              <div style={{ opacity: 0.7 }}>Longest Streak</div>
            </div>
            <div style={{ background: 'var(--glass)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#a855f7' }}>
                {user.stats?.battlesWon || 0}
              </div>
              <div style={{ opacity: 0.7 }}>Battles Won</div>
            </div>
          </div>
        </div>

        {/* Select Avatar */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>🎭 Choose Avatar</h3>
          <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
            {avatarList.map(avatar => {
              const isUnlocked = user.level >= avatar.unlockLevel;
              const isSelected = user.avatar === avatar.id;
              return (
                <div
                  key={avatar.id}
                  onClick={() => isUnlocked && updateProfile('avatar', avatar.id)}
                  style={{
                    fontSize: '48px',
                    padding: '15px',
                    background: isSelected ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--glass)',
                    borderRadius: '12px',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    opacity: isUnlocked ? 1 : 0.4,
                    border: isSelected ? '2px solid #fff' : '1px solid var(--glass-border)',
                    transition: 'all 0.3s ease'
                  }}
                  title={isUnlocked ? avatar.name : `Unlock at level ${avatar.unlockLevel}`}
                >
                  {avatar.icon}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>🏆 Achievements ({user.achievements?.length || 0}/{allAchievements.length})</h3>
        <div className="grid grid-4 gap-10">
          {allAchievements.map(achievement => {
            const isUnlocked = user.achievements?.find(a => a.id === achievement.id);
            return (
              <div
                key={achievement.id}
                style={{
                  background: isUnlocked ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))' : 'var(--glass)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  opacity: isUnlocked ? 1 : 0.5,
                  border: isUnlocked ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                  {isUnlocked ? achievement.icon : '🔒'}
                </div>
                <h4 style={{ fontSize: '14px', marginBottom: '5px' }}>{achievement.name}</h4>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>{achievement.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Titles */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>🎖️ Titles</h3>
        <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
          {titles.map(t => {
            const isUnlocked = user.level >= t.level;
            const isSelected = user.title === t.title;
            return (
              <div
                key={t.level}
                onClick={() => isUnlocked && updateProfile('title', t.title)}
                style={{
                  padding: '12px 20px',
                  background: isSelected ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--glass)',
                  borderRadius: '20px',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: isUnlocked ? 1 : 0.4,
                  border: isSelected ? '2px solid #fff' : '1px solid var(--glass-border)',
                  transition: 'all 0.3s ease'
                }}
                title={isUnlocked ? 'Click to select' : `Unlock at level ${t.level}`}
              >
                {t.title}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Profile;
