import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [recentResults, setRecentResults] = useState([]);
  const [dailyQuiz, setDailyQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [dailyReward, setDailyReward] = useState(null);

  const avatars = {
    wizard: '🧙', knight: '🤺', ninja: '🥷', robot: '🤖',
    alien: '👽', dragon: '🐉', phoenix: '🔥', unicorn: '🦄', crown: '👑'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsRes, dailyRes] = await Promise.all([
          api.get('/results/my-results'),
          api.get('/quizzes/daily')
        ]);
        setRecentResults(resultsRes.data.slice(0, 5));
        setDailyQuiz(dailyRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const claimDailyReward = async () => {
    try {
      const res = await api.post('/shop/daily-reward');
      setDailyReward(res.data);
      setDailyClaimed(true);
      refreshUser();
    } catch (error) {
      if (error.response?.data?.message === 'Already claimed today') {
        setDailyClaimed(true);
      }
    }
  };

  const xpForNextLevel = (user.level * 500);
  const currentLevelXp = user.xp - ((user.level - 1) * 500);
  const xpProgress = (currentLevelXp / 500) * 100;

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container fade-in">
      {/* User Profile Card */}
      <div className="card glow" style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '80px', marginBottom: '10px' }}>{avatars[user.avatar]}</div>
          <div className="level-badge" style={{ margin: '0 auto', width: '60px', height: '60px', fontSize: '24px' }}>
            {user.level}
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '5px' }}>{user.name}</h2>
          <p style={{ opacity: 0.7, marginBottom: '15px' }}>{user.title}</p>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Level {user.level}</span>
              <span>{currentLevelXp} / 500 XP</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${xpProgress}%` }}></div>
            </div>
          </div>
          
          <div className="flex gap-20">
            <div>
              <span style={{ fontSize: '24px', fontWeight: '700' }}>{user.stats?.totalQuizzes || 0}</span>
              <span style={{ opacity: 0.7, marginLeft: '8px' }}>Quizzes</span>
            </div>
            <div>
              <span style={{ fontSize: '24px', fontWeight: '700' }}>{user.stats?.perfectScores || 0}</span>
              <span style={{ opacity: 0.7, marginLeft: '8px' }}>Perfect</span>
            </div>
            <div>
              <span style={{ fontSize: '24px', fontWeight: '700' }}>{user.achievements?.length || 0}</span>
              <span style={{ opacity: 0.7, marginLeft: '8px' }}>Achievements</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/quizzes">
            <button className="btn btn-primary">🎮 Play Quiz</button>
          </Link>
          <Link to="/create-quiz">
            <button className="btn btn-secondary">✍️ Create Quiz</button>
          </Link>
        </div>
      </div>

      <div className="grid grid-2 gap-20">
        {/* Daily Reward */}
        <div className="card glow-gold">
          <h3 style={{ marginBottom: '20px' }}>🎁 Daily Reward</h3>
          {dailyReward ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎉</div>
              <h4>Reward Claimed!</h4>
              <div className="flex flex-center gap-20 mt-20">
                <div><span style={{ fontSize: '24px' }}>🪙</span> +{dailyReward.coins}</div>
                {dailyReward.gems > 0 && <div><span style={{ fontSize: '24px' }}>💎</span> +{dailyReward.gems}</div>}
                <div><span style={{ fontSize: '24px' }}>⭐</span> +{dailyReward.xp} XP</div>
              </div>
            </div>
          ) : dailyClaimed ? (
            <div style={{ textAlign: 'center', opacity: 0.7 }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
              <p>Come back tomorrow for more rewards!</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '15px', opacity: 0.8 }}>
                🔥 {user.streak?.current || 0} day streak bonus!
              </p>
              <button className="btn btn-gold" onClick={claimDailyReward}>
                Claim Reward
              </button>
            </div>
          )}
        </div>

        {/* Daily Challenge */}
        {dailyQuiz && (
          <div className="card glow-pink">
            <h3 style={{ marginBottom: '20px' }}>⚡ Daily Challenge</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '56px' }}>{dailyQuiz.icon || '📚'}</div>
              <div style={{ flex: 1 }}>
                <h4>{dailyQuiz.title}</h4>
                <p style={{ opacity: 0.7, marginTop: '5px' }}>
                  {dailyQuiz.questions?.length} questions • {dailyQuiz.timeLimit} min
                </p>
                <div style={{ marginTop: '10px' }}>
                  <span className={`badge badge-${dailyQuiz.difficulty}`}>{dailyQuiz.difficulty}</span>
                  <span style={{ color: '#22c55e' }}>+{dailyQuiz.xpReward * 2} XP</span>
                </div>
              </div>
              <Link to={`/quiz/${dailyQuiz._id}`}>
                <button className="btn btn-primary">Play</button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-2 gap-20">
        {/* Power-ups */}
        <div className="card">
          <div className="flex flex-between items-center mb-20">
            <h3>⚡ Power-Ups</h3>
            <Link to="/shop" style={{ color: '#818cf8' }}>Get More →</Link>
          </div>
          <div className="flex gap-10">
            <div className="power-up">
              <div className="icon">🎯</div>
              <div className="count">{user.powerUps?.fiftyFifty || 0}</div>
              <small style={{ opacity: 0.7 }}>50/50</small>
            </div>
            <div className="power-up">
              <div className="icon">❄️</div>
              <div className="count">{user.powerUps?.freezeTime || 0}</div>
              <small style={{ opacity: 0.7 }}>Freeze</small>
            </div>
            <div className="power-up">
              <div className="icon">⏭️</div>
              <div className="count">{user.powerUps?.skipQuestion || 0}</div>
              <small style={{ opacity: 0.7 }}>Skip</small>
            </div>
            <div className="power-up">
              <div className="icon">✨</div>
              <div className="count">{user.powerUps?.doubleXp || 0}</div>
              <small style={{ opacity: 0.7 }}>2x XP</small>
            </div>
            <div className="power-up">
              <div className="icon">🛡️</div>
              <div className="count">{user.powerUps?.shield || 0}</div>
              <small style={{ opacity: 0.7 }}>Shield</small>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="card">
          <div className="flex flex-between items-center mb-20">
            <h3>🏆 Achievements</h3>
            <Link to="/profile" style={{ color: '#818cf8' }}>View All →</Link>
          </div>
          {user.achievements?.length > 0 ? (
            <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
              {user.achievements.slice(-5).map((a, i) => (
                <div key={i} title={a.name} style={{ 
                  fontSize: '36px', 
                  padding: '10px',
                  background: 'var(--glass)',
                  borderRadius: '12px'
                }}>
                  {a.icon}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ opacity: 0.7 }}>Complete quizzes to unlock achievements!</p>
          )}
        </div>
      </div>

      {/* Recent Results */}
      <div className="card">
        <div className="flex flex-between items-center mb-20">
          <h3>📊 Recent Results</h3>
          <Link to="/results" style={{ color: '#818cf8' }}>View All →</Link>
        </div>
        {recentResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
            <p>No quizzes completed yet. Start playing!</p>
          </div>
        ) : (
          recentResults.map(result => (
            <div key={result._id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '15px',
              background: 'var(--glass)',
              borderRadius: '12px',
              marginBottom: '10px'
            }}>
              <div>
                <h4>{result.quiz?.title || 'Quiz'}</h4>
                <small style={{ opacity: 0.7 }}>
                  {new Date(result.completedAt).toLocaleDateString()}
                  {result.isPerfect && <span style={{ color: '#f59e0b', marginLeft: '10px' }}>⭐ Perfect!</span>}
                </small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {result.maxCombo > 2 && (
                  <span style={{ color: '#f97316' }}>🔥 {result.maxCombo}x combo</span>
                )}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: '700',
                    color: result.percentage >= 70 ? '#22c55e' : result.percentage >= 40 ? '#f59e0b' : '#ef4444'
                  }}>
                    {result.percentage}%
                  </div>
                  <small style={{ opacity: 0.7 }}>+{result.xpEarned} XP</small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
