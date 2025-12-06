import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Battles() {
  const { user } = useAuth();
  const [openBattles, setOpenBattles] = useState([]);
  const [myBattles, setMyBattles] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState('');

  const avatars = {
    wizard: '🧙', knight: '🤺', ninja: '🥷', robot: '🤖',
    alien: '👽', dragon: '🐉', phoenix: '🔥', unicorn: '🦄', crown: '👑'
  };

  useEffect(() => {
    Promise.all([
      api.get('/battles/open'),
      api.get('/battles/my-battles'),
      api.get('/quizzes')
    ]).then(([openRes, myRes, quizzesRes]) => {
      setOpenBattles(openRes.data);
      setMyBattles(myRes.data);
      setQuizzes(quizzesRes.data);
      setLoading(false);
    });
  }, []);

  const createBattle = async () => {
    if (!selectedQuiz) return;
    setCreating(true);
    try {
      await api.post('/battles/challenge', { quizId: selectedQuiz });
      const res = await api.get('/battles/my-battles');
      setMyBattles(res.data);
      setSelectedQuiz('');
    } catch (error) {
      console.error('Error creating battle:', error);
    } finally {
      setCreating(false);
    }
  };

  const joinBattle = async (battleId) => {
    try {
      await api.post(`/battles/${battleId}/join`);
      const [openRes, myRes] = await Promise.all([
        api.get('/battles/open'),
        api.get('/battles/my-battles')
      ]);
      setOpenBattles(openRes.data);
      setMyBattles(myRes.data);
    } catch (error) {
      console.error('Error joining battle:', error);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container fade-in">
      <div className="card glow" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '10px' }}>⚔️ Battle Arena</h2>
        <p style={{ opacity: 0.7, marginBottom: '20px' }}>
          Challenge other players to quiz battles and prove your knowledge!
        </p>
        
        <div className="flex flex-center gap-20">
          <div style={{ background: 'var(--glass)', padding: '20px 30px', borderRadius: '12px' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#22c55e' }}>
              {user.stats?.battlesWon || 0}
            </div>
            <div style={{ opacity: 0.7 }}>Battles Won</div>
          </div>
          <div style={{ background: 'var(--glass)', padding: '20px 30px', borderRadius: '12px' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#22d3ee' }}>
              {user.stats?.battlesPlayed || 0}
            </div>
            <div style={{ opacity: 0.7 }}>Battles Played</div>
          </div>
          <div style={{ background: 'var(--glass)', padding: '20px 30px', borderRadius: '12px' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#f97316' }}>
              {user.stats?.winStreak || 0}
            </div>
            <div style={{ opacity: 0.7 }}>Win Streak</div>
          </div>
        </div>
      </div>

      {/* Create Battle */}
      <div className="card glow-pink">
        <h3 style={{ marginBottom: '20px' }}>🎮 Create a Battle</h3>
        <div className="flex gap-10">
          <select
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            style={{
              flex: 1,
              padding: '14px 18px',
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              color: '#fff'
            }}
          >
            <option value="">Select a quiz...</option>
            {quizzes.map(quiz => (
              <option key={quiz._id} value={quiz._id}>
                {quiz.title} ({quiz.category})
              </option>
            ))}
          </select>
          <button 
            className="btn btn-primary"
            onClick={createBattle}
            disabled={!selectedQuiz || creating}
          >
            {creating ? 'Creating...' : '⚔️ Create Battle'}
          </button>
        </div>
        <p style={{ marginTop: '10px', opacity: 0.7, fontSize: '14px' }}>
          Create a battle and wait for someone to join, or join an open battle below!
        </p>
      </div>

      <div className="grid grid-2 gap-20">
        {/* Open Battles */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>🔥 Open Battles</h3>
          {openBattles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏜️</div>
              <p>No open battles. Create one!</p>
            </div>
          ) : (
            openBattles.map(battle => (
              <div key={battle._id} style={{ 
                background: 'var(--glass)', 
                padding: '20px', 
                borderRadius: '12px',
                marginBottom: '15px'
              }}>
                <div className="flex flex-between items-center">
                  <div className="flex items-center gap-10">
                    <span style={{ fontSize: '36px' }}>
                      {avatars[battle.challenger?.user?.avatar] || '🧙'}
                    </span>
                    <div>
                      <h4>{battle.challenger?.user?.name}</h4>
                      <small style={{ opacity: 0.7 }}>
                        Level {battle.challenger?.user?.level}
                      </small>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px' }}>{battle.quiz?.icon || '📚'}</div>
                    <small style={{ opacity: 0.7 }}>{battle.quiz?.title}</small>
                  </div>
                  <button 
                    className="btn btn-success"
                    onClick={() => joinBattle(battle._id)}
                  >
                    Join Battle
                  </button>
                </div>
                <div style={{ marginTop: '10px', fontSize: '14px', opacity: 0.7 }}>
                  🏆 Win: +{battle.xpReward} XP, +{battle.coinReward} coins
                </div>
              </div>
            ))
          )}
        </div>

        {/* My Battles */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>📋 My Battles</h3>
          {myBattles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
              <p>No battles yet. Create or join one!</p>
            </div>
          ) : (
            myBattles.slice(0, 5).map(battle => {
              const isChallenger = battle.challenger?.user?._id === user.id;
              const opponent = isChallenger ? battle.opponent?.user : battle.challenger?.user;
              const myScore = isChallenger ? battle.challenger?.score : battle.opponent?.score;
              const theirScore = isChallenger ? battle.opponent?.score : battle.challenger?.score;
              const didWin = battle.winner?._id === user.id || battle.winner === user.id;
              
              return (
                <div key={battle._id} style={{ 
                  background: 'var(--glass)', 
                  padding: '20px', 
                  borderRadius: '12px',
                  marginBottom: '15px',
                  borderLeft: `4px solid ${
                    battle.status === 'completed' 
                      ? (didWin ? '#22c55e' : '#ef4444')
                      : battle.status === 'active' ? '#f59e0b' : '#6366f1'
                  }`
                }}>
                  <div className="flex flex-between items-center">
                    <div>
                      <span className={`badge badge-${
                        battle.status === 'completed' ? (didWin ? 'easy' : 'hard') :
                        battle.status === 'active' ? 'medium' : 'category'
                      }`}>
                        {battle.status === 'completed' 
                          ? (didWin ? '🏆 Won' : '❌ Lost')
                          : battle.status === 'active' ? '⏳ Active' : '⏳ Waiting'
                        }
                      </span>
                      <h4 style={{ marginTop: '10px' }}>{battle.quiz?.title}</h4>
                    </div>
                    {opponent && (
                      <div className="flex items-center gap-10">
                        <span>vs</span>
                        <span style={{ fontSize: '24px' }}>{avatars[opponent.avatar] || '🧙'}</span>
                        <span>{opponent.name}</span>
                      </div>
                    )}
                    {battle.status === 'active' && (
                      <Link to={`/quiz/${battle.quiz?._id}?battle=${battle._id}`}>
                        <button className="btn btn-primary">Play</button>
                      </Link>
                    )}
                  </div>
                  {battle.status === 'completed' && (
                    <div style={{ marginTop: '10px', fontSize: '14px' }}>
                      Score: {myScore || 0} vs {theirScore || 0}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Battles;
